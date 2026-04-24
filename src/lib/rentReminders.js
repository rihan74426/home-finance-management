import "server-only";

/**
 * Rent Reminder Job
 *
 * Finds all LedgerEntries that are:
 *   - status = 'pending' or 'partial'
 *   - dueDate is 3 days from now (±1 day window)
 *   - OR dueDate is today
 *   - OR dueDate has passed (overdue)
 *
 * For each, sends:
 *   - In-app notification (always)
 *   - Email (if user email is real)
 *   - SMS (if user has phone)
 *
 * Call this from: /api/cron/rent-reminders
 * Recommended: run daily at 9am via Vercel Cron or external scheduler
 */

import connectDB from "@/lib/db/mongoose";
import LedgerEntry from "@/models/Ledgerentry";
import Membership from "@/models/Membership";
import User from "@/models/User";
import House from "@/models/House";
import Notification from "@/models/Notification";
import { PAYMENT_STATUS, NOTIFICATION_TYPE } from "@/lib/constants";
import { sendRentReminderEmail, sendRentOverdueEmail } from "@/lib/email";
import { sendRentReminderSMS, sendRentOverdueSMS } from "@/lib/sms";

export async function runRentReminders() {
  await connectDB();

  const now = new Date();
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const startOfThreeDays = new Date(threeDaysFromNow);
  startOfThreeDays.setHours(0, 0, 0, 0);
  const endOfThreeDays = new Date(threeDaysFromNow);
  endOfThreeDays.setHours(23, 59, 59, 999);

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const pendingStatuses = [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PARTIAL];

  // Find entries due in 3 days (reminder)
  const upcomingEntries = await LedgerEntry.find({
    status: { $in: pendingStatuses },
    dueDate: { $gte: startOfThreeDays, $lte: endOfThreeDays },
  })
    .populate({
      path: "membershipId",
      populate: { path: "userId", select: "name email phone" },
    })
    .populate("houseId", "name currency")
    .lean();

  // Find entries due today (urgent reminder)
  const dueTodayEntries = await LedgerEntry.find({
    status: { $in: pendingStatuses },
    dueDate: { $gte: startOfToday, $lte: endOfToday },
  })
    .populate({
      path: "membershipId",
      populate: { path: "userId", select: "name email phone" },
    })
    .populate("houseId", "name currency")
    .lean();

  // Find overdue entries (first-time overdue only — check if already notified today)
  const overdueEntries = await LedgerEntry.find({
    status: PAYMENT_STATUS.OVERDUE,
    dueDate: { $lt: startOfToday },
  })
    .populate({
      path: "membershipId",
      populate: { path: "userId", select: "name email phone" },
    })
    .populate("houseId", "name currency")
    .lean();

  let sent = 0;
  const errors = [];

  async function notify(entry, type, isOverdue = false) {
    const member = entry.membershipId?.userId;
    const house = entry.houseId;
    if (!member || !house) return;

    // Dedup: check if we already sent this type of notification in the last 23 hours
    const recentNotif = await Notification.findOne({
      userId: member._id,
      houseId: house._id,
      type,
      createdAt: { $gte: new Date(Date.now() - 23 * 60 * 60 * 1000) },
      "meta.entryId": String(entry._id),
    }).lean();
    if (recentNotif) return;

    // In-app notification
    await Notification.create({
      userId: member._id,
      houseId: house._id,
      type,
      title: isOverdue
        ? `Rent overdue — ${house.name}`
        : `Rent due soon — ${house.name}`,
      body: isOverdue
        ? `Your payment of ${fmtAmount(entry.amountDue, house.currency)} is overdue.`
        : `Your payment of ${fmtAmount(entry.amountDue, house.currency)} is due on ${fmtDate(entry.dueDate)}.`,
      meta: { entryId: entry._id },
    }).catch(() => {});

    // Email
    const email = member.email;
    if (email && !email.includes("placeholder.homy")) {
      const emailFn = isOverdue ? sendRentOverdueEmail : sendRentReminderEmail;
      // sendRentOverdueEmail may not exist, fall back gracefully
      if (emailFn) {
        emailFn({
          to: email,
          name: member.name,
          houseName: house.name,
          amountDue: entry.amountDue,
          currency: house.currency,
          dueDate: entry.dueDate,
          periodLabel: entry.label,
        }).catch(() => {});
      }
    }

    // SMS
    if (member.phone) {
      const smsFn = isOverdue ? sendRentOverdueSMS : sendRentReminderSMS;
      smsFn({
        to: member.phone,
        name: member.name,
        houseName: house.name,
        dueDate: entry.dueDate,
        amountDue: entry.amountDue,
        currency: house.currency,
      }).catch(() => {});
    }

    sent++;
  }

  for (const entry of upcomingEntries) {
    await notify(entry, NOTIFICATION_TYPE.RENT_DUE, false);
  }
  for (const entry of dueTodayEntries) {
    await notify(entry, NOTIFICATION_TYPE.RENT_DUE, false);
  }
  for (const entry of overdueEntries) {
    await notify(entry, NOTIFICATION_TYPE.RENT_OVERDUE, true);
  }

  return {
    sent,
    upcoming: upcomingEntries.length,
    dueToday: dueTodayEntries.length,
    overdue: overdueEntries.length,
  };
}

function fmtAmount(amount, currency) {
  if (!amount) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "BDT",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  } catch {
    return String(amount / 100);
  }
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

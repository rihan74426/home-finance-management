import "server-only";

/**
 * SMS service via Twilio
 * Install: npm install twilio
 * Env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function sendSMS({ to, body }) {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    console.warn("[sms] Twilio not configured — skipping SMS to", to);
    return { success: false, error: "SMS not configured" };
  }

  // Normalize phone number — ensure it starts with +
  const phone = to.startsWith("+") ? to : `+${to}`;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
    const params = new URLSearchParams({
      To: phone,
      From: TWILIO_FROM,
      Body: body,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64")}`,
      },
      body: params.toString(),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[sms] Twilio error:", data);
      return { success: false, error: data.message };
    }
    return { success: true, sid: data.sid };
  } catch (err) {
    console.error("[sms] Send failed:", err.message);
    return { success: false, error: err.message };
  }
}

// ── SMS templates ────────────────────────────────────────────────────────────

export async function sendInviteSMS({ to, inviterName, houseName, inviteUrl }) {
  const body = `${inviterName} invited you to join ${houseName} on Homy.\n\nAccept: ${inviteUrl}\n\nExpires in 7 days.`;
  return sendSMS({ to, body });
}

export async function sendRentReminderSMS({
  to,
  name,
  houseName,
  dueDate,
  amountDue,
  currency,
}) {
  const dueDateStr = new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const amount = amountDue
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "BDT",
        maximumFractionDigits: 0,
      }).format(amountDue / 100)
    : null;

  const body = `Homy reminder: ${name ? `Hi ${name}, y` : "Y"}our rent for ${houseName} is due on ${dueDateStr}.${amount ? ` Amount: ${amount}.` : ""}\n\nView: ${APP_URL}/dashboard`;
  return sendSMS({ to, body });
}

export async function sendRentOverdueSMS({
  to,
  name,
  houseName,
  amountDue,
  currency,
}) {
  const amount = amountDue
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "BDT",
        maximumFractionDigits: 0,
      }).format(amountDue / 100)
    : null;

  const body = `Homy: ${name ? `Hi ${name}, y` : "Y"}our rent for ${houseName} is overdue.${amount ? ` Amount: ${amount}.` : ""} Please pay as soon as possible.\n\n${APP_URL}/dashboard`;
  return sendSMS({ to, body });
}

export async function sendMemberJoinedSMS({ to, newMemberName, houseName }) {
  const body = `Homy: ${newMemberName} just joined ${houseName}. View members: ${APP_URL}/dashboard`;
  return sendSMS({ to, body });
}

import "server-only";

/**
 * Email service via Resend
 * Install: npm install resend
 * Env var: RESEND_API_KEY
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "Homy <noreply@homy.app>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function sendEmail({ to, subject, html, text }) {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email to", to);
    return { success: false, error: "Email not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html, text }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[email] Resend error:", data);
      return { success: false, error: data.message };
    }
    return { success: true, id: data.id };
  } catch (err) {
    console.error("[email] Send failed:", err.message);
    return { success: false, error: err.message };
  }
}

// ── Email templates ──────────────────────────────────────────────────────────

export async function sendInviteEmail({
  to,
  name,
  inviterName,
  houseName,
  houseType,
  houseCity,
  role,
  inviteUrl,
  expiresAt,
}) {
  const subject = `${inviterName} invited you to join ${houseName} on Homy`;
  const expiry = new Date(expiresAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080c12;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#0e1520;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    
    <!-- Header -->
    <div style="padding:28px 32px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
      <div style="font-size:1.3rem;font-weight:900;color:#f0ede8;letter-spacing:-0.02em;">🏠 Homy</div>
      <div style="font-size:0.8rem;color:#8a8fa8;margin-top:3px;">Your home, finally organized.</div>
    </div>
    
    <!-- Body -->
    <div style="padding:28px 32px;">
      <h1 style="font-size:1.2rem;font-weight:800;color:#f0ede8;margin:0 0 12px;letter-spacing:-0.01em;">
        You're invited to join a household!
      </h1>
      <p style="color:#8a8fa8;font-size:0.9rem;line-height:1.6;margin:0 0 24px;">
        <strong style="color:#f0ede8;">${inviterName}</strong> has invited ${name ? `<strong style="color:#f0ede8;">${name}</strong>` : "you"} to join <strong style="color:#f0ede8;">${houseName}</strong> as a <strong style="color:#2dd4bf;">${role}</strong>.
      </p>
      
      <!-- House card -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px 18px;margin-bottom:24px;">
        <div style="font-weight:700;font-size:1rem;color:#f0ede8;margin-bottom:4px;">${houseName}</div>
        <div style="font-size:0.8rem;color:#8a8fa8;">${houseType || "House"}${houseCity ? ` · ${houseCity}` : ""}</div>
        <div style="margin-top:10px;">
          <span style="font-size:0.72rem;font-weight:600;padding:3px 10px;border-radius:50px;color:#2dd4bf;background:rgba(45,212,191,0.1);border:1px solid rgba(45,212,191,0.22);">
            Joining as ${role}
          </span>
        </div>
      </div>
      
      <!-- CTA -->
      <a href="${inviteUrl}" style="display:block;text-align:center;padding:14px 24px;background:#e8621a;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:0.95rem;box-shadow:0 4px 16px rgba(232,98,26,0.35);">
        Accept Invite →
      </a>
      
      <p style="color:#4a506a;font-size:0.75rem;text-align:center;margin:16px 0 0;">
        This invite expires on ${expiry}. If you didn't expect this, you can ignore it.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);">
      <p style="color:#4a506a;font-size:0.72rem;margin:0;">© 2025 Homy · No ads. No data selling. Always.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `${inviterName} invited you to join ${houseName} on Homy.\n\nAccept invite: ${inviteUrl}\n\nExpires: ${expiry}`;

  return sendEmail({ to, subject, html, text });
}

export async function sendRentReminderEmail({
  to,
  name,
  houseName,
  amountDue,
  currency,
  dueDate,
  periodLabel,
}) {
  const subject = `Rent reminder: ${periodLabel || "payment"} due soon — ${houseName}`;
  const dueDateStr = new Date(dueDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const amount = amountDue
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "BDT",
        maximumFractionDigits: 0,
      }).format(amountDue / 100)
    : null;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080c12;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#0e1520;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    <div style="padding:28px 32px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
      <div style="font-size:1.3rem;font-weight:900;color:#f0ede8;">🏠 Homy</div>
    </div>
    <div style="padding:28px 32px;">
      <h1 style="font-size:1.1rem;font-weight:800;color:#fbbf24;margin:0 0 12px;">⚠️ Rent Due Soon</h1>
      <p style="color:#8a8fa8;font-size:0.9rem;line-height:1.6;margin:0 0 20px;">
        Hi ${name || "there"}, this is a reminder that your rent payment for <strong style="color:#f0ede8;">${houseName}</strong> is due on <strong style="color:#f0ede8;">${dueDateStr}</strong>.
      </p>
      ${
        amount
          ? `<div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:10px;padding:14px 18px;margin-bottom:20px;">
        <div style="font-size:0.72rem;color:#8a8fa8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Amount Due</div>
        <div style="font-size:1.5rem;font-weight:900;color:#fbbf24;">${amount}</div>
      </div>`
          : ""
      }
      <a href="${APP_URL}/dashboard" style="display:block;text-align:center;padding:13px 24px;background:#e8621a;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:0.9rem;">
        View Ledger →
      </a>
    </div>
    <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);">
      <p style="color:#4a506a;font-size:0.72rem;margin:0;">© 2025 Homy</p>
    </div>
  </div>
</body>
</html>`;

  const text = `Rent reminder: Your payment for ${houseName} is due on ${dueDateStr}.${amount ? ` Amount: ${amount}` : ""}\n\nView ledger: ${APP_URL}/dashboard`;

  return sendEmail({ to, subject, html, text });
}

export async function sendRentPaidEmail({
  to,
  name,
  houseName,
  amountPaid,
  currency,
  label,
}) {
  const subject = `Payment confirmed — ${houseName}`;
  const amount = amountPaid
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "BDT",
        maximumFractionDigits: 0,
      }).format(amountPaid / 100)
    : null;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080c12;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#0e1520;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    <div style="padding:28px 32px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
      <div style="font-size:1.3rem;font-weight:900;color:#f0ede8;">🏠 Homy</div>
    </div>
    <div style="padding:28px 32px;">
      <h1 style="font-size:1.1rem;font-weight:800;color:#4ade80;margin:0 0 12px;">✓ Payment Confirmed</h1>
      <p style="color:#8a8fa8;font-size:0.9rem;line-height:1.6;margin:0 0 20px;">
        Hi ${name || "there"}, your payment <strong style="color:#f0ede8;">${label || "rent"}</strong> for <strong style="color:#f0ede8;">${houseName}</strong> has been recorded.
      </p>
      ${
        amount
          ? `<div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:10px;padding:14px 18px;margin-bottom:20px;">
        <div style="font-size:0.72rem;color:#8a8fa8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Amount Paid</div>
        <div style="font-size:1.5rem;font-weight:900;color:#4ade80;">${amount}</div>
      </div>`
          : ""
      }
      <a href="${APP_URL}/dashboard" style="display:block;text-align:center;padding:13px 24px;background:#e8621a;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;">View Ledger →</a>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject,
    html,
    text: `Payment confirmed for ${houseName}.${amount ? ` Amount: ${amount}` : ""}`,
  });
}

export async function sendMemberJoinedEmail({
  to,
  name,
  houseName,
  newMemberName,
  role,
}) {
  const subject = `${newMemberName} joined ${houseName}`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080c12;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#0e1520;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
    <div style="padding:28px 32px 20px;border-bottom:1px solid rgba(255,255,255,0.06);">
      <div style="font-size:1.3rem;font-weight:900;color:#f0ede8;">🏠 Homy</div>
    </div>
    <div style="padding:28px 32px;">
      <p style="color:#8a8fa8;font-size:0.9rem;line-height:1.6;">
        <strong style="color:#f0ede8;">${newMemberName}</strong> has joined <strong style="color:#f0ede8;">${houseName}</strong> as a <strong style="color:#2dd4bf;">${role}</strong>.
      </p>
      <a href="${APP_URL}/dashboard" style="display:block;text-align:center;padding:13px 24px;background:#e8621a;color:#fff;text-decoration:none;border-radius:12px;font-weight:700;margin-top:20px;">View Members →</a>
    </div>
  </div>
</body>
</html>`;
  return sendEmail({
    to,
    subject,
    html,
    text: `${newMemberName} joined ${houseName} as ${role}.`,
  });
}

import { runRentReminders } from "@/lib/jobs/rentReminders";

/**
 * GET /api/cron/rent-reminders
 *
 * Called daily by Vercel Cron or an external scheduler.
 * Secured by CRON_SECRET header.
 *
 * Vercel cron.json:
 * {
 *   "crons": [
 *     { "path": "/api/cron/rent-reminders", "schedule": "0 9 * * *" }
 *   ]
 * }
 *
 * Set env var: CRON_SECRET=<random-secret>
 * Vercel automatically sends Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, require CRON_SECRET. In dev, allow open access.
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runRentReminders();
    console.log("[cron] rent-reminders:", result);
    return Response.json({ success: true, ...result });
  } catch (err) {
    console.error("[cron] rent-reminders failed:", err.message);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

import "server-only";

/**
 * Firebase Cloud Messaging — server-side push notifications
 *
 * Env vars needed:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   (the private key from service account JSON)
 *
 * Or alternatively:
 *   FIREBASE_SERVICE_ACCOUNT_JSON  (the full service account JSON as a string)
 */

let _accessToken = null;
let _tokenExpiry = 0;

async function getAccessToken() {
  // Return cached token if still valid (expire 5 min early)
  if (_accessToken && Date.now() < _tokenExpiry - 300000) return _accessToken;

  let projectId, clientEmail, privateKey;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      projectId = sa.project_id;
      clientEmail = sa.client_email;
      privateKey = sa.private_key;
    } catch {
      return null;
    }
  } else {
    projectId = process.env.FIREBASE_PROJECT_ID;
    clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("[fcm] Firebase not configured");
    return null;
  }

  // Create JWT for Google OAuth2
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      sub: clientEmail,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
    })
  ).toString("base64url");

  // Sign with RS256 using Web Crypto
  const keyData = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryKey = Buffer.from(keyData, "base64");
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigInput = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(sigInput)
  );
  const sig = Buffer.from(signature).toString("base64url");
  const jwt = `${sigInput}.${sig}`;

  // Exchange for access token
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    console.error("[fcm] Token exchange failed:", data);
    return null;
  }

  _accessToken = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
  return _accessToken;
}

/**
 * Send a push notification to a single FCM token
 */
export async function sendPushNotification({
  token,
  title,
  body,
  data = {},
  imageUrl,
}) {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "{}").project_id;

  if (!projectId) {
    console.warn("[fcm] No project ID");
    return { success: false };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) return { success: false, error: "Not configured" };

  const message = {
    message: {
      token,
      notification: { title, body, ...(imageUrl ? { image: imageUrl } : {}) },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      webpush: {
        notification: {
          title,
          body,
          icon: "/favicon.png",
          badge: "/favicon.png",
          ...(imageUrl ? { image: imageUrl } : {}),
        },
        fcm_options: { link: process.env.NEXT_PUBLIC_APP_URL || "/" },
      },
    },
  };

  try {
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(message),
      }
    );
    const result = await res.json();
    if (!res.ok) {
      console.error("[fcm] Send failed:", result);
      return { success: false, error: result.error?.message };
    }
    return { success: true, messageId: result.name };
  } catch (err) {
    console.error("[fcm] Send error:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send to multiple tokens (batch)
 */
export async function sendPushToTokens({ tokens, title, body, data = {} }) {
  if (!tokens?.length) return [];
  const results = await Promise.allSettled(
    tokens.map((token) => sendPushNotification({ token, title, body, data }))
  );
  return results.map((r, i) => ({
    token: tokens[i],
    success: r.status === "fulfilled" && r.value.success,
  }));
}

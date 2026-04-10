"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import { Home, CheckCircle, XCircle, Loader2 } from "lucide-react";

const HOUSE_TYPE_EMOJI = {
  flat: "🏢",
  villa: "🏡",
  family: "🏠",
  co_living: "🏘️",
  dormitory: "🏫",
  other: "🏠",
};

export default function InvitePage() {
  const { token } = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  const [invite, setInvite] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | accepting | success | error | expired
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invites/${token}`);
        const json = await res.json();
        if (json.success) {
          setInvite(json.data);
          setStatus("ready");
        } else {
          setMessage(json.error || "Invalid invite");
          setStatus(json.error?.includes("expired") ? "expired" : "error");
        }
      } catch {
        setMessage("Failed to load invite.");
        setStatus("error");
      }
    }
    fetchInvite();
  }, [token]);

  async function handleAccept() {
    setStatus("accepting");
    try {
      const res = await fetch(`/api/invites/${token}`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        setTimeout(() => router.push(`/dashboard/${json.data.houseId}`), 1800);
      } else {
        setMessage(json.error || "Failed to accept invite.");
        setStatus("error");
      }
    } catch {
      setMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  const house = invite?.houseId;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Logo */}
      <div
        style={{ marginBottom: 28, display: "flex", justifyContent: "center" }}
      >
        <Image
          src="/pageIcon.png"
          alt="Homy"
          width={72}
          height={72}
          style={{
            objectFit: "contain",
            borderRadius: 8,
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          }}
        />
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: 20,
          padding: 32,
        }}
      >
        {/* Loading */}
        {status === "loading" && (
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
              color: "var(--muted)",
            }}
          >
            <Loader2
              size={28}
              style={{ animation: "spin 1s linear infinite", marginBottom: 12 }}
            />
            <p>Loading invite…</p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle
              size={44}
              color="#4ade80"
              style={{ marginBottom: 14 }}
            />
            <h2
              style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 8 }}
            >
              You're in! 🎉
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              Welcome to {house?.name}. Redirecting to your dashboard…
            </p>
          </div>
        )}

        {/* Error / expired */}
        {(status === "error" || status === "expired") && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <XCircle size={44} color="#f87171" style={{ marginBottom: 14 }} />
            <h2
              style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 8 }}
            >
              {status === "expired" ? "Invite Expired" : "Invalid Invite"}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              {message}
            </p>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "0.8rem",
                marginTop: 8,
              }}
            >
              Ask your manager to send a new invite.
            </p>
          </div>
        )}

        {/* Ready state */}
        {(status === "ready" || status === "accepting") && invite && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>
                {HOUSE_TYPE_EMOJI[house?.type] || "🏠"}
              </div>
              <h2
                style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 4 }}
              >
                You're invited!
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                {invite.invitedBy?.name} invited you to join
              </p>
            </div>

            {/* House card */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--glass-border)",
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  marginBottom: 4,
                }}
              >
                {house?.name}
              </div>
              {house?.address?.city && (
                <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  {house.address.city}
                  {house.address.country ? `, ${house.address.country}` : ""}
                </div>
              )}
              <div
                style={{
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "2px 10px",
                  borderRadius: 50,
                  color: "var(--teal)",
                  background: "rgba(45,212,191,0.1)",
                  border: "1px solid rgba(45,212,191,0.22)",
                }}
              >
                Joining as {invite.role}
              </div>
            </div>

            {/* If not signed in */}
            {isLoaded && !isSignedIn ? (
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.85rem",
                    marginBottom: 14,
                  }}
                >
                  Sign in to accept this invite
                </p>
                <SignInButton mode="modal" afterSignInUrl={`/invite/${token}`}>
                  <button
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 12,
                      background: "var(--accent)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Sign in to continue
                  </button>
                </SignInButton>
              </div>
            ) : (
              <button
                onClick={handleAccept}
                disabled={status === "accepting"}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 12,
                  background:
                    status === "accepting"
                      ? "var(--glass-bg-mid)"
                      : "var(--accent)",
                  color: status === "accepting" ? "var(--muted)" : "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: status === "accepting" ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {status === "accepting" && (
                  <Loader2
                    size={15}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                )}
                {status === "accepting" ? "Joining…" : "Accept Invite →"}
              </button>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

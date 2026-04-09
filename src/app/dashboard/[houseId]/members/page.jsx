"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Users,
  Crown,
  Mail,
  Phone,
  Home,
  X,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

const ROLE_BADGE = {
  manager: {
    label: "Manager",
    color: "var(--accent)",
    bg: "rgba(232,98,26,0.12)",
    border: "rgba(232,98,26,0.28)",
  },
  member: {
    label: "Member",
    color: "var(--teal)",
    bg: "rgba(45,212,191,0.1)",
    border: "rgba(45,212,191,0.22)",
  },
  guest: {
    label: "Guest",
    color: "var(--muted)",
    bg: "var(--glass-bg)",
    border: "var(--glass-border)",
  },
};

function Avatar({ name, avatarUrl, size = 44 }) {
  const initials =
    name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  if (avatarUrl)
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--accent-dim)",
        border: "1px solid var(--accent-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color: "var(--accent)",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function fmtCurrency(amount, currency) {
  if (!amount) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "BDT",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  } catch {
    return `${amount / 100}`;
  }
}

const iS = {
  width: "100%",
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  borderRadius: 10,
  padding: "9px 13px",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};
const lS = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export default function MembersPage() {
  const { houseId } = useParams();
  const [members, setMembers] = useState([]);
  const [house, setHouse] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    phone: "",
    name: "",
    role: "member",
  });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const setIF = (k, v) => setInviteForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    async function load() {
      const [mRes, hRes] = await Promise.all([
        fetch(`/api/houses/${houseId}/members`),
        fetch(`/api/houses/${houseId}`),
      ]);
      const [mJson, hJson] = await Promise.all([mRes.json(), hRes.json()]);
      if (mJson.success) setMembers(mJson.data);
      if (hJson.success) {
        setHouse(hJson.data);
        setMyRole(hJson.data.role);
      }
      setLoading(false);
    }
    load();
  }, [houseId]);

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteForm.email && !inviteForm.phone) {
      setInviteError("Email or phone required.");
      return;
    }
    setInviteError(null);
    setInviting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      const json = await res.json();
      if (!json.success) {
        setInviteError(json.error);
        return;
      }
      setInviteLink(json.data.inviteUrl);
    } catch {
      setInviteError("Network error.");
    } finally {
      setInviting(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeInvite() {
    setShowInvite(false);
    setInviteLink(null);
    setInviteForm({ email: "", phone: "", name: "", role: "member" });
    setInviteError(null);
  }

  if (loading)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading members…
      </div>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            Members
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {members.length} member{members.length !== 1 ? "s" : ""} ·{" "}
            {house?.name}
          </p>
        </div>
        {myRole === "manager" && (
          <button
            onClick={() => setShowInvite(true)}
            style={{
              padding: "9px 18px",
              borderRadius: 50,
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.825rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            + Invite member
          </button>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "var(--bg-mid)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: 28,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                Invite Member
              </h2>
              <button
                onClick={closeInvite}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {inviteLink ? (
              /* Success — show link */
              <div>
                <div
                  style={{
                    background: "rgba(74,222,128,0.06)",
                    border: "1px solid rgba(74,222,128,0.2)",
                    borderRadius: 10,
                    padding: "12px 14px",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#4ade80",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    ✓ Invite link created!
                  </div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--muted)",
                      wordBreak: "break-all",
                    }}
                  >
                    {inviteLink}
                  </div>
                </div>
                <button
                  onClick={copyLink}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: 10,
                    background: copied
                      ? "rgba(74,222,128,0.15)"
                      : "var(--glass-bg-mid)",
                    border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : "var(--glass-border)"}`,
                    color: copied ? "#4ade80" : "var(--text)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--muted)",
                    textAlign: "center",
                  }}
                >
                  Link expires in 7 days. Share it with the person you're
                  inviting.
                </p>
                <button
                  onClick={closeInvite}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 10,
                    background: "transparent",
                    border: "1px solid var(--glass-border)",
                    color: "var(--muted)",
                    fontSize: "0.825rem",
                    cursor: "pointer",
                    marginTop: 10,
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              /* Invite form */
              <>
                {inviteError && (
                  <div
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      color: "#f87171",
                      fontSize: "0.825rem",
                      marginBottom: 14,
                    }}
                  >
                    {inviteError}
                  </div>
                )}
                <form
                  onSubmit={handleInvite}
                  style={{ display: "flex", flexDirection: "column", gap: 13 }}
                >
                  <div>
                    <label style={lS}>Name (optional)</label>
                    <input
                      style={iS}
                      placeholder="Their name"
                      value={inviteForm.name}
                      onChange={(e) => setIF("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={lS}>Email</label>
                    <input
                      style={iS}
                      type="email"
                      placeholder="email@example.com"
                      value={inviteForm.email}
                      onChange={(e) => setIF("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={lS}>Or phone</label>
                    <input
                      style={iS}
                      type="tel"
                      placeholder="+880 1XXX XXXXXX"
                      value={inviteForm.phone}
                      onChange={(e) => setIF("phone", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={lS}>Role</label>
                    <select
                      style={{ ...iS, cursor: "pointer" }}
                      value={inviteForm.role}
                      onChange={(e) => setIF("role", e.target.value)}
                    >
                      <option value="member">Member</option>
                      <option value="guest">Guest (read-only)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={inviting}
                    style={{
                      padding: "11px",
                      borderRadius: 10,
                      background: inviting
                        ? "var(--glass-bg-mid)"
                        : "var(--accent)",
                      color: inviting ? "var(--muted)" : "#fff",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      border: "none",
                      cursor: inviting ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    {inviting && (
                      <Loader2
                        size={14}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    )}
                    {inviting ? "Creating…" : "Create invite link"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Member list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {members.map((m) => {
          const badge = ROLE_BADGE[m.role] || ROLE_BADGE.member;
          return (
            <div
              key={m.membershipId}
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <Avatar name={m.name} avatarUrl={m.avatarUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 5,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    {m.name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      padding: "2px 9px",
                      borderRadius: 50,
                      color: badge.color,
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                    }}
                  >
                    {m.role === "manager" && (
                      <Crown
                        size={10}
                        style={{
                          marginRight: 3,
                          display: "inline",
                          verticalAlign: "middle",
                        }}
                      />
                    )}
                    {badge.label}
                  </span>
                  {m.roomLabel && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Home size={11} />
                      {m.roomLabel}
                    </span>
                  )}
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px" }}
                >
                  {m.email && (
                    <span
                      style={{
                        fontSize: "0.775rem",
                        color: "var(--muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Mail size={11} />
                      {m.email}
                    </span>
                  )}
                  {m.phone && (
                    <span
                      style={{
                        fontSize: "0.775rem",
                        color: "var(--muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Phone size={11} />
                      {m.phone}
                    </span>
                  )}
                  {m.joinedAt && (
                    <span
                      style={{ fontSize: "0.775rem", color: "var(--muted)" }}
                    >
                      Joined{" "}
                      {new Date(m.joinedAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
              {m.rentAmount !== undefined && (
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                    {fmtCurrency(m.rentAmount, house?.currency)}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    / month
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <Users size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No members yet. Invite someone to join.</p>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Settings,
  Home,
  Crown,
  Users,
  Shield,
  Bell,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  LogOut,
  UserX,
  UserCheck,
  Key,
  Edit3,
  Plus,
  X,
  DoorOpen,
  Check,
  ArrowRight,
  Lock,
  Unlock,
  RefreshCw,
} from "lucide-react";
import { HOUSE_TYPE } from "@/lib/constants";

// ── constants ────────────────────────────────────────────────────────────────
const HOUSE_TYPES = [
  { value: "flat", label: "Flat / Apartment", emoji: "🏢" },
  { value: "villa", label: "Villa", emoji: "🏡" },
  { value: "family", label: "Family Home", emoji: "🏠" },
  { value: "co_living", label: "Co-Living", emoji: "🏘️" },
  { value: "dormitory", label: "Dormitory", emoji: "🏫" },
  { value: "other", label: "Other", emoji: "🏗️" },
];
const CURRENCIES = ["BDT", "PKR", "INR", "USD", "GBP", "AUD", "EUR"];
const RENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "jazz_cash", label: "JazzCash" },
  { value: "easy_paisa", label: "EasyPaisa" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

const SETTINGS_SECTIONS = [
  { id: "general", label: "General", icon: Home },
  { id: "members", label: "Members & Roles", icon: Users },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

// ── field helpers ─────────────────────────────────────────────────────────────
const iS = {
  width: "100%",
  background: "var(--glass-bg)",
  border: "1px solid var(--glass-border)",
  borderRadius: 10,
  padding: "10px 14px",
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

function SectionCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <h3
          style={{
            fontWeight: 800,
            fontSize: "0.95rem",
            marginBottom: subtitle ? 3 : 0,
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ padding: "20px 22px" }}>{children}</div>
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange, disabled }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 14,
        marginBottom: 14,
        borderBottom: "1px solid var(--glass-border)",
      }}
    >
      <div>
        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</div>
        {sub && (
          <div
            style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}
          >
            {sub}
          </div>
        )}
      </div>
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: "none",
          background: value ? "var(--accent)" : "var(--glass-bg-mid)",
          cursor: disabled ? "not-allowed" : "pointer",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: 3,
            left: value ? 23 : 3,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </button>
    </div>
  );
}

function MemberRoleRow({
  member,
  isCurrentUser,
  onPromote,
  onDemote,
  onRemove,
  isManager,
}) {
  const [expanded, setExpanded] = useState(false);
  const badge =
    {
      manager: {
        color: "var(--accent)",
        bg: "var(--accent-dim)",
        border: "var(--accent-border)",
      },
      member: {
        color: "var(--teal)",
        bg: "var(--teal-dim)",
        border: "var(--teal-border)",
      },
      guest: {
        color: "var(--muted)",
        bg: "var(--glass-bg-mid)",
        border: "var(--glass-border)",
      },
    }[member.role] || {};

  const initials =
    member.name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--glass-border)",
        marginBottom: 8,
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "var(--accent)",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>
              {member.name}
            </span>
            {isCurrentUser && (
              <span
                style={{
                  fontSize: "0.65rem",
                  color: "var(--muted)",
                  background: "var(--glass-bg-mid)",
                  padding: "1px 7px",
                  borderRadius: 50,
                  border: "1px solid var(--glass-border)",
                }}
              >
                You
              </span>
            )}
          </div>
          <div
            style={{ fontSize: "0.73rem", color: "var(--muted)", marginTop: 2 }}
          >
            {member.email || member.phone || ""}
            {member.roomLabel ? ` · ${member.roomLabel}` : ""}
          </div>
        </div>
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
          {member.role}
        </span>
        {isManager && !isCurrentUser && (
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: 4,
            }}
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}
      </div>

      {/* Expanded actions */}
      {expanded && isManager && !isCurrentUser && (
        <div
          style={{
            borderTop: "1px solid var(--glass-border)",
            padding: "12px 16px",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            background: "var(--bg-base)",
          }}
        >
          {member.role !== "manager" && (
            <button
              onClick={() => onPromote(member.membershipId)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 13px",
                borderRadius: 8,
                background: "var(--accent-dim)",
                border: "1px solid var(--accent-border)",
                color: "var(--accent)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Crown size={12} /> Make Manager
            </button>
          )}
          {member.role === "manager" && (
            <button
              onClick={() => onDemote(member.membershipId)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 13px",
                borderRadius: 8,
                background: "var(--glass-bg-mid)",
                border: "1px solid var(--glass-border)",
                color: "var(--muted)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <UserX size={12} /> Remove Manager
            </button>
          )}
          {member.role === "member" && (
            <button
              onClick={() => onDemote(member.membershipId, "guest")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 13px",
                borderRadius: 8,
                background: "var(--glass-bg-mid)",
                border: "1px solid var(--glass-border)",
                color: "var(--muted)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Lock size={12} /> Set as Guest
            </button>
          )}
          {member.role === "guest" && (
            <button
              onClick={() => onPromote(member.membershipId, "member")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 13px",
                borderRadius: 8,
                background: "var(--teal-dim)",
                border: "1px solid var(--teal-border)",
                color: "var(--teal)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Unlock size={12} /> Make Member
            </button>
          )}
          <button
            onClick={() => onRemove(member.membershipId, member.name)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 13px",
              borderRadius: 8,
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              color: "#f87171",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            <UserX size={12} /> Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function HouseSettingsPage() {
  const { houseId } = useParams();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("general");
  const [house, setHouse] = useState(null);
  const [members, setMembers] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [myMembershipId, setMyMembershipId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // General form
  const [form, setForm] = useState({
    name: "",
    type: "flat",
    currency: "BDT",
    rentDueDay: 1,
    rules: "",
    address: { line1: "", city: "", country: "" },
  });
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setAddr = (k, v) =>
    setForm((p) => ({ ...p, address: { ...p.address, [k]: v } }));

  // Permissions (stored as house settings — simplified flags)
  const [permissions, setPermissions] = useState({
    membersCanCreateThreads: true,
    membersCanAddVaultItems: true,
    membersCanCreateTasks: true,
    membersCanAddGrocery: true,
    membersCanCreatePolls: true,
    guestsCanSeeMembers: false,
    guestsCanSeeLedger: false,
  });

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    rentDueReminders: true,
    taskNudges: true,
    memberJoinAlerts: true,
    billAlerts: true,
    pollAlerts: true,
  });

  // Delete confirmation
  const [deleteInput, setDeleteInput] = useState("");
  const [leaveConfirm, setLeaveConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, [houseId]);

  async function loadData() {
    const [hRes, mRes] = await Promise.all([
      fetch(`/api/houses/${houseId}`),
      fetch(`/api/houses/${houseId}/members`),
    ]);
    const [hJson, mJson] = await Promise.all([hRes.json(), mRes.json()]);
    if (hJson.success) {
      const h = hJson.data;
      setHouse(h);
      setMyRole(h.role);
      setMyMembershipId(h.membershipId);
      setForm({
        name: h.name || "",
        type: h.type || "flat",
        currency: h.currency || "BDT",
        rentDueDay: h.rentDueDay || 1,
        rules: h.rules || "",
        address: {
          line1: h.address?.line1 || "",
          city: h.address?.city || "",
          country: h.address?.country || "",
        },
      });
    }
    if (mJson.success) setMembers(mJson.data);
    setLoading(false);
  }

  const isManager = myRole === "manager";

  // ── actions ──────────────────────────────────────────────────────────────
  async function handleSaveGeneral(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("House name required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/houses/${houseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }
      setHouse((prev) => ({ ...prev, ...json.data }));
      toast.success("Settings saved.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangeRole(membershipId, newRole) {
    setActionLoading(membershipId);
    try {
      const res = await fetch(
        `/api/houses/${houseId}/members/${membershipId}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Failed to update role.");
        return;
      }
      setMembers((prev) =>
        prev.map((m) =>
          m.membershipId === membershipId ? { ...m, role: newRole } : m
        )
      );
      toast.success("Role updated.");
    } catch {
      toast.error("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemoveMember(membershipId, name) {
    if (!confirm(`Remove ${name} from this house?`)) return;
    setActionLoading(membershipId);
    try {
      const res = await fetch(
        `/api/houses/${houseId}/members/${membershipId}`,
        {
          method: "DELETE",
        }
      );
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Failed to remove member.");
        return;
      }
      setMembers((prev) => prev.filter((m) => m.membershipId !== membershipId));
      toast.success(`${name} removed.`);
    } catch {
      toast.error("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLeaveHouse() {
    if (!leaveConfirm) {
      setLeaveConfirm(true);
      return;
    }
    setActionLoading("leave");
    try {
      const res = await fetch(
        `/api/houses/${houseId}/members/${myMembershipId}`,
        {
          method: "DELETE",
        }
      );
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Failed to leave house.");
        return;
      }
      toast.success("You've left the house.");
      router.push("/dashboard");
    } catch {
      toast.error("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteHouse() {
    if (deleteInput !== house?.name) {
      toast.error("House name doesn't match.");
      return;
    }
    setActionLoading("delete");
    try {
      const res = await fetch(`/api/houses/${houseId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Failed to delete house.");
        return;
      }
      toast.success("House deleted.");
      router.push("/dashboard");
    } catch {
      toast.error("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTransferOwnership(membershipId, name) {
    if (
      !confirm(
        `Transfer house ownership to ${name}? You will become a regular member.`
      )
    )
      return;
    setActionLoading(membershipId);
    try {
      const res = await fetch(`/api/houses/${houseId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newManagerMembershipId: membershipId }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Failed to transfer ownership.");
        return;
      }
      toast.success(`Ownership transferred to ${name}.`);
      await loadData();
    } catch {
      toast.error("Network error.");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <SettingsSkeleton />;

  const nonManagerMembers = members.filter(
    (m) => m.role !== "manager" && m.membershipId !== myMembershipId
  );

  return (
    <div
      style={{
        maxWidth: 680,
        display: "flex",
        gap: 0,
        flexDirection: "column",
      }}
    >
      {/* ── page header ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 5,
          }}
        >
          <Settings size={20} color="var(--accent)" />
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            House Settings
          </h1>
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          {house?.name}
        </p>
      </div>

      {/* ── section nav ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {SETTINGS_SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 50,
                fontSize: "0.78rem",
                fontWeight: 600,
                border: "1px solid",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                borderColor:
                  s.id === "danger" && active
                    ? "rgba(248,113,113,0.4)"
                    : active
                      ? "var(--accent)"
                      : "var(--glass-border)",
                background:
                  s.id === "danger" && active
                    ? "rgba(248,113,113,0.08)"
                    : active
                      ? "var(--accent-dim)"
                      : "transparent",
                color:
                  s.id === "danger"
                    ? active
                      ? "#f87171"
                      : "#f87171aa"
                    : active
                      ? "var(--accent)"
                      : "var(--muted)",
              }}
            >
              <Icon size={13} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ══ GENERAL ══════════════════════════════════════════════════════════ */}
      {activeSection === "general" && (
        <form onSubmit={handleSaveGeneral}>
          <SectionCard
            title="Basic Information"
            subtitle="House name, type, and location"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lS}>House Name *</label>
                <input
                  style={iS}
                  value={form.name}
                  onChange={(e) => setF("name", e.target.value)}
                  maxLength={100}
                />
              </div>

              <div>
                <label style={lS}>Type</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 7,
                  }}
                >
                  {HOUSE_TYPES.map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setF("type", value)}
                      style={{
                        padding: "9px 6px",
                        borderRadius: 10,
                        cursor: "pointer",
                        border:
                          form.type === value
                            ? "1.5px solid var(--accent)"
                            : "1px solid var(--glass-border)",
                        background:
                          form.type === value
                            ? "var(--accent-dim)"
                            : "var(--glass-bg)",
                        color:
                          form.type === value ? "var(--text)" : "var(--muted)",
                        fontSize: "0.72rem",
                        fontWeight: form.type === value ? 600 : 400,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <span style={{ fontSize: "1rem" }}>{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={lS}>Currency</label>
                  <select
                    style={{ ...iS, cursor: "pointer" }}
                    value={form.currency}
                    onChange={(e) => setF("currency", e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option
                        key={c}
                        value={c}
                        style={{ background: "#0e1520" }}
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lS}>Rent Due Day (1–28)</label>
                  <input
                    style={iS}
                    type="number"
                    min={1}
                    max={28}
                    value={form.rentDueDay}
                    onChange={(e) => setF("rentDueDay", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Address"
            subtitle="Optional — shown in member invites"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                style={iS}
                placeholder="Street address"
                value={form.address.line1}
                onChange={(e) => setAddr("line1", e.target.value)}
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <input
                  style={iS}
                  placeholder="City"
                  value={form.address.city}
                  onChange={(e) => setAddr("city", e.target.value)}
                />
                <input
                  style={iS}
                  placeholder="Country"
                  value={form.address.country}
                  onChange={(e) => setAddr("country", e.target.value)}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="House Rules"
            subtitle="Visible to all members. Max 2000 characters."
          >
            <textarea
              style={{
                ...iS,
                minHeight: 120,
                resize: "vertical",
                fontFamily: "inherit",
                lineHeight: 1.6,
              }}
              placeholder="e.g. No guests after 11pm. Kitchen must be clean by midnight. Quiet hours 10pm–8am."
              value={form.rules}
              onChange={(e) => setF("rules", e.target.value)}
              maxLength={2000}
            />
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--muted)",
                marginTop: 5,
                textAlign: "right",
              }}
            >
              {form.rules.length}/2000
            </div>
          </SectionCard>

          {isManager && (
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: "0.9rem",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                background: saving ? "var(--glass-bg-mid)" : "var(--accent)",
                color: saving ? "var(--muted)" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: saving ? "none" : "0 8px 24px rgba(232,98,26,0.2)",
              }}
            >
              {saving ? (
                <Loader2
                  size={15}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <Save size={15} />
              )}
              {saving ? "Saving…" : "Save Settings"}
            </button>
          )}
        </form>
      )}

      {/* ══ MEMBERS & ROLES ══════════════════════════════════════════════════ */}
      {activeSection === "members" && (
        <div>
          <SectionCard
            title="Member Management"
            subtitle={
              isManager
                ? "Manage roles, promote, demote, or remove members"
                : "View your housemates"
            }
          >
            {members.length === 0 ? (
              <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                No members yet.
              </p>
            ) : (
              <div>
                {members.map((m) => (
                  <MemberRoleRow
                    key={m.membershipId}
                    member={m}
                    isCurrentUser={
                      String(m.membershipId) === String(myMembershipId)
                    }
                    isManager={isManager}
                    onPromote={(mid, role) =>
                      handleChangeRole(mid, role || "manager")
                    }
                    onDemote={(mid, role) =>
                      handleChangeRole(mid, role || "member")
                    }
                    onRemove={handleRemoveMember}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {isManager && nonManagerMembers.length > 0 && (
            <SectionCard
              title="Transfer Ownership"
              subtitle="Assign a new manager for this house. You'll become a regular member."
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {nonManagerMembers.map((m) => (
                  <div
                    key={m.membershipId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "var(--bg-surface)",
                      borderRadius: 10,
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {m.name}
                    </span>
                    <button
                      onClick={() =>
                        handleTransferOwnership(m.membershipId, m.name)
                      }
                      disabled={!!actionLoading}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 12px",
                        borderRadius: 8,
                        background: "var(--glass-bg-mid)",
                        border: "1px solid var(--glass-border)",
                        color: "var(--muted)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Crown size={11} /> Transfer
                    </button>
                  </div>
                ))}
              </div>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "var(--faint)",
                  marginTop: 10,
                }}
              >
                This action cannot be undone without the new manager's
                cooperation.
              </p>
            </SectionCard>
          )}

          {/* Pending invites */}
          <SectionCard
            title="Pending Invites"
            subtitle="Active invite links that haven't been accepted yet"
          >
            <PendingInvites houseId={houseId} isManager={isManager} />
          </SectionCard>
        </div>
      )}

      {/* ══ PERMISSIONS ══════════════════════════════════════════════════════ */}
      {activeSection === "permissions" && (
        <div>
          <SectionCard
            title="Member Permissions"
            subtitle="What regular members can do in this house"
          >
            {!isManager && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  marginBottom: 16,
                  background: "rgba(251,191,36,0.06)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  fontSize: "0.78rem",
                  color: "#fbbf24",
                }}
              >
                Only the house manager can change permissions.
              </div>
            )}
            <ToggleRow
              label="Create Chat Threads"
              sub="Members can create new channels"
              value={permissions.membersCanCreateThreads}
              onChange={(v) =>
                setPermissions((p) => ({ ...p, membersCanCreateThreads: v }))
              }
              disabled={!isManager}
            />
            <ToggleRow
              label="Add Vault Items"
              sub="Members can add WiFi passwords, codes, etc."
              value={permissions.membersCanAddVaultItems}
              onChange={(v) =>
                setPermissions((p) => ({ ...p, membersCanAddVaultItems: v }))
              }
              disabled={!isManager}
            />
            <ToggleRow
              label="Create Tasks"
              sub="Members can create and assign tasks"
              value={permissions.membersCanCreateTasks}
              onChange={(v) =>
                setPermissions((p) => ({ ...p, membersCanCreateTasks: v }))
              }
              disabled={!isManager}
            />
            <ToggleRow
              label="Add Grocery Items"
              sub="Members can add items to the grocery list"
              value={permissions.membersCanAddGrocery}
              onChange={(v) =>
                setPermissions((p) => ({ ...p, membersCanAddGrocery: v }))
              }
              disabled={!isManager}
            />
            <ToggleRow
              label="Create Polls"
              sub="Members can start polls in any thread"
              value={permissions.membersCanCreatePolls}
              onChange={(v) =>
                setPermissions((p) => ({ ...p, membersCanCreatePolls: v }))
              }
              disabled={!isManager}
            />
          </SectionCard>

          <SectionCard
            title="Guest Permissions"
            subtitle="What read-only guests can see"
          >
            <ToggleRow
              label="View Member List"
              sub="Guests can see who else lives here"
              value={permissions.guestsCanSeeMembers}
              onChange={(v) =>
                setPermissions((p) => ({ ...p, guestsCanSeeMembers: v }))
              }
              disabled={!isManager}
            />
            <div style={{ borderBottom: "none" }}>
              <ToggleRow
                label="View Ledger Entries"
                sub="Guests can see payment history"
                value={permissions.guestsCanSeeLedger}
                onChange={(v) =>
                  setPermissions((p) => ({ ...p, guestsCanSeeLedger: v }))
                }
                disabled={!isManager}
              />
            </div>
          </SectionCard>

          {isManager && (
            <button
              onClick={() => toast.success("Permissions saved.")}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: "0.88rem",
                border: "none",
                cursor: "pointer",
                background: "var(--accent)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Save size={14} /> Save Permissions
            </button>
          )}
        </div>
      )}

      {/* ══ NOTIFICATIONS ════════════════════════════════════════════════════ */}
      {activeSection === "notifications" && (
        <div>
          <SectionCard
            title="House Notifications"
            subtitle="Configure what events trigger alerts for this house"
          >
            <ToggleRow
              label="Rent Due Reminders"
              sub="Alert members 3 days before rent is due"
              value={notifSettings.rentDueReminders}
              onChange={(v) =>
                setNotifSettings((p) => ({ ...p, rentDueReminders: v }))
              }
            />
            <ToggleRow
              label="Task Nudges"
              sub="Remind assigned members when tasks are overdue"
              value={notifSettings.taskNudges}
              onChange={(v) =>
                setNotifSettings((p) => ({ ...p, taskNudges: v }))
              }
            />
            <ToggleRow
              label="Member Join Alerts"
              sub="Notify manager when someone accepts an invite"
              value={notifSettings.memberJoinAlerts}
              onChange={(v) =>
                setNotifSettings((p) => ({ ...p, memberJoinAlerts: v }))
              }
            />
            <ToggleRow
              label="Bill Alerts"
              sub="Notify members when a bill is split and assigned"
              value={notifSettings.billAlerts}
              onChange={(v) =>
                setNotifSettings((p) => ({ ...p, billAlerts: v }))
              }
            />
            <div style={{ borderBottom: "none" }}>
              <ToggleRow
                label="Poll Notifications"
                sub="Notify members when a new poll is created"
                value={notifSettings.pollAlerts}
                onChange={(v) =>
                  setNotifSettings((p) => ({ ...p, pollAlerts: v }))
                }
              />
            </div>
          </SectionCard>

          <button
            onClick={() => toast.success("Notification settings saved.")}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: "0.88rem",
              border: "none",
              cursor: "pointer",
              background: "var(--accent)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Save size={14} /> Save Notification Settings
          </button>
        </div>
      )}

      {/* ══ DANGER ZONE ══════════════════════════════════════════════════════ */}
      {activeSection === "danger" && (
        <div>
          {/* Leave house */}
          {!isManager && (
            <div
              style={{
                background: "rgba(248,113,113,0.04)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 16,
                padding: "22px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <LogOut
                  size={20}
                  color="#f87171"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <div>
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      color: "#f87171",
                      marginBottom: 4,
                    }}
                  >
                    Leave House
                  </h3>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    You'll lose access to all house data. Your ledger history
                    will be preserved for the manager. You can be re-invited by
                    the manager at any time.
                  </p>
                </div>
              </div>
              {leaveConfirm ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setLeaveConfirm(false)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      background: "var(--glass-bg-mid)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--muted)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLeaveHouse}
                    disabled={actionLoading === "leave"}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 10,
                      background: "rgba(248,113,113,0.15)",
                      border: "1px solid rgba(248,113,113,0.3)",
                      color: "#f87171",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                    }}
                  >
                    {actionLoading === "leave" ? (
                      <Loader2
                        size={14}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <LogOut size={14} />
                    )}
                    Yes, Leave
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setLeaveConfirm(true)}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 10,
                    background: "rgba(248,113,113,0.08)",
                    border: "1px solid rgba(248,113,113,0.25)",
                    color: "#f87171",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <LogOut size={14} /> Leave House
                </button>
              )}
            </div>
          )}

          {/* Transfer ownership (manager only) */}
          {isManager && nonManagerMembers.length > 0 && (
            <div
              style={{
                background: "rgba(251,191,36,0.04)",
                border: "1px solid rgba(251,191,36,0.2)",
                borderRadius: 16,
                padding: "22px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Crown
                  size={20}
                  color="#fbbf24"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <div>
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      color: "#fbbf24",
                      marginBottom: 4,
                    }}
                  >
                    Transfer Ownership
                  </h3>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    Hand over management of this house to another member. You'll
                    become a regular member.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {nonManagerMembers.slice(0, 5).map((m) => (
                  <div
                    key={m.membershipId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 13px",
                      background: "var(--glass-bg)",
                      borderRadius: 9,
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <span style={{ fontSize: "0.83rem", fontWeight: 600 }}>
                      {m.name}
                    </span>
                    <button
                      onClick={() =>
                        handleTransferOwnership(m.membershipId, m.name)
                      }
                      disabled={!!actionLoading}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 12px",
                        borderRadius: 8,
                        background: "rgba(251,191,36,0.1)",
                        border: "1px solid rgba(251,191,36,0.25)",
                        color: "#fbbf24",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <ArrowRight size={11} /> Transfer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete house (manager only) */}
          {isManager && (
            <div
              style={{
                background: "rgba(248,113,113,0.04)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 16,
                padding: "22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <Trash2
                  size={20}
                  color="#f87171"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <div>
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      color: "#f87171",
                      marginBottom: 4,
                    }}
                  >
                    Delete House
                  </h3>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    Permanently delete this house and all its data — ledger,
                    vault, tasks, groceries, chat. This action{" "}
                    <strong style={{ color: "var(--text)" }}>
                      cannot be undone
                    </strong>
                    . All members will lose access immediately.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ ...lS, color: "#f87171aa" }}>
                  Type{" "}
                  <strong style={{ color: "#f87171" }}>{house?.name}</strong> to
                  confirm
                </label>
                <input
                  style={{
                    ...iS,
                    borderColor:
                      deleteInput === house?.name
                        ? "#4ade80"
                        : "rgba(248,113,113,0.3)",
                    background: "rgba(248,113,113,0.04)",
                  }}
                  placeholder={house?.name}
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                />
              </div>

              <button
                onClick={handleDeleteHouse}
                disabled={
                  deleteInput !== house?.name || actionLoading === "delete"
                }
                style={{
                  padding: "11px 22px",
                  borderRadius: 10,
                  background:
                    deleteInput === house?.name
                      ? "rgba(248,113,113,0.15)"
                      : "transparent",
                  border: `1px solid ${deleteInput === house?.name ? "rgba(248,113,113,0.4)" : "rgba(248,113,113,0.15)"}`,
                  color: deleteInput === house?.name ? "#f87171" : "#f8717166",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor:
                    deleteInput === house?.name ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  transition: "all 0.15s",
                }}
              >
                {actionLoading === "delete" ? (
                  <Loader2
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete House Permanently
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}

// ── Pending invites sub-component ─────────────────────────────────────────────
function PendingInvites({ houseId, isManager }) {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isManager) {
      setLoading(false);
      return;
    }
    fetch(`/api/houses/${houseId}/invites`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setInvites(j.data);
      })
      .finally(() => setLoading(false));
  }, [houseId, isManager]);

  if (!isManager)
    return (
      <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
        Only managers can view pending invites.
      </p>
    );
  if (loading)
    return (
      <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Loading…</p>
    );
  if (invites.length === 0)
    return (
      <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
        No pending invites.
      </p>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {invites.map((inv) => {
        const expiresIn = Math.ceil(
          (new Date(inv.expiresAt) - Date.now()) / 86400000
        );
        return (
          <div
            key={inv._id}
            style={{
              padding: "10px 14px",
              background: "var(--bg-surface)",
              borderRadius: 10,
              border: "1px solid var(--glass-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                {inv.email || inv.phone}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--muted)",
                  marginTop: 2,
                }}
              >
                {inv.role} · Expires in {expiresIn}d
              </div>
            </div>
            <span
              style={{
                fontSize: "0.67rem",
                fontWeight: 600,
                padding: "2px 9px",
                borderRadius: 50,
                color: "#fbbf24",
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.2)",
              }}
            >
              Pending
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div style={{ maxWidth: 680 }}>
      <div
        style={{
          height: 60,
          borderRadius: 12,
          background: "var(--glass-bg)",
          marginBottom: 28,
        }}
        className="sk"
      />
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: 34,
              width: 110,
              borderRadius: 50,
              background: "var(--glass-bg)",
            }}
            className="sk"
          />
        ))}
      </div>
      {[1, 2].map((i) => (
        <div
          key={i}
          style={{
            height: 160,
            borderRadius: 16,
            background: "var(--glass-bg)",
            marginBottom: 16,
          }}
          className="sk"
        />
      ))}
      <style>{`.sk{animation:pulse 1.5s ease-in-out infinite} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

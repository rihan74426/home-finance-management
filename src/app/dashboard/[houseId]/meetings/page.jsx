"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Video,
  MapPin,
  Calendar,
  Clock,
  Users,
  Plus,
  X,
  Loader2,
  Check,
  HelpCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
} from "lucide-react";

const PLATFORM_CONFIG = {
  zoom: { label: "Zoom", color: "#2D8CFF" },
  google_meet: { label: "Google Meet", color: "#00897B" },
  teams: { label: "Microsoft Teams", color: "#6264A7" },
  other_online: { label: "Other Link", color: "var(--teal)" },
};

const RSVP_CONFIG = {
  attending: { label: "Attending", color: "#4ade80", icon: Check },
  not_attending: { label: "Not attending", color: "#f87171", icon: XCircle },
  maybe: { label: "Maybe", color: "#fbbf24", icon: HelpCircle },
  no_response: { label: "No response", color: "var(--muted)", icon: Clock },
};

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function fmtTime(d) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function isPast(d) {
  return new Date(d) < new Date();
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

function RSVPBar({ rsvps = [] }) {
  const counts = { attending: 0, not_attending: 0, maybe: 0, no_response: 0 };
  rsvps.forEach((r) => {
    if (counts[r.status] !== undefined) counts[r.status]++;
  });
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {Object.entries(counts).map(([k, v]) => {
        const c = RSVP_CONFIG[k];
        const Icon = c.icon;
        return (
          <span
            key={k}
            style={{
              fontSize: "0.72rem",
              color: c.color,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon size={11} /> {v} {c.label}
          </span>
        );
      })}
    </div>
  );
}

function MeetingCard({
  meeting,
  isManager,
  userId,
  onRsvp,
  onCancel,
  onUpdate,
}) {
  const [expanded, setExpanded] = useState(false);
  const [rsvping, setRsvping] = useState(false);
  const past = isPast(meeting.scheduledAt);
  const cancelled = !!meeting.cancelledAt;
  const myRsvp = meeting.myRsvp || "no_response";
  const rc = RSVP_CONFIG[myRsvp];

  async function handleRsvp(status) {
    setRsvping(true);
    await onRsvp(meeting._id, status);
    setRsvping(false);
  }

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: `1px solid ${cancelled ? "rgba(248,113,113,0.25)" : "var(--glass-border)"}`,
        borderRadius: 14,
        overflow: "hidden",
        opacity: cancelled ? 0.65 : 1,
      }}
    >
      <div style={{ padding: "16px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Type badge + title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 9px",
                  borderRadius: 50,
                  background:
                    meeting.type === "online"
                      ? "rgba(45,212,191,0.1)"
                      : "rgba(251,191,36,0.1)",
                  border: `1px solid ${meeting.type === "online" ? "rgba(45,212,191,0.25)" : "rgba(251,191,36,0.25)"}`,
                  color: meeting.type === "online" ? "var(--teal)" : "#fbbf24",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                }}
              >
                {meeting.type === "online" ? (
                  <Video size={10} />
                ) : (
                  <MapPin size={10} />
                )}
                {meeting.type === "online"
                  ? PLATFORM_CONFIG[meeting.platform]?.label || "Online"
                  : "In Person"}
              </div>
              {cancelled && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "#f87171",
                    fontWeight: 600,
                  }}
                >
                  Cancelled
                </span>
              )}
              {!cancelled && past && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Past
                </span>
              )}
              {!cancelled && !past && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "#4ade80",
                    fontWeight: 600,
                  }}
                >
                  Upcoming
                </span>
              )}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 6 }}>
              {meeting.title}
            </h3>
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Calendar size={12} /> {fmtDate(meeting.scheduledAt)}
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Clock size={12} /> {fmtTime(meeting.scheduledAt)} ·{" "}
                {meeting.durationMinutes} min
              </span>
              {meeting.type === "online" && meeting.meetingLink && (
                <a
                  href={meeting.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--teal)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={11} /> Join
                </a>
              )}
              {meeting.type === "offline" && meeting.location?.name && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <MapPin size={12} /> {meeting.location.name}
                  {meeting.location.mapLink && (
                    <a
                      href={meeting.location.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--teal)",
                        marginLeft: 4,
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={10} />
                    </a>
                  )}
                </span>
              )}
            </div>
            <RSVPBar rsvps={meeting.rsvps} />
          </div>

          {/* Right actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
              flexShrink: 0,
            }}
          >
            {!cancelled && !past && (
              <div style={{ display: "flex", gap: 5 }}>
                {["attending", "maybe", "not_attending"].map((s) => {
                  const c = RSVP_CONFIG[s];
                  const Icon = c.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => handleRsvp(s)}
                      disabled={rsvping}
                      title={c.label}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `1.5px solid ${myRsvp === s ? c.color : "var(--glass-border)"}`,
                        background:
                          myRsvp === s ? `${c.color}18` : "transparent",
                        color: myRsvp === s ? c.color : "var(--muted)",
                        cursor: "pointer",
                      }}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
            )}
            {(isManager ||
              String(meeting.createdBy?._id || meeting.createdBy) ===
                String(userId)) &&
              !cancelled && (
                <button
                  onClick={() => onCancel(meeting._id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    fontSize: "0.72rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Trash2 size={12} /> Cancel
                </button>
              )}
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--muted)",
              }}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            borderTop: "1px solid var(--glass-border)",
            padding: "14px 20px",
            background: "var(--bg-surface)",
          }}
        >
          {meeting.agenda && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--muted)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 5,
                }}
              >
                Agenda
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {meeting.agenda}
              </p>
            </div>
          )}
          {meeting.type === "online" && meeting.meetingId && (
            <div
              style={{
                marginBottom: 8,
                fontSize: "0.82rem",
                color: "var(--muted)",
              }}
            >
              Meeting ID:{" "}
              <code
                style={{
                  background: "var(--glass-bg)",
                  padding: "2px 8px",
                  borderRadius: 5,
                }}
              >
                {meeting.meetingId}
              </code>
              {meeting.passcode && (
                <>
                  {" "}
                  · Passcode:{" "}
                  <code
                    style={{
                      background: "var(--glass-bg)",
                      padding: "2px 8px",
                      borderRadius: 5,
                    }}
                  >
                    {meeting.passcode}
                  </code>
                </>
              )}
            </div>
          )}
          {meeting.location?.address && (
            <div
              style={{
                marginBottom: 8,
                fontSize: "0.82rem",
                color: "var(--muted)",
              }}
            >
              Address: {meeting.location.address}
            </div>
          )}
          {meeting.notes && (
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--muted)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 5,
                }}
              >
                Meeting Notes
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {meeting.notes}
              </p>
            </div>
          )}
          {/* Attendees */}
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 8,
              }}
            >
              Responses
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {meeting.rsvps.map((r) => {
                const rc = RSVP_CONFIG[r.status] || RSVP_CONFIG.no_response;
                const RIcon = rc.icon;
                const name = r.userId?.name || "Member";
                return (
                  <div
                    key={String(r.userId?._id || r.userId)}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "var(--accent-dim)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        color: "var(--accent)",
                        flexShrink: 0,
                      }}
                    >
                      {name[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: "0.82rem", flex: 1 }}>{name}</span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: rc.color,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <RIcon size={11} /> {rc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MeetingsPage() {
  const { houseId } = useParams();
  const [meetings, setMeetings] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const [form, setForm] = useState({
    title: "",
    agenda: "",
    type: "online",
    scheduledAt: "",
    durationMinutes: 60,
    platform: "zoom",
    meetingLink: "",
    meetingId: "",
    passcode: "",
    location: { name: "", address: "", mapLink: "" },
  });
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setLoc = (k, v) =>
    setForm((p) => ({ ...p, location: { ...p.location, [k]: v } }));

  async function load(upcoming = true) {
    const res = await fetch(
      `/api/houses/${houseId}/meetings?upcoming=${upcoming}`
    );
    const json = await res.json();
    if (json.success) {
      setMeetings(json.data);
      setIsManager(json.isManager);
    }
    setLoading(false);
  }

  useEffect(() => {
    load(!showPast);
    // Get current user id from house endpoint
    fetch(`/api/houses/${houseId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setCurrentUserId(String(j.data.membershipId));
      });
  }, [houseId, showPast]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.scheduledAt) {
      toast.error("Title and date required.");
      return;
    }
    if (form.type === "online" && !form.meetingLink.trim()) {
      toast.error("Meeting link required for online meetings.");
      return;
    }
    if (form.type === "offline" && !form.location.name.trim()) {
      toast.error("Location name required for offline meetings.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }
      setMeetings((p) => [{ ...json.data, myRsvp: "attending" }, ...p]);
      setShowForm(false);
      setForm({
        title: "",
        agenda: "",
        type: "online",
        scheduledAt: "",
        durationMinutes: 60,
        platform: "zoom",
        meetingLink: "",
        meetingId: "",
        passcode: "",
        location: { name: "", address: "", mapLink: "" },
      });
      toast.success("Meeting scheduled. Members notified.");
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRsvp(meetingId, status) {
    const res = await fetch(`/api/meetings/${meetingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rsvp", status }),
    });
    const json = await res.json();
    if (json.success) {
      setMeetings((p) =>
        p.map((m) => (m._id === meetingId ? { ...m, myRsvp: status } : m))
      );
    } else toast.error(json.error);
  }

  async function handleCancel(meetingId) {
    const reason = window.prompt("Reason for cancellation (optional):");
    if (reason === null) return;
    const res = await fetch(`/api/meetings/${meetingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", reason }),
    });
    const json = await res.json();
    if (json.success) {
      setMeetings((p) =>
        p.map((m) =>
          m._id === meetingId
            ? { ...m, cancelledAt: new Date().toISOString() }
            : m
        )
      );
      toast.success("Meeting cancelled.");
    } else toast.error(json.error);
  }

  const upcoming = meetings.filter(
    (m) => !isPast(m.scheduledAt) && !m.cancelledAt
  );
  const past = meetings.filter((m) => isPast(m.scheduledAt) || m.cancelledAt);

  if (loading)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading meetings…
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <Video size={20} color="var(--accent)" />
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Meetings
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {upcoming.length} upcoming
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
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
          <Plus size={14} /> Schedule
        </button>
      </div>

      {/* Create modal */}
      {showForm && (
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
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
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
                Schedule Meeting
              </h2>
              <button
                onClick={() => setShowForm(false)}
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
            <form
              onSubmit={handleCreate}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label style={lS}>Title *</label>
                <input
                  style={iS}
                  placeholder="e.g. Monthly house meeting"
                  value={form.title}
                  onChange={(e) => setF("title", e.target.value)}
                  maxLength={150}
                />
              </div>

              {/* Type toggle */}
              <div>
                <label style={lS}>Meeting Type</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    ["online", "Online (Video)", Video],
                    ["offline", "In Person", MapPin],
                  ].map(([v, l, Icon]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setF("type", v)}
                      style={{
                        padding: "10px",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        border:
                          form.type === v
                            ? "1.5px solid var(--accent)"
                            : "1px solid var(--glass-border)",
                        background:
                          form.type === v
                            ? "var(--accent-dim)"
                            : "var(--glass-bg)",
                        color: form.type === v ? "var(--text)" : "var(--muted)",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                      }}
                    >
                      <Icon size={14} /> {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date + duration */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label style={lS}>Date & Time *</label>
                  <input
                    style={iS}
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setF("scheduledAt", e.target.value)}
                  />
                </div>
                <div>
                  <label style={lS}>Duration (minutes)</label>
                  <input
                    style={iS}
                    type="number"
                    min={5}
                    max={480}
                    value={form.durationMinutes}
                    onChange={(e) =>
                      setF("durationMinutes", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* Online fields */}
              {form.type === "online" && (
                <>
                  <div>
                    <label style={lS}>Platform</label>
                    <select
                      style={{ ...iS, cursor: "pointer" }}
                      value={form.platform}
                      onChange={(e) => setF("platform", e.target.value)}
                    >
                      {Object.entries(PLATFORM_CONFIG).map(([v, c]) => (
                        <option key={v} value={v}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lS}>Meeting Link *</label>
                    <input
                      style={iS}
                      placeholder="https://zoom.us/j/..."
                      value={form.meetingLink}
                      onChange={(e) => setF("meetingLink", e.target.value)}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label style={lS}>Meeting ID</label>
                      <input
                        style={iS}
                        placeholder="Optional"
                        value={form.meetingId}
                        onChange={(e) => setF("meetingId", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={lS}>Passcode</label>
                      <input
                        style={iS}
                        placeholder="Optional"
                        value={form.passcode}
                        onChange={(e) => setF("passcode", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Offline fields */}
              {form.type === "offline" && (
                <>
                  <div>
                    <label style={lS}>Location Name *</label>
                    <input
                      style={iS}
                      placeholder="e.g. Living room, Café Blue"
                      value={form.location.name}
                      onChange={(e) => setLoc("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={lS}>Full Address</label>
                    <input
                      style={iS}
                      placeholder="Street address"
                      value={form.location.address}
                      onChange={(e) => setLoc("address", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={lS}>Google Maps Link</label>
                    <input
                      style={iS}
                      placeholder="https://maps.google.com/..."
                      value={form.location.mapLink}
                      onChange={(e) => setLoc("mapLink", e.target.value)}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={lS}>Agenda (optional)</label>
                <textarea
                  style={{
                    ...iS,
                    minHeight: 80,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                  placeholder="What will be discussed?"
                  value={form.agenda}
                  onChange={(e) => setF("agenda", e.target.value)}
                  maxLength={2000}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "11px",
                  borderRadius: 10,
                  background: submitting
                    ? "var(--glass-bg-mid)"
                    : "var(--accent)",
                  color: submitting ? "var(--muted)" : "#fff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                {submitting && (
                  <Loader2
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                )}
                {submitting ? "Scheduling…" : "Schedule & Notify Members"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming meetings */}
      {upcoming.length === 0 && !showPast ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <Video size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No upcoming meetings.</p>
          <p style={{ fontSize: "0.82rem", marginTop: 4 }}>
            Schedule a house meeting to coordinate with everyone.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {upcoming.map((m) => (
            <MeetingCard
              key={m._id}
              meeting={m}
              isManager={isManager}
              userId={currentUserId}
              onRsvp={handleRsvp}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {/* Past meetings toggle */}
      {past.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => setShowPast((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "6px 0",
            }}
          >
            {showPast ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {past.length} past / cancelled meeting{past.length !== 1 ? "s" : ""}
          </button>
          {showPast && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 10,
                opacity: 0.7,
              }}
            >
              {past.map((m) => (
                <MeetingCard
                  key={m._id}
                  meeting={m}
                  isManager={isManager}
                  userId={currentUserId}
                  onRsvp={handleRsvp}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}

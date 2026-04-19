"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  StickyNote,
  Plus,
  X,
  Loader2,
  Lock,
  Globe,
  Pin,
  Trash2,
  Bell,
} from "lucide-react";

const CATEGORY_CONFIG = {
  general: { label: "General", color: "var(--teal)" },
  maintenance: { label: "Maintenance", color: "#fb923c" },
  finance: { label: "Finance", color: "#fbbf24" },
  reminder: { label: "Reminder", color: "#a78bfa" },
  tenant: { label: "Tenant", color: "#38bdf8" },
  other: { label: "Other", color: "var(--muted)" },
};

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

function NoteCard({ note, isManager, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.other;
  const isLong = note.body.length > 160;

  return (
    <div
      style={{
        background: note.isPrivate ? "rgba(232,98,26,0.04)" : "var(--glass-bg)",
        border: `1px solid ${note.isPinned ? "var(--accent-border)" : note.isPrivate ? "rgba(232,98,26,0.18)" : "var(--glass-border)"}`,
        borderRadius: 13,
      }}
    >
      <div style={{ padding: "14px 18px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              {note.isPinned && <Pin size={12} color="var(--accent)" />}
              <span
                style={{
                  fontSize: "0.67rem",
                  fontWeight: 600,
                  padding: "1px 8px",
                  borderRadius: 50,
                  color: cat.color,
                  background: `${cat.color}18`,
                  border: `1px solid ${cat.color}30`,
                }}
              >
                {cat.label}
              </span>
              {note.isPrivate ? (
                <span
                  style={{
                    fontSize: "0.67rem",
                    color: "var(--accent)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Lock size={9} /> Private
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "0.67rem",
                    color: "var(--teal)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Globe size={9} /> Shared
                </span>
              )}
            </div>
            {note.title && (
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginBottom: 5,
                }}
              >
                {note.title}
              </div>
            )}
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--muted)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {!expanded && isLong ? note.body.slice(0, 160) + "…" : note.body}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--teal)",
                  fontSize: "0.75rem",
                  padding: "4px 0",
                  fontWeight: 600,
                }}
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--faint)",
                marginTop: 6,
              }}
            >
              {new Date(note.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
          {isManager && (
            <button
              onClick={() => onDelete(note._id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--muted)",
                padding: 4,
                flexShrink: 0,
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const { houseId } = useParams();
  const [notes, setNotes] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all"); // all | private | public

  const [form, setForm] = useState({
    title: "",
    body: "",
    isPrivate: true,
    category: "general",
    isPinned: false,
    notifyMembers: false,
  });
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch(`/api/houses/${houseId}/notes`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setNotes(j.data);
          setIsManager(j.isManager);
        }
      })
      .finally(() => setLoading(false));
  }, [houseId]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.body.trim()) {
      toast.error("Note body required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }
      setNotes((p) => [json.data, ...p]);
      setShowForm(false);
      setForm({
        title: "",
        body: "",
        isPrivate: true,
        category: "general",
        isPinned: false,
        notifyMembers: false,
      });
      toast.success(
        form.isPrivate ? "Private note saved." : "Note shared with members."
      );
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this note?")) return;
    setNotes((p) => p.filter((n) => n._id !== id));
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    toast.success("Note deleted.");
  }

  const filtered = notes.filter((n) => {
    if (filter === "private") return n.isPrivate;
    if (filter === "public") return !n.isPrivate;
    return true;
  });

  if (loading)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading notes…
      </div>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
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
            <StickyNote size={20} color="var(--accent)" />
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Notes
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {isManager
              ? "Private and shared notes"
              : "Shared notes from your manager"}
          </p>
        </div>
        {isManager && (
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
            <Plus size={14} /> Add note
          </button>
        )}
      </div>

      {/* Filter tabs */}
      {isManager && (
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[
            ["all", "All"],
            ["private", "Private"],
            ["public", "Shared"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{
                padding: "6px 16px",
                borderRadius: 50,
                fontSize: "0.8rem",
                fontWeight: 600,
                border: "1px solid",
                cursor: "pointer",
                borderColor:
                  filter === v ? "var(--accent)" : "var(--glass-border)",
                background: filter === v ? "var(--accent-dim)" : "transparent",
                color: filter === v ? "var(--accent)" : "var(--muted)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Add note modal */}
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
              maxWidth: 460,
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
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>New Note</h2>
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
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              {/* Visibility toggle */}
              <div>
                <label style={lS}>Visibility</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    [true, "Private", Lock, "Only you see this"],
                    [false, "Shared", Globe, "All members see this"],
                  ].map(([val, l, Icon, hint]) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setF("isPrivate", val)}
                      style={{
                        padding: "10px",
                        borderRadius: 10,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        border:
                          form.isPrivate === val
                            ? "1.5px solid var(--accent)"
                            : "1px solid var(--glass-border)",
                        background:
                          form.isPrivate === val
                            ? "var(--accent-dim)"
                            : "var(--glass-bg)",
                        color:
                          form.isPrivate === val
                            ? "var(--text)"
                            : "var(--muted)",
                        cursor: "pointer",
                      }}
                    >
                      <Icon size={15} />
                      <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>
                        {l}
                      </span>
                      <span style={{ fontSize: "0.68rem" }}>{hint}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lS}>Title (optional)</label>
                <input
                  style={iS}
                  placeholder="Note title"
                  value={form.title}
                  onChange={(e) => setF("title", e.target.value)}
                  maxLength={150}
                />
              </div>
              <div>
                <label style={lS}>Note *</label>
                <textarea
                  style={{
                    ...iS,
                    minHeight: 100,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                  placeholder="Write your note…"
                  value={form.body}
                  onChange={(e) => setF("body", e.target.value)}
                  maxLength={2000}
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
                  <label style={lS}>Category</label>
                  <select
                    style={{ ...iS, cursor: "pointer" }}
                    value={form.category}
                    onChange={(e) => setF("category", e.target.value)}
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([v, c]) => (
                      <option key={v} value={v}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    paddingTop: 22,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      color: "var(--muted)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.isPinned}
                      onChange={(e) => setF("isPinned", e.target.checked)}
                    />{" "}
                    Pin to top
                  </label>
                  {!form.isPrivate && (
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        color: "var(--muted)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.notifyMembers}
                        onChange={(e) =>
                          setF("notifyMembers", e.target.checked)
                        }
                      />{" "}
                      Notify members
                    </label>
                  )}
                </div>
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
                {submitting ? "Saving…" : "Save note"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <StickyNote size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>
            {isManager
              ? "No notes yet. Add a private or shared note."
              : "No shared notes from your manager yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((n) => (
            <NoteCard
              key={n._id}
              note={n}
              isManager={isManager}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}

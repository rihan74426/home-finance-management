"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  X,
  Loader2,
  CheckSquare,
  Square,
  Trash2,
  Calendar,
  Flag,
} from "lucide-react";
import { TASK_PRIORITY, TASK_CATEGORY, TASK_STATUS } from "@/lib/constants";

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "var(--muted)" },
  normal: { label: "Normal", color: "var(--teal)" },
  urgent: { label: "Urgent", color: "#f87171" },
};

const CATEGORY_LABELS = {
  cleaning: "Cleaning",
  grocery: "Grocery",
  maintenance: "Maintenance",
  payment: "Payment",
  admin: "Admin",
  other: "Other",
};

function fmtDate(d) {
  if (!d) return null;
  const date = new Date(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((date - today) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: "#f87171" };
  if (diff === 0) return { text: "Due today", color: "#fbbf24" };
  if (diff === 1) return { text: "Due tomorrow", color: "#fbbf24" };
  return {
    text: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    color: "var(--muted)",
  };
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

export default function TasksPage() {
  const { houseId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("active");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    priority: "normal",
    assignedTo: "",
    dueDate: "",
  });
  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    async function load() {
      const [tRes, mRes] = await Promise.all([
        fetch(`/api/houses/${houseId}/tasks`),
        fetch(`/api/houses/${houseId}/members`),
      ]);
      const [tJson, mJson] = await Promise.all([tRes.json(), mRes.json()]);
      if (tJson.success) setTasks(tJson.data);
      if (mJson.success) setMembers(mJson.data);
      setLoading(false);
    }
    load();
  }, [houseId]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title required");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error);
        return;
      }
      setTasks((p) => [json.data, ...p]);
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        category: "other",
        priority: "normal",
        assignedTo: "",
        dueDate: "",
      });
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleDone(task) {
    const newStatus =
      task.status === TASK_STATUS.DONE ? TASK_STATUS.TODO : TASK_STATUS.DONE;
    setTasks((p) =>
      p.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );
    const res = await fetch(`/api/tasks/${task._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    if (!json.success)
      setTasks((p) => p.map((t) => (t._id === task._id ? task : t)));
  }

  async function handleDelete(id) {
    if (!confirm("Delete this task?")) return;
    setTasks((p) => p.filter((t) => t._id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  const filtered = tasks.filter((t) => {
    if (filter === "active") return t.status !== TASK_STATUS.DONE;
    if (filter === "done") return t.status === TASK_STATUS.DONE;
    return true;
  });

  const activeCount = tasks.filter((t) => t.status !== TASK_STATUS.DONE).length;

  if (loading)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading tasks…
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
            <CheckSquare size={20} color="var(--accent)" />
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Task Board
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {activeCount} active task{activeCount !== 1 ? "s" : ""}
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
          <Plus size={14} /> Add task
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[
          ["active", "Active"],
          ["done", "Done"],
          ["all", "All"],
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
              transition: "all 0.15s",
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
              maxWidth: 420,
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
                Create Task
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
            {error && (
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
                {error}
              </div>
            )}
            <form
              onSubmit={handleCreate}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              <div>
                <label style={lS}>Task title *</label>
                <input
                  style={iS}
                  placeholder="e.g. Clean the kitchen"
                  value={form.title}
                  onChange={(e) => setF("title", e.target.value)}
                />
              </div>
              <div>
                <label style={lS}>Description</label>
                <input
                  style={iS}
                  placeholder="Optional details"
                  value={form.description}
                  onChange={(e) => setF("description", e.target.value)}
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
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lS}>Priority</label>
                  <select
                    style={{ ...iS, cursor: "pointer" }}
                    value={form.priority}
                    onChange={(e) => setF("priority", e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label style={lS}>Assign to</label>
                  <select
                    style={{ ...iS, cursor: "pointer" }}
                    value={form.assignedTo}
                    onChange={(e) => setF("assignedTo", e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.membershipId} value={m.membershipId}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lS}>Due date</label>
                  <input
                    style={iS}
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setF("dueDate", e.target.value)}
                  />
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
                {submitting ? "Creating…" : "Create task"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Task list */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <CheckSquare size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>
            {filter === "done"
              ? "No completed tasks yet."
              : "No active tasks. Add one above."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {filtered.map((task) => {
            const isDone = task.status === TASK_STATUS.DONE;
            const due = fmtDate(task.dueDate);
            const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.normal;
            const assignee = task.assignedTo?.userId;
            return (
              <div
                key={task._id}
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 12,
                  padding: "13px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  opacity: isDone ? 0.6 : 1,
                }}
              >
                <button
                  onClick={() => toggleDone(task)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: isDone ? "#4ade80" : "var(--muted)",
                    padding: "2px 0",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {isDone ? <CheckSquare size={17} /> : <Square size={17} />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        textDecoration: isDone ? "line-through" : "none",
                        color: isDone ? "var(--muted)" : "var(--text)",
                      }}
                    >
                      {task.title}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: pc.color,
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Flag size={10} />
                      {pc.label}
                    </span>
                  </div>
                  {task.description && (
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--muted)",
                        marginBottom: 4,
                      }}
                    >
                      {task.description}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {assignee && (
                      <span
                        style={{ fontSize: "0.75rem", color: "var(--teal)" }}
                      >
                        {assignee.name}
                      </span>
                    )}
                    {due && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: due.color,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Calendar size={11} />
                        {due.text}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(task._id)}
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
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} select option{background:#0e1520;color:#f0ede8}`}</style>
    </div>
  );
}

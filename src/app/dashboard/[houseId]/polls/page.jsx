"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart2,
  Plus,
  X,
  Loader2,
  Check,
  Clock,
  CheckCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";

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
  fontSize: "0.72rem",
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtRelative(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d);
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return fmtDate(d);
}

// ── Single poll card ──────────────────────────────────────────────────────────
function PollCard({ poll, onVote, onClose, isManager }) {
  const [expanded, setExpanded] = useState(false);
  const isClosed =
    poll.isClosed || (poll.deadline && new Date(poll.deadline) < new Date());
  const hasVoted = !!poll.myVote;
  const showResults = hasVoted || isClosed;
  const totalVotes = poll.totalVotes || 0;

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              {isClosed ? (
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 50,
                    color: "var(--muted)",
                    background: "var(--glass-bg-mid)",
                    border: "1px solid var(--glass-border)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Lock size={9} /> Closed
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 50,
                    color: "#4ade80",
                    background: "rgba(74,222,128,0.1)",
                    border: "1px solid rgba(74,222,128,0.22)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#4ade80",
                    }}
                  />{" "}
                  Open
                </span>
              )}
              {poll.isAnonymous && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    padding: "2px 8px",
                    borderRadius: 50,
                    background: "var(--glass-bg-mid)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  Anonymous
                </span>
              )}
              {poll.allowMultiple && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--muted)",
                    padding: "2px 8px",
                    borderRadius: 50,
                    background: "var(--glass-bg-mid)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  Multi-choice
                </span>
              )}
            </div>
            <h3
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                lineHeight: 1.4,
                marginBottom: 4,
              }}
            >
              {poll.question}
            </h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Users size={11} /> {totalVotes} vote
                {totalVotes !== 1 ? "s" : ""}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Clock size={11} /> {fmtRelative(poll.createdAt)}
              </span>
              {poll.createdBy?.name && (
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  by {poll.createdBy.name}
                </span>
              )}
              {poll.deadline && !isClosed && (
                <span style={{ fontSize: "0.75rem", color: "#fbbf24" }}>
                  Closes {fmtDate(poll.deadline)}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {isManager && !isClosed && (
              <button
                onClick={() => onClose(poll._id)}
                title="Close poll"
                style={{
                  padding: "5px 10px",
                  borderRadius: 7,
                  background: "var(--glass-bg-mid)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--muted)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            )}
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
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Options */}
      <div
        style={{
          padding: "14px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {(poll.results || []).map((opt) => {
          const isMyVote =
            poll.myVote === opt.id ||
            (Array.isArray(poll.myVote) && poll.myVote.includes(opt.id));
          const pct = opt.pct || 0;
          return (
            <button
              key={opt.id}
              onClick={() => !isClosed && onVote(poll._id, opt.id)}
              disabled={isClosed}
              style={{
                position: "relative",
                overflow: "hidden",
                width: "100%",
                textAlign: "left",
                padding: "11px 14px",
                borderRadius: 10,
                border: isMyVote
                  ? "1.5px solid var(--accent)"
                  : "1px solid var(--glass-border)",
                background: isMyVote
                  ? "var(--accent-dim)"
                  : "var(--bg-surface)",
                cursor: isClosed ? "default" : "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isClosed && !isMyVote)
                  e.currentTarget.style.borderColor =
                    "var(--glass-border-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isMyVote)
                  e.currentTarget.style.borderColor = "var(--glass-border)";
              }}
            >
              {/* Progress bar */}
              {showResults && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${pct}%`,
                    background: isMyVote
                      ? "rgba(232,98,26,0.15)"
                      : "rgba(255,255,255,0.04)",
                    transition: "width 0.5s ease",
                    pointerEvents: "none",
                  }}
                />
              )}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isMyVote && (
                    <Check
                      size={13}
                      color="var(--accent)"
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: isMyVote ? 600 : 400,
                      color: isMyVote ? "var(--text)" : "var(--muted)",
                    }}
                  >
                    {opt.label}
                  </span>
                </div>
                {showResults && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{ fontSize: "0.72rem", color: "var(--muted)" }}
                    >
                      {opt.count}
                    </span>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: isMyVote ? "var(--accent)" : "var(--muted)",
                        minWidth: 36,
                        textAlign: "right",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Voter list (expanded, non-anonymous only) */}
      {expanded && !poll.isAnonymous && poll.votes?.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--glass-border)",
            padding: "12px 20px",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            Votes
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {poll.votes.map((v, i) => {
              const opt = poll.results?.find((o) => o.id === v.optionId);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                  }}
                >
                  <span style={{ color: "var(--muted)" }}>
                    {v.userId?.name || "Member"}
                  </span>
                  <span style={{ color: "var(--text)", fontWeight: 500 }}>
                    {opt?.label || v.optionId}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Create poll modal ─────────────────────────────────────────────────────────
function CreatePollModal({ houseId, onClose, onCreated }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateOption(i, val) {
    setOptions((p) => p.map((o, idx) => (idx === i ? val : o)));
  }
  function addOption() {
    if (options.length < 8) setOptions((p) => [...p, ""]);
  }
  function removeOption(i) {
    if (options.length > 2) setOptions((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const filled = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim()) {
      toast.error("Question is required.");
      return;
    }
    if (filled.length < 2) {
      toast.error("At least 2 options required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          options: filled,
          isAnonymous,
          allowMultiple,
          deadline: deadline || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }
      onCreated(json.data);
      toast.success("Poll created.");
      onClose();
    } catch {
      toast.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
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
          borderRadius: 18,
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
            marginBottom: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <BarChart2 size={18} color="var(--accent)" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Create Poll</h2>
          </div>
          <button
            onClick={onClose}
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
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div>
            <label style={lS}>Question *</label>
            <input
              style={iS}
              placeholder="e.g. Should we get a new AC?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={300}
              autoFocus
            />
          </div>

          <div>
            <label style={lS}>Options *</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {options.map((opt, i) => (
                <div key={i} style={{ display: "flex", gap: 7 }}>
                  <input
                    style={{ ...iS, flex: 1 }}
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      style={{
                        background: "none",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 8,
                        padding: "0 10px",
                        cursor: "pointer",
                        color: "var(--muted)",
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 8 && (
                <button
                  type="button"
                  onClick={addOption}
                  style={{
                    padding: "8px",
                    borderRadius: 9,
                    border: "1px dashed var(--glass-border)",
                    background: "none",
                    color: "var(--muted)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  + Add option
                </button>
              )}
            </div>
          </div>

          <div>
            <label style={lS}>Deadline (optional)</label>
            <input
              style={iS}
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                cursor: "pointer",
                fontSize: "0.875rem",
                color: "var(--muted)",
              }}
            >
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              Anonymous votes (hide who voted for what)
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                cursor: "pointer",
                fontSize: "0.875rem",
                color: "var(--muted)",
              }}
            >
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
              />
              Allow multiple choices
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "12px",
              borderRadius: 11,
              background: submitting ? "var(--glass-bg-mid)" : "var(--accent)",
              color: submitting ? "var(--muted)" : "#fff",
              fontWeight: 700,
              fontSize: "0.9rem",
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
                size={15}
                style={{ animation: "spin 1s linear infinite" }}
              />
            )}
            {submitting ? "Creating…" : "Create Poll"}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PollsPage() {
  const { houseId } = useParams();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("open"); // open | closed | all

  useEffect(() => {
    fetchPolls();
  }, [houseId]);

  async function fetchPolls() {
    try {
      const [pRes, hRes] = await Promise.all([
        fetch(`/api/houses/${houseId}/polls`),
        fetch(`/api/houses/${houseId}`),
      ]);
      const [pJson, hJson] = await Promise.all([pRes.json(), hRes.json()]);
      if (pJson.success) setPolls(pJson.data);
      if (hJson.success) setIsManager(hJson.data.role === "manager");
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(pollId, optionId) {
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    const json = await res.json();
    if (json.success) {
      setPolls((p) =>
        p.map((poll) =>
          poll._id === pollId
            ? {
                ...poll,
                results: json.data.results,
                myVote: json.data.myVote,
                totalVotes: json.data.totalVotes,
              }
            : poll
        )
      );
    } else {
      toast.error(json.error || "Failed to vote.");
    }
  }

  async function handleClose(pollId) {
    const res = await fetch(`/api/polls/${pollId}/vote`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setPolls((p) =>
        p.map((poll) =>
          poll._id === pollId ? { ...poll, isClosed: true } : poll
        )
      );
      toast.success("Poll closed.");
    } else {
      toast.error(json.error || "Failed to close poll.");
    }
  }

  function handleCreated(newPoll) {
    // Enrich with empty results
    const enriched = {
      ...newPoll,
      results: (newPoll.options || []).map((o) => ({
        id: o.id,
        label: o.label,
        count: 0,
        pct: 0,
      })),
      myVote: null,
      totalVotes: 0,
    };
    setPolls((p) => [enriched, ...p]);
  }

  const filtered = polls.filter((p) => {
    const isClosed =
      p.isClosed || (p.deadline && new Date(p.deadline) < new Date());
    if (filter === "open") return !isClosed;
    if (filter === "closed") return isClosed;
    return true;
  });

  const openCount = polls.filter(
    (p) => !p.isClosed && !(p.deadline && new Date(p.deadline) < new Date())
  ).length;

  if (loading) return <PollsSkeleton />;

  return (
    <div>
      {/* Header */}
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
            <BarChart2 size={20} color="var(--accent)" />
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Polls
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {openCount} open poll{openCount !== 1 ? "s" : ""} · {polls.length}{" "}
            total
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
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
          <Plus size={14} /> Create poll
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[
          ["open", "Open"],
          ["closed", "Closed"],
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

      {/* Poll list */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            justifyItems: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <BarChart2 size={40} style={{ marginBottom: 12, opacity: 0.25 }} />
          <p style={{ fontSize: "0.875rem" }}>
            {filter === "open"
              ? "No open polls. Create one above."
              : `No ${filter} polls.`}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((poll) => (
            <PollCard
              key={poll._id}
              poll={poll}
              onVote={handleVote}
              onClose={handleClose}
              isManager={isManager}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePollModal
          houseId={houseId}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function PollsSkeleton() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 140,
            height: 28,
            borderRadius: 8,
            background: "var(--glass-bg-mid)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            width: 110,
            height: 36,
            borderRadius: 50,
            background: "var(--glass-bg-mid)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            height: 180,
            borderRadius: 16,
            background: "var(--glass-bg-mid)",
            marginBottom: 12,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

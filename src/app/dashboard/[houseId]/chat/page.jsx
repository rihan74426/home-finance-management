"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  MessageSquare,
  Plus,
  Send,
  X,
  Hash,
  Loader2,
  BarChart2,
  CheckCircle,
  Clock,
} from "lucide-react";

const POLL_INTERVAL = 3000;

function fmtTime(d) {
  const date = new Date(d);
  const diff = Date.now() - date;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function Avatar({ name, size = 32 }) {
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
        fontSize: size * 0.36,
        fontWeight: 700,
        color: "var(--accent)",
        flexShrink: 0,
      }}
    >
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function PollCard({ poll, onVote }) {
  const isClosed =
    poll.isClosed || (poll.deadline && new Date(poll.deadline) < new Date());
  const hasVoted = !!poll.myVote;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--glass-border)",
        borderRadius: 12,
        padding: "14px 16px",
        marginTop: 8,
        maxWidth: 360,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginBottom: 10,
        }}
      >
        <BarChart2 size={13} color="var(--accent)" />
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "var(--accent)",
          }}
        >
          {isClosed ? "Poll closed" : "Poll"}
        </span>
        {poll.isAnonymous && (
          <span
            style={{
              fontSize: "0.68rem",
              color: "var(--muted)",
              background: "var(--glass-bg-mid)",
              padding: "1px 7px",
              borderRadius: 50,
            }}
          >
            Anonymous
          </span>
        )}
      </div>
      <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 10 }}>
        {poll.question}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {poll.results?.map((opt) => {
          const isMyVote = poll.myVote === opt.id;
          const showBar = hasVoted || isClosed;
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
                padding: "8px 11px",
                borderRadius: 8,
                border: isMyVote
                  ? "1.5px solid var(--accent)"
                  : "1px solid var(--glass-border)",
                background: isMyVote ? "var(--accent-dim)" : "var(--glass-bg)",
                cursor: isClosed ? "default" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {showBar && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${opt.pct}%`,
                    background: isMyVote
                      ? "rgba(232,98,26,0.12)"
                      : "rgba(255,255,255,0.04)",
                    transition: "width 0.4s ease",
                  }}
                />
              )}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: isMyVote ? 600 : 400,
                  }}
                >
                  {isMyVote && (
                    <CheckCircle
                      size={11}
                      style={{
                        marginRight: 5,
                        display: "inline",
                        verticalAlign: "middle",
                      }}
                      color="var(--accent)"
                    />
                  )}
                  {opt.label}
                </span>
                {showBar && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--muted)",
                      flexShrink: 0,
                    }}
                  >
                    {opt.count} · {opt.pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: "0.7rem",
          color: "var(--muted)",
          display: "flex",
          gap: 10,
        }}
      >
        <span>
          {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
        </span>
        {poll.deadline && !isClosed && (
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
          >
            <Clock size={10} />
            Ends{" "}
            {new Date(poll.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}

function CreatePollModal({ onClose, onCreated, houseId }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateOption(i, val) {
    setOptions((p) => p.map((o, idx) => (idx === i ? val : o)));
  }
  function addOption() {
    if (options.length < 6) setOptions((p) => [...p, ""]);
  }
  function removeOption(i) {
    if (options.length > 2) setOptions((p) => p.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const filled = options.filter((o) => o.trim());
    if (!question.trim()) {
      toast.error("Question required.");
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
        background: "rgba(0,0,0,0.7)",
        zIndex: 200,
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
          padding: 24,
          width: "100%",
          maxWidth: 400,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 size={16} color="var(--accent)" />
            <h2 style={{ fontSize: "1rem", fontWeight: 800 }}>Create Poll</h2>
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
            <X size={16} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 13 }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--muted)",
                marginBottom: 5,
                textTransform: "uppercase",
              }}
            >
              Question *
            </label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Should we get a new AC?"
              maxLength={300}
              style={{
                width: "100%",
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: 9,
                padding: "9px 12px",
                color: "var(--text)",
                fontSize: "0.875rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--muted)",
                marginBottom: 5,
                textTransform: "uppercase",
              }}
            >
              Options *
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {options.map((opt, i) => (
                <div key={i} style={{ display: "flex", gap: 6 }}>
                  <input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    maxLength={100}
                    style={{
                      flex: 1,
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: 9,
                      padding: "8px 12px",
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted)",
                        padding: "0 4px",
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  style={{
                    background: "none",
                    border: "1px dashed var(--glass-border)",
                    borderRadius: 9,
                    padding: "7px",
                    color: "var(--muted)",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                  }}
                >
                  + Add option
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                fontSize: "0.82rem",
                color: "var(--muted)",
              }}
            >
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              Anonymous
            </label>
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--muted)",
                marginBottom: 5,
                textTransform: "uppercase",
              }}
            >
              Deadline (optional)
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{
                width: "100%",
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: 9,
                padding: "8px 12px",
                color: "var(--text)",
                fontSize: "0.85rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px",
              borderRadius: 10,
              background: submitting ? "var(--glass-bg-mid)" : "var(--accent)",
              color: submitting ? "var(--muted)" : "#fff",
              fontWeight: 700,
              fontSize: "0.875rem",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            {submitting && (
              <Loader2
                size={13}
                style={{ animation: "spin 1s linear infinite" }}
              />
            )}
            {submitting ? "Creating…" : "Create Poll"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { houseId } = useParams();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [showNewPoll, setShowNewPoll] = useState(false);
  const [newThreadName, setNewThreadName] = useState("");
  const [creatingThread, setCreatingThread] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);
  const lastMsgIdRef = useRef(null);

  // Load threads
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/houses/${houseId}/threads`);
      const json = await res.json();
      if (json.success) {
        setThreads(json.data);
        const general =
          json.data.find((t) => t.type === "general") || json.data[0];
        if (general) setActiveThread(general);
      }
      setLoadingThreads(false);
    }
    load();
  }, [houseId]);

  // Load polls
  useEffect(() => {
    async function loadPolls() {
      const res = await fetch(`/api/houses/${houseId}/polls`);
      const json = await res.json();
      if (json.success) setPolls(json.data);
    }
    loadPolls();
  }, [houseId]);

  // Load messages + start poll when active thread changes
  useEffect(() => {
    if (!activeThread) return;
    clearInterval(pollRef.current);
    lastMsgIdRef.current = null;
    setMessages([]);
    setLoadingMsgs(true);

    async function loadInitial() {
      const res = await fetch(
        `/api/threads/${activeThread._id}/messages?limit=40`
      );
      const json = await res.json();
      if (json.success) {
        setMessages(json.data);
        lastMsgIdRef.current = json.data[json.data.length - 1]?._id ?? null;
      }
      setLoadingMsgs(false);
      scrollBottom();
    }
    loadInitial();

    pollRef.current = setInterval(async () => {
      if (!lastMsgIdRef.current) return;
      const res = await fetch(
        `/api/threads/${activeThread._id}/messages?after=${lastMsgIdRef.current}`
      );
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setMessages((p) => [...p, ...json.data]);
        lastMsgIdRef.current = json.data[json.data.length - 1]._id;
        scrollBottom();
      }
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [activeThread?._id]);

  function scrollBottom() {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      60
    );
  }

  async function handleSend(e) {
    e?.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setText("");

    const tempId = `tmp_${Date.now()}`;
    const tmpMsg = {
      _id: tempId,
      text: t,
      senderId: { name: "You" },
      createdAt: new Date().toISOString(),
      _temp: true,
    };
    setMessages((p) => [...p, tmpMsg]);
    scrollBottom();

    try {
      const res = await fetch(`/api/threads/${activeThread._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((p) => p.map((m) => (m._id === tempId ? json.data : m)));
        lastMsgIdRef.current = json.data._id;
      } else {
        setMessages((p) => p.filter((m) => m._id !== tempId));
        setText(t);
        toast.error("Failed to send message.");
      }
    } catch {
      setMessages((p) => p.filter((m) => m._id !== tempId));
      setText(t);
      toast.error("Network error.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleCreateThread(e) {
    e.preventDefault();
    if (!newThreadName.trim() || creatingThread) return;
    setCreatingThread(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newThreadName.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setThreads((p) => [...p, json.data]);
        setActiveThread(json.data);
        setNewThreadName("");
        setShowNewThread(false);
        toast.success("Channel created.");
      }
    } finally {
      setCreatingThread(false);
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

  // Group consecutive messages from same sender within 5 min
  const grouped = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    const same =
      prev &&
      String(prev.senderId?._id) === String(msg.senderId?._id) &&
      new Date(msg.createdAt) - new Date(prev.createdAt) < 300000;
    if (same) grouped[grouped.length - 1].msgs.push(msg);
    else grouped.push({ sender: msg.senderId, msgs: [msg] });
  });

  // Polls not tied to any thread show in general
  const threadPolls = polls.filter(
    (p) =>
      activeThread &&
      (p.threadId === activeThread._id ||
        (!p.threadId && activeThread.type === "general"))
  );

  if (loadingThreads)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading chat…
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 84px)",
        border: "1px solid var(--glass-border)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 210,
          flexShrink: 0,
          borderRight: "1px solid var(--glass-border)",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-mid)",
        }}
      >
        <div
          style={{
            padding: "13px 14px 10px",
            borderBottom: "1px solid var(--glass-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <MessageSquare size={14} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: "0.82rem" }}>
              Channels
            </span>
          </div>
          <button
            onClick={() => setShowNewThread((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: 3,
            }}
          >
            {showNewThread ? <X size={14} /> : <Plus size={14} />}
          </button>
        </div>

        {showNewThread && (
          <form
            onSubmit={handleCreateThread}
            style={{
              padding: "9px 10px",
              borderBottom: "1px solid var(--glass-border)",
              display: "flex",
              gap: 6,
            }}
          >
            <input
              autoFocus
              style={{
                flex: 1,
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: 7,
                padding: "6px 9px",
                color: "var(--text)",
                fontSize: "0.78rem",
                outline: "none",
              }}
              placeholder="channel-name"
              value={newThreadName}
              onChange={(e) => setNewThreadName(e.target.value)}
              maxLength={80}
            />
            <button
              type="submit"
              disabled={creatingThread}
              style={{
                background: "var(--accent)",
                border: "none",
                borderRadius: 7,
                padding: "6px 9px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              {creatingThread ? (
                <Loader2
                  size={11}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                "Add"
              )}
            </button>
          </form>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
          {threads.map((t) => {
            const on = activeThread?._id === t._id;
            return (
              <button
                key={t._id}
                onClick={() => setActiveThread(t)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 9px",
                  borderRadius: 8,
                  marginBottom: 1,
                  background: on ? "var(--glass-bg-mid)" : "transparent",
                  border: on
                    ? "1px solid var(--glass-border)"
                    : "1px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Hash
                  size={12}
                  color={on ? "var(--accent)" : "var(--muted)"}
                  style={{ flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: on ? 600 : 400,
                      color: on ? "var(--text)" : "var(--muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t.name}
                  </div>
                  {t.lastMessageText && (
                    <div
                      style={{
                        fontSize: "0.67rem",
                        color: "var(--muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginTop: 1,
                      }}
                    >
                      {t.lastMessageText}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {activeThread ? (
          <>
            {/* Header */}
            <div
              style={{
                padding: "12px 18px",
                borderBottom: "1px solid var(--glass-border)",
                display: "flex",
                alignItems: "center",
                gap: 9,
                flexShrink: 0,
              }}
            >
              <Hash size={16} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                {activeThread.name}
              </span>
              <div style={{ marginLeft: "auto" }}>
                <button
                  onClick={() => setShowNewPoll(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 12px",
                    borderRadius: 50,
                    background: "var(--glass-bg-mid)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--muted)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <BarChart2 size={12} /> Poll
                </button>
              </div>
            </div>

            {/* Messages + polls */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {loadingMsgs ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                  }}
                >
                  <Loader2
                    size={20}
                    style={{
                      animation: "spin 1s linear infinite",
                      color: "var(--muted)",
                    }}
                  />
                </div>
              ) : (
                <>
                  {/* Active polls for this thread */}
                  {threadPolls.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      {threadPolls.map((poll) => (
                        <PollCard
                          key={poll._id}
                          poll={poll}
                          onVote={handleVote}
                        />
                      ))}
                    </div>
                  )}

                  {grouped.length === 0 && threadPolls.length === 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                        color: "var(--muted)",
                        textAlign: "center",
                        gap: 8,
                      }}
                    >
                      <Hash size={32} style={{ opacity: 0.15 }} />
                      <p style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                        #{activeThread.name}
                      </p>
                      <p style={{ fontSize: "0.8rem" }}>
                        No messages yet. Say something!
                      </p>
                    </div>
                  ) : (
                    grouped.map((group, gi) => (
                      <div
                        key={group.msgs[0]._id}
                        style={{
                          display: "flex",
                          gap: 10,
                          marginTop: gi === 0 ? 0 : 12,
                        }}
                      >
                        <Avatar name={group.sender?.name} size={32} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: 8,
                              marginBottom: 2,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.84rem",
                                fontWeight: 700,
                                color: group.msgs[0]._temp
                                  ? "var(--muted)"
                                  : "var(--text)",
                              }}
                            >
                              {group.sender?.name || "Unknown"}
                            </span>
                            <span
                              style={{
                                fontSize: "0.67rem",
                                color: "var(--muted)",
                              }}
                            >
                              {fmtTime(group.msgs[0].createdAt)}
                            </span>
                          </div>
                          {group.msgs.map((msg) => (
                            <div
                              key={msg._id}
                              style={{
                                fontSize: "0.875rem",
                                lineHeight: 1.55,
                                color: "var(--text)",
                                wordBreak: "break-word",
                                opacity: msg._temp ? 0.5 : 1,
                                marginBottom: 1,
                              }}
                            >
                              {msg.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: "10px 14px 12px",
                borderTop: "1px solid var(--glass-border)",
                flexShrink: 0,
              }}
            >
              <form
                onSubmit={handleSend}
                style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
              >
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={handleKey}
                  placeholder={`Message #${activeThread.name}`}
                  rows={1}
                  maxLength={2000}
                  style={{
                    flex: 1,
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 10,
                    padding: "9px 13px",
                    color: "var(--text)",
                    fontSize: "0.875rem",
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                    maxHeight: 120,
                    overflowY: "auto",
                  }}
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: text.trim()
                      ? "var(--accent)"
                      : "var(--glass-bg-mid)",
                    border: "none",
                    cursor: text.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                >
                  {sending ? (
                    <Loader2
                      size={14}
                      style={{
                        animation: "spin 1s linear infinite",
                        color: "var(--muted)",
                      }}
                    />
                  ) : (
                    <Send
                      size={14}
                      color={text.trim() ? "#fff" : "var(--muted)"}
                    />
                  )}
                </button>
              </form>
              <div
                style={{
                  fontSize: "0.67rem",
                  color: "var(--muted)",
                  marginTop: 4,
                  paddingLeft: 1,
                }}
              >
                Enter to send · Shift+Enter for new line
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--muted)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <MessageSquare
                size={36}
                style={{ marginBottom: 12, opacity: 0.15 }}
              />
              <p style={{ fontSize: "0.9rem" }}>Select a channel</p>
            </div>
          </div>
        )}
      </div>

      {/* Poll creation modal */}
      {showNewPoll && (
        <CreatePollModal
          houseId={houseId}
          onClose={() => setShowNewPoll(false)}
          onCreated={(poll) => {
            setPolls((p) => [
              {
                ...poll,
                results: poll.options?.map((o) => ({
                  id: o.id,
                  label: o.label,
                  count: 0,
                  pct: 0,
                })),
                myVote: null,
                totalVotes: 0,
              },
              ...p,
            ]);
            setShowNewPoll(false);
          }}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

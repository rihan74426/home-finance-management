"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { MessageSquare, Plus, Send, X, Hash, Loader2 } from "lucide-react";

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

export default function ChatPage() {
  const { houseId } = useParams();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
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
      }
    } catch {
      setMessages((p) => p.filter((m) => m._id !== tempId));
      setText(t);
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
      }
    } finally {
      setCreatingThread(false);
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
              {activeThread.description && (
                <span
                  style={{
                    fontSize: "0.77rem",
                    color: "var(--muted)",
                    borderLeft: "1px solid var(--glass-border)",
                    paddingLeft: 10,
                  }}
                >
                  {activeThread.description}
                </span>
              )}
            </div>

            {/* Messages */}
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
              ) : grouped.length === 0 ? (
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
                          style={{ fontSize: "0.67rem", color: "var(--muted)" }}
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

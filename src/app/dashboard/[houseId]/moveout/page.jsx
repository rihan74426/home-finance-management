"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  LogOut,
  Check,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const ITEM_STATUS = {
  pending: { label: "Pending", color: "var(--muted)", icon: Clock },
  done: { label: "Done", color: "#4ade80", icon: Check },
  waived: { label: "Waived", color: "#fbbf24", icon: XCircle },
};

const MOVEOUT_STATUS = {
  draft: { label: "In Progress", color: "var(--teal)" },
  pending_review: { label: "Awaiting Approval", color: "#fbbf24" },
  approved: { label: "Approved", color: "#4ade80" },
  rejected: { label: "Rejected — Action Required", color: "#f87171" },
};

function ChecklistView({ checklist, isManager, onAction }) {
  const [loading, setLoading] = useState({});
  const allRequired = checklist.items.filter((i) => i.isRequired);
  const doneRequired = allRequired.filter((i) => i.status !== "pending");
  const progress =
    allRequired.length > 0
      ? Math.round((doneRequired.length / allRequired.length) * 100)
      : 0;
  const ms = MOVEOUT_STATUS[checklist.status] || MOVEOUT_STATUS.draft;

  async function handleItem(itemId, status) {
    setLoading((p) => ({ ...p, [itemId]: true }));
    await onAction("update_item", {
      checklistId: checklist._id,
      itemId,
      itemStatus: status,
    });
    setLoading((p) => ({ ...p, [itemId]: false }));
  }

  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
              {checklist.userId?.name || "Member"}'s Move-Out
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--muted)",
                marginTop: 2,
              }}
            >
              Target:{" "}
              {new Date(checklist.moveOutDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 50,
              color: ms.color,
              background: `${ms.color}18`,
              border: `1px solid ${ms.color}30`,
            }}
          >
            {ms.label}
          </span>
        </div>
        {/* Progress bar */}
        <div
          style={{
            background: "var(--glass-border)",
            borderRadius: 50,
            height: 5,
            marginTop: 6,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 50,
              background: progress === 100 ? "#4ade80" : "var(--accent)",
              width: `${progress}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div
          style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}
        >
          {doneRequired.length} / {allRequired.length} required items completed
        </div>
      </div>

      <div style={{ padding: "12px 20px" }}>
        {checklist.items.map((item) => {
          const s = ITEM_STATUS[item.status] || ITEM_STATUS.pending;
          const SIcon = s.icon;
          return (
            <div
              key={item._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 0",
                borderBottom: "1px solid var(--glass-border)",
              }}
            >
              <button
                onClick={() => {
                  if (item.status === "pending") handleItem(item._id, "done");
                  else if (item.status === "done")
                    handleItem(item._id, "pending");
                }}
                disabled={
                  loading[item._id] ||
                  checklist.status === "approved" ||
                  checklist.status === "pending_review"
                }
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: `2px solid ${item.status === "done" ? "#4ade80" : "var(--glass-border-hover)"}`,
                  background:
                    item.status === "done"
                      ? "rgba(74,222,128,0.15)"
                      : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {loading[item._id] ? (
                  <Loader2
                    size={11}
                    style={{
                      animation: "spin 0.7s linear infinite",
                      color: "var(--muted)",
                    }}
                  />
                ) : item.status === "done" ? (
                  <Check size={12} color="#4ade80" strokeWidth={3} />
                ) : null}
              </button>
              <span
                style={{
                  flex: 1,
                  fontSize: "0.875rem",
                  textDecoration:
                    item.status === "done" ? "line-through" : "none",
                  color:
                    item.status === "done" ? "var(--muted)" : "var(--text)",
                }}
              >
                {item.label}
                {item.isRequired && (
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "#f87171",
                      marginLeft: 5,
                    }}
                  >
                    *
                  </span>
                )}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: s.color,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <SIcon size={11} /> {s.label}
              </span>
              {isManager && item.status === "pending" && (
                <button
                  onClick={() => handleItem(item._id, "waived")}
                  style={{
                    fontSize: "0.68rem",
                    padding: "2px 8px",
                    borderRadius: 50,
                    background: "rgba(251,191,36,0.1)",
                    border: "1px solid rgba(251,191,36,0.25)",
                    color: "#fbbf24",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Waive
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {checklist.status !== "approved" && (
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--glass-border)",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {checklist.status === "draft" && !isManager && (
            <button
              onClick={() => onAction("submit", { checklistId: checklist._id })}
              style={{
                padding: "9px 20px",
                borderRadius: 50,
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.825rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Submit for Review →
            </button>
          )}
          {checklist.status === "pending_review" && isManager && (
            <>
              <button
                onClick={() =>
                  onAction("approve", { checklistId: checklist._id })
                }
                style={{
                  padding: "9px 20px",
                  borderRadius: 50,
                  background: "rgba(74,222,128,0.15)",
                  border: "1px solid rgba(74,222,128,0.3)",
                  color: "#4ade80",
                  fontWeight: 700,
                  fontSize: "0.825rem",
                  cursor: "pointer",
                }}
              >
                Approve & Remove Member
              </button>
              <button
                onClick={() =>
                  onAction("reject", { checklistId: checklist._id })
                }
                style={{
                  padding: "9px 20px",
                  borderRadius: 50,
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.25)",
                  color: "#f87171",
                  fontWeight: 700,
                  fontSize: "0.825rem",
                  cursor: "pointer",
                }}
              >
                Send Back
              </button>
            </>
          )}
        </div>
      )}

      {checklist.status === "approved" && (
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--glass-border)",
            background: "rgba(74,222,128,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "0.82rem",
              color: "#4ade80",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Check size={14} /> Move-out approved. Membership deactivated.
          </div>
          {checklist.managerNote && (
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--muted)",
                marginTop: 4,
              }}
            >
              Note: {checklist.managerNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MoveOutPage() {
  const { houseId } = useParams();
  const [data, setData] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [moveOutDate, setMoveOutDate] = useState("");
  const [showInitiate, setShowInitiate] = useState(false);

  useEffect(() => {
    fetch(`/api/houses/${houseId}/moveout`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setData(j.data);
          setIsManager(j.isManager);
        }
      })
      .finally(() => setLoading(false));
  }, [houseId]);

  async function handleInitiate(e) {
    e.preventDefault();
    if (!moveOutDate) {
      toast.error("Please select a move-out date.");
      return;
    }
    setInitiating(true);
    try {
      const res = await fetch(`/api/houses/${houseId}/moveout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moveOutDate }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }
      setData(json.data);
      setShowInitiate(false);
      toast.success("Move-out checklist created.");
    } catch {
      toast.error("Network error.");
    } finally {
      setInitiating(false);
    }
  }

  async function handleAction(action, body) {
    const res = await fetch(`/api/houses/${houseId}/moveout`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    const json = await res.json();
    if (json.success) {
      setData(json.data);
      if (action === "approve")
        toast.success("Move-out approved. Member removed.");
      else if (action === "reject")
        toast.success("Checklist sent back for revision.");
      else if (action === "submit")
        toast.success("Submitted for manager review.");
    } else {
      if (json.pendingItems) {
        toast.error(`Still pending: ${json.pendingItems.join(", ")}`);
      } else {
        toast.error(json.error);
      }
    }
  }

  if (loading)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading…
      </div>
    );

  const checklists = isManager
    ? Array.isArray(data)
      ? data
      : []
    : data
      ? [data]
      : [];

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <LogOut size={20} color="var(--accent)" />
            <h1
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Move-Out
            </h1>
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {isManager
              ? `${checklists.length} active request${checklists.length !== 1 ? "s" : ""}`
              : "Your move-out checklist"}
          </p>
        </div>
        {!isManager && !data && (
          <button
            onClick={() => setShowInitiate(true)}
            style={{
              padding: "9px 18px",
              borderRadius: 50,
              background: "rgba(248,113,113,0.15)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#f87171",
              fontWeight: 600,
              fontSize: "0.825rem",
              cursor: "pointer",
            }}
          >
            Initiate Move-Out
          </button>
        )}
      </div>

      {/* Initiate modal */}
      {showInitiate && (
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
              maxWidth: 380,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                Initiate Move-Out
              </h2>
              <button
                onClick={() => setShowInitiate(false)}
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
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--muted)",
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              This will create a checklist. You'll need to complete all required
              items before the manager can approve your move-out.
            </p>
            <form
              onSubmit={handleInitiate}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              <div>
                <label style={{ ...lS }}>Target Move-Out Date *</label>
                <input
                  type="date"
                  style={{
                    width: "100%",
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 10,
                    padding: "9px 13px",
                    color: "var(--text)",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  value={moveOutDate}
                  onChange={(e) => setMoveOutDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <button
                type="submit"
                disabled={initiating}
                style={{
                  padding: "11px",
                  borderRadius: 10,
                  background: initiating
                    ? "var(--glass-bg-mid)"
                    : "rgba(248,113,113,0.15)",
                  border: "1px solid rgba(248,113,113,0.3)",
                  color: initiating ? "var(--muted)" : "#f87171",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: initiating ? "not-allowed" : "pointer",
                }}
              >
                {initiating ? "Creating…" : "Start Checklist"}
              </button>
            </form>
          </div>
        </div>
      )}

      {checklists.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
          }}
        >
          <LogOut size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>
            {isManager
              ? "No move-out requests."
              : "No active move-out checklist."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {checklists.map((c) => (
            <ChecklistView
              key={c._id}
              checklist={c}
              isManager={isManager}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const lS = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

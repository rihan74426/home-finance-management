"use client";

import { useUndo } from "@/hooks/useUndo";

const DELAY = 5000;

export function usePageActions({ houseId } = {}) {
  const { withUndo } = useUndo(DELAY);

  // ── TASKS ─────────────────────────────────────────────────────────────────

  function deleteTask({ taskId, taskTitle, tasks, setTasks }) {
    const snapshot = [...tasks];
    withUndo({
      message: `Task "${taskTitle || "task"}" deleted`,
      optimisticUpdate: () =>
        setTasks((p) => p.filter((t) => t._id !== taskId)),
      revert: () => setTasks(snapshot),
      apiCall: () =>
        fetch(`/api/tasks/${taskId}`, { method: "DELETE" }).then(async (r) => {
          const j = await r.json();
          if (!j.success) throw new Error(j.error || "Failed to delete task");
        }),
    });
  }

  function toggleTaskDone({ task, newStatus, tasks, setTasks }) {
    const snapshot = [...tasks];
    const label = newStatus === "done" ? "Task marked done" : "Task reopened";
    withUndo({
      message: label,
      optimisticUpdate: () =>
        setTasks((p) =>
          p.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
        ),
      revert: () => setTasks(snapshot),
      apiCall: () =>
        fetch(`/api/tasks/${task._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }).then(async (r) => {
          const j = await r.json();
          if (!j.success) throw new Error(j.error || "Failed to update task");
        }),
    });
  }

  // ── GROCERY ───────────────────────────────────────────────────────────────
  // Note: grocery actions accept onSuccess/onError so the page can manage
  // its own pendingIds/deletedIds refs for polling protection.

  function deleteGroceryItem({
    itemId,
    itemName,
    items,
    setItems,
    onSuccess,
    onError,
  }) {
    const snapshot = [...items];
    withUndo({
      message: `"${itemName || "Item"}" removed`,
      optimisticUpdate: () =>
        setItems((p) => p.filter((i) => i._id !== itemId)),
      revert: () => {
        setItems(snapshot);
        if (onError) onError();
      },
      apiCall: () =>
        fetch(`/api/grocery/${itemId}`, { method: "DELETE" }).then(
          async (r) => {
            const j = await r.json();
            if (!j.success) throw new Error(j.error || "Failed to delete item");
          }
        ),
      onSuccess,
      onError,
    });
  }

  function toggleGroceryBought({
    item,
    items,
    setItems,
    setToggling,
    onSuccess,
    onError,
  }) {
    const next = !item.isBought;
    const snapshot = [...items];
    const id = String(item._id);

    if (setToggling) setToggling((p) => ({ ...p, [id]: true }));

    withUndo({
      message: next
        ? `"${item.name}" marked bought`
        : `"${item.name}" unmarked`,
      optimisticUpdate: () =>
        setItems((p) =>
          p.map((i) => (String(i._id) === id ? { ...i, isBought: next } : i))
        ),
      revert: () => {
        setItems(snapshot);
        if (setToggling) setToggling((p) => ({ ...p, [id]: false }));
        if (onError) onError();
      },
      apiCall: () =>
        fetch(`/api/grocery/${item._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isBought: next }),
        }).then(async (r) => {
          const j = await r.json();
          if (!j.success) throw new Error(j.error || "Failed to update item");
        }),
      onSuccess: () => {
        if (setToggling) setToggling((p) => ({ ...p, [id]: false }));
        if (onSuccess) onSuccess();
      },
      onError: () => {
        if (setToggling) setToggling((p) => ({ ...p, [id]: false }));
        if (onError) onError();
      },
    });
  }

  // ── VAULT ─────────────────────────────────────────────────────────────────

  function deleteVaultItem({ itemId, itemLabel, items, setItems }) {
    const snapshot = [...items];
    withUndo({
      message: `"${itemLabel || "Vault item"}" deleted`,
      optimisticUpdate: () =>
        setItems((p) => p.filter((i) => i._id !== itemId)),
      revert: () => setItems(snapshot),
      apiCall: () =>
        fetch(`/api/vault/${itemId}`, { method: "DELETE" }).then(async (r) => {
          const j = await r.json();
          if (!j.success)
            throw new Error(j.error || "Failed to delete vault item");
        }),
    });
  }

  // ── RULES ─────────────────────────────────────────────────────────────────

  function deleteRule({ ruleId, ruleTitle, rules, setRules }) {
    const snapshot = [...rules];
    withUndo({
      message: `Rule "${ruleTitle || "rule"}" deleted`,
      optimisticUpdate: () =>
        setRules((p) => p.filter((r) => r._id !== ruleId)),
      revert: () => setRules(snapshot),
      apiCall: () =>
        fetch(`/api/rules/${ruleId}`, { method: "DELETE" }).then(async (r) => {
          const j = await r.json();
          if (!j.success) throw new Error(j.error || "Failed to delete rule");
        }),
    });
  }

  // ── NOTES ─────────────────────────────────────────────────────────────────

  function deleteNote({ noteId, noteTitle, notes, setNotes }) {
    const snapshot = [...notes];
    withUndo({
      message: `Note "${noteTitle || "note"}" deleted`,
      optimisticUpdate: () =>
        setNotes((p) => p.filter((n) => n._id !== noteId)),
      revert: () => setNotes(snapshot),
      apiCall: () =>
        fetch(`/api/notes/${noteId}`, { method: "DELETE" }).then(async (r) => {
          const j = await r.json();
          if (!j.success) throw new Error(j.error || "Failed to delete note");
        }),
    });
  }

  // ── POLLS ─────────────────────────────────────────────────────────────────

  function closePoll({ pollId, polls, setPolls }) {
    const snapshot = [...polls];
    withUndo({
      message: "Poll closed",
      optimisticUpdate: () =>
        setPolls((p) =>
          p.map((poll) =>
            poll._id === pollId ? { ...poll, isClosed: true } : poll
          )
        ),
      revert: () => setPolls(snapshot),
      apiCall: () =>
        fetch(`/api/polls/${pollId}/vote`, { method: "DELETE" }).then(
          async (r) => {
            const j = await r.json();
            if (!j.success) throw new Error(j.error || "Failed to close poll");
          }
        ),
    });
  }

  // ── BILLS ─────────────────────────────────────────────────────────────────

  function deleteBill({ billId, billLabel, bills, setBills }) {
    const snapshot = [...bills];
    withUndo({
      message: `Bill "${billLabel || "bill"}" deleted`,
      optimisticUpdate: () =>
        setBills((p) => p.filter((b) => b._id !== billId)),
      revert: () => setBills(snapshot),
      apiCall: () =>
        fetch(`/api/bills/${billId}`, { method: "DELETE" }).then(async (r) => {
          const j = await r.json();
          if (!j.success) throw new Error(j.error || "Failed to delete bill");
        }),
    });
  }

  // ── THREADS ───────────────────────────────────────────────────────────────

  function archiveThread({ threadId, threadName, threads, setThreads }) {
    const snapshot = [...threads];
    withUndo({
      message: `#${threadName || "channel"} archived`,
      optimisticUpdate: () =>
        setThreads((p) => p.filter((t) => t._id !== threadId)),
      revert: () => setThreads(snapshot),
      apiCall: () =>
        fetch(`/api/threads/${threadId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isArchived: true }),
        }).then(async (r) => {
          const j = await r.json();
          if (!j.success)
            throw new Error(j.error || "Failed to archive thread");
        }),
    });
  }

  // ── MEMBERS ───────────────────────────────────────────────────────────────

  function removeMember({
    membershipId,
    memberName,
    houseId: hid,
    members,
    setMembers,
  }) {
    const snapshot = [...members];
    const id = hid || houseId;
    withUndo({
      message: `${memberName || "Member"} removed`,
      optimisticUpdate: () =>
        setMembers((p) => p.filter((m) => m.membershipId !== membershipId)),
      revert: () => setMembers(snapshot),
      apiCall: () =>
        fetch(`/api/houses/${id}/members/${membershipId}`, {
          method: "DELETE",
        }).then(async (r) => {
          const j = await r.json();
          if (!j.success) throw new Error(j.error || "Failed to remove member");
        }),
    });
  }

  return {
    deleteTask,
    toggleTaskDone,
    deleteGroceryItem,
    toggleGroceryBought,
    deleteVaultItem,
    deleteRule,
    deleteNote,
    closePoll,
    deleteBill,
    archiveThread,
    removeMember,
  };
}

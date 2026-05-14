"use client";

/**
 * usePageActions
 *
 * Central place for every destructive / reversible action in the app.
 * Each function:
 *   1. Applies an optimistic UI update
 *   2. Shows an undo toast with countdown
 *   3. Fires the API only after the delay (default 5s)
 *   4. Reverts on API failure or user undo
 *
 * Usage:
 *   const { deleteTask, toggleGrocery, deleteVaultItem, ... } = usePageActions({ houseId });
 */

import { useUndo } from "@/hooks/useUndo";

const DELAY = 5000; // 5 seconds — feels snappy but gives time to undo

export function usePageActions({ houseId } = {}) {
  const { withUndo } = useUndo(DELAY);

  // ── TASKS ─────────────────────────────────────────────────────────────────

  function deleteTask({ taskId, taskTitle, setTasks }) {
    const prev = null; // captured inside
    withUndo({
      message: `Task "${taskTitle || "task"}" deleted`,
      optimisticUpdate: () =>
        setTasks((p) => {
          return p.filter((t) => t._id !== taskId);
        }),
      revert: () =>
        // Re-fetch to restore — simpler than capturing snapshot when list may change
        setTasks((p) => p), // no-op; caller should pass a restore fn below
      apiCall: () => fetch(`/api/tasks/${taskId}`, { method: "DELETE" }),
    });
  }

  /**
   * Better version: caller passes prev snapshot
   */
  function deleteTaskWithSnapshot({ taskId, taskTitle, tasks, setTasks }) {
    const snapshot = [...tasks];
    withUndo({
      message: `Task "${taskTitle || "task"}" deleted`,
      optimisticUpdate: () =>
        setTasks((p) => p.filter((t) => t._id !== taskId)),
      revert: () => setTasks(snapshot),
      apiCall: () => fetch(`/api/tasks/${taskId}`, { method: "DELETE" }),
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

  function deleteGroceryItem({ itemId, itemName, items, setItems }) {
    const snapshot = [...items];
    withUndo({
      message: `"${itemName || "Item"}" removed`,
      optimisticUpdate: () =>
        setItems((p) => p.filter((i) => i._id !== itemId)),
      revert: () => setItems(snapshot),
      apiCall: () => fetch(`/api/grocery/${itemId}`, { method: "DELETE" }),
    });
  }

  function toggleGroceryBought({ item, items, setItems, setToggling }) {
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
      },
      apiCall: () =>
        fetch(`/api/grocery/${item._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isBought: next }),
        }).then(async (r) => {
          const j = await r.json();
          if (!j.success) throw new Error(j.error);
        }),
      onSuccess: () => {
        if (setToggling) setToggling((p) => ({ ...p, [id]: false }));
      },
      onError: () => {
        if (setToggling) setToggling((p) => ({ ...p, [id]: false }));
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
      apiCall: () => fetch(`/api/vault/${itemId}`, { method: "DELETE" }),
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
      apiCall: () => fetch(`/api/rules/${ruleId}`, { method: "DELETE" }),
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
      apiCall: () => fetch(`/api/notes/${noteId}`, { method: "DELETE" }),
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
      apiCall: () => fetch(`/api/polls/${pollId}/vote`, { method: "DELETE" }),
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
      apiCall: () => fetch(`/api/bills/${billId}`, { method: "DELETE" }),
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

  // In usePageActions.js, add to the returned object:
  function deleteMyThing({ thingId, thingName, things, setThings }) {
    const snapshot = [...things];
    withUndo({
      message: `"${thingName}" deleted`,
      optimisticUpdate: () =>
        setThings((p) => p.filter((t) => t._id !== thingId)),
      revert: () => setThings(snapshot),
      apiCall: () =>
        fetch(`/api/things/${thingId}`, { method: "DELETE" }).then(
          async (r) => {
            const j = await r.json();
            if (!j.success) throw new Error(j.error);
          }
        ),
    });
  }

  return {
    // Tasks
    deleteTask: deleteTaskWithSnapshot,
    toggleTaskDone,
    // Grocery
    deleteGroceryItem,
    toggleGroceryBought,
    // Vault
    deleteVaultItem,
    // Rules
    deleteRule,
    // Notes
    deleteNote,
    // Polls
    closePoll,
    // Bills
    deleteBill,
    // Threads
    archiveThread,
    // Members
    removeMember,

    deleteMyThing,
  };
}

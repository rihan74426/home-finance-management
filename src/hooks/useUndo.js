/**
 * useUndo — Universal optimistic undo hook
 *
 * Pattern:
 *   1. UI updates immediately (optimisticUpdate)
 *   2. Toast appears with countdown + Undo button
 *   3. If user clicks Undo → revert() is called, API call is cancelled
 *   4. If timer expires → apiCall() fires
 *
 * Usage:
 *   const { withUndo } = useUndo();
 *
 *   withUndo({
 *     message: "Task deleted",
 *     optimisticUpdate: () => setTasks(p => p.filter(t => t._id !== id)),
 *     revert: () => setTasks(prev),
 *     apiCall: () => fetch(`/api/tasks/${id}`, { method: "DELETE" }),
 *   });
 */

import { toast } from "sonner";
import { useCallback } from "react";

export function useUndo(delayMs = 5000) {
  const withUndo = useCallback(
    ({ message, optimisticUpdate, revert, apiCall, onSuccess, onError }) => {
      // Apply optimistic update immediately
      optimisticUpdate();

      let cancelled = false;
      let toastId;

      const timer = setTimeout(async () => {
        if (cancelled) return;
        try {
          const result = await apiCall();
          if (onSuccess) onSuccess(result);
        } catch (err) {
          revert();
          toast.error("Something went wrong. Action reverted.");
          if (onError) onError(err);
        }
      }, delayMs);

      toastId = toast(message, {
        duration: delayMs,
        action: {
          label: "Undo",
          onClick: () => {
            cancelled = true;
            clearTimeout(timer);
            revert();
            toast.dismiss(toastId);
            toast.success("Action undone.");
          },
        },
      });

      return {
        cancel: () => {
          cancelled = true;
          clearTimeout(timer);
          toast.dismiss(toastId);
          revert();
        },
      };
    },
    [delayMs]
  );

  return { withUndo };
}

/**
 * Standalone utility (non-hook) for use outside React components
 * e.g. in event handlers where hooks aren't available
 */
export function createUndoableAction({
  message,
  optimisticUpdate,
  revert,
  apiCall,
  delayMs = 5000,
  onSuccess,
  onError,
}) {
  optimisticUpdate();

  let cancelled = false;
  let toastId;

  const timer = setTimeout(async () => {
    if (cancelled) return;
    try {
      const result = await apiCall();
      if (onSuccess) onSuccess(result);
    } catch {
      revert();
      toast.error("Something went wrong. Action reverted.");
      if (onError) onError();
    }
  }, delayMs);

  toastId = toast(message, {
    duration: delayMs,
    action: {
      label: "Undo",
      onClick: () => {
        cancelled = true;
        clearTimeout(timer);
        revert();
        toast.dismiss(toastId);
        toast.success("Action undone.");
      },
    },
  });

  return {
    cancel: () => {
      cancelled = true;
      clearTimeout(timer);
      toast.dismiss(toastId);
      revert();
    },
  };
}

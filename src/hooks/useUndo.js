"use client";

/**
 * useUndo — Production-grade optimistic undo hook
 *
 * Flow:
 *   1. optimisticUpdate() fires immediately — UI changes at once
 *   2. Toast appears with live countdown + Undo button
 *   3. If user clicks Undo → revert() is called, timer cancelled, API never fires
 *   4. If countdown expires → apiCall() fires
 *   5. If apiCall() throws → revert() is called, error toast shown
 *
 * Key fixes over previous version:
 *   - Uses a ref-based cancelled flag so closure captures the latest value
 *   - Countdown interval updates the toast label live (5…4…3…2…1)
 *   - Only one pending undo per hook instance (new action cancels old one silently)
 *   - apiCall failure always reverts + shows error, never leaves UI in broken state
 *   - Exported as both hook (useUndo) and standalone util (undoable)
 */

import { toast } from "sonner";
import { useCallback, useRef, useEffect } from "react";

// Default delay in ms
const DEFAULT_DELAY = 5000;

export function useUndo(delayMs = DEFAULT_DELAY) {
  // Track any in-flight undo so we can cancel it when a new action fires
  const pendingRef = useRef(null);

  // Cancel pending undo on unmount (e.g. user navigates away)
  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        pendingRef.current.cancel();
        pendingRef.current = null;
      }
    };
  }, []);

  const withUndo = useCallback(
    ({
      message,
      optimisticUpdate,
      revert,
      apiCall,
      onSuccess,
      onError,
      delay = delayMs,
    }) => {
      // Cancel any previous pending undo silently (its API will NOT fire)
      if (pendingRef.current) {
        pendingRef.current.silentCancel();
        pendingRef.current = null;
      }

      // Apply optimistic update immediately
      optimisticUpdate();

      // Shared mutable state via ref object (avoids stale closure issues)
      const state = {
        cancelled: false,
        toastId: null,
        timerId: null,
        countdownId: null,
        secondsLeft: Math.ceil(delay / 1000),
      };

      function cleanup() {
        clearTimeout(state.timerId);
        clearInterval(state.countdownId);
        if (state.toastId) toast.dismiss(state.toastId);
      }

      function silentCancel() {
        // Cancel without reverting — used when a newer action supersedes this one
        state.cancelled = true;
        cleanup();
      }

      function cancel() {
        // Undo — cancel + revert
        state.cancelled = true;
        cleanup();
        revert();
        toast.success("Action undone.", { duration: 2000 });
        pendingRef.current = null;
      }

      // Show toast with countdown
      state.toastId = toast(buildMessage(message, state.secondsLeft), {
        duration: delay + 500,
        action: {
          label: "Undo",
          onClick: cancel,
        },
      });

      // Countdown interval — updates toast label every second
      state.countdownId = setInterval(() => {
        state.secondsLeft -= 1;
        if (state.secondsLeft <= 0) {
          clearInterval(state.countdownId);
          return;
        }
        // Re-render toast with updated countdown
        toast(buildMessage(message, state.secondsLeft), {
          id: state.toastId,
          duration: state.secondsLeft * 1000 + 200,
          action: {
            label: "Undo",
            onClick: cancel,
          },
        });
      }, 1000);

      // Fire API after delay
      state.timerId = setTimeout(async () => {
        clearInterval(state.countdownId);
        if (state.cancelled) return;

        try {
          const result = await apiCall();
          if (!state.cancelled && onSuccess) onSuccess(result);
        } catch (err) {
          if (!state.cancelled) {
            revert();
            toast.error(
              err?.message || "Something went wrong. Action reverted.",
              { duration: 4000 }
            );
            if (onError) onError(err);
          }
        } finally {
          if (state.toastId) toast.dismiss(state.toastId);
          pendingRef.current = null;
        }
      }, delay);

      pendingRef.current = { cancel, silentCancel };

      // Return cancel handle so callers can cancel programmatically
      return { cancel, silentCancel };
    },
    [delayMs]
  );

  return { withUndo };
}

// ── Countdown label helper ────────────────────────────────────────────────────
function buildMessage(message, secondsLeft) {
  return `${message} (${secondsLeft}s)`;
}

/**
 * Standalone undoable() — for use outside React components
 * (e.g. in event handlers passed down from server components)
 */
export function undoable({
  message,
  optimisticUpdate,
  revert,
  apiCall,
  onSuccess,
  onError,
  delay = DEFAULT_DELAY,
}) {
  optimisticUpdate();

  const state = {
    cancelled: false,
    toastId: null,
    timerId: null,
    countdownId: null,
    secondsLeft: Math.ceil(delay / 1000),
  };

  function cleanup() {
    clearTimeout(state.timerId);
    clearInterval(state.countdownId);
    if (state.toastId) toast.dismiss(state.toastId);
  }

  function cancel() {
    state.cancelled = true;
    cleanup();
    revert();
    toast.success("Action undone.", { duration: 2000 });
  }

  state.toastId = toast(buildMessage(message, state.secondsLeft), {
    duration: delay + 500,
    action: { label: "Undo", onClick: cancel },
  });

  state.countdownId = setInterval(() => {
    state.secondsLeft -= 1;
    if (state.secondsLeft <= 0) {
      clearInterval(state.countdownId);
      return;
    }
    toast(buildMessage(message, state.secondsLeft), {
      id: state.toastId,
      duration: state.secondsLeft * 1000 + 200,
      action: { label: "Undo", onClick: cancel },
    });
  }, 1000);

  state.timerId = setTimeout(async () => {
    clearInterval(state.countdownId);
    if (state.cancelled) return;
    try {
      const result = await apiCall();
      if (!state.cancelled && onSuccess) onSuccess(result);
    } catch (err) {
      if (!state.cancelled) {
        revert();
        toast.error(err?.message || "Something went wrong. Action reverted.", {
          duration: 4000,
        });
        if (onError) onError(err);
      }
    } finally {
      if (state.toastId) toast.dismiss(state.toastId);
    }
  }, delay);

  return { cancel };
}

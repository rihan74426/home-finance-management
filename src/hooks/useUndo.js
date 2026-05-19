"use client";

/**
 * useUndo — Optimistic undo hook
 *
 * Key design: uses a FIXED toast ID per action so sonner updates the
 * existing toast in-place every second. No new toasts are created during
 * countdown — zero stacking/overlay.
 *
 * Flow:
 *   1. optimisticUpdate() fires immediately
 *   2. Single toast shown with countdown, updated every second
 *   3. User clicks Undo → revert() called, API never fires
 *   4. Countdown expires → apiCall() fires
 *   5. apiCall() fails → revert() called, error toast shown
 */

import { toast } from "sonner";
import { useCallback, useRef, useEffect } from "react";

const DEFAULT_DELAY = 5000;

export function useUndo(delayMs = DEFAULT_DELAY) {
  const pendingRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        pendingRef.current.silentCancel();
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
      // Cancel any previous pending undo silently (no UI revert)
      if (pendingRef.current) {
        pendingRef.current.silentCancel();
        pendingRef.current = null;
      }

      optimisticUpdate();

      const toastId = `undo-${Date.now()}`;
      const state = {
        cancelled: false,
        secondsLeft: Math.ceil(delay / 1000),
        timerId: null,
        intervalId: null,
      };

      const show = (secs) => {
        toast(`${message} (${secs}s)`, {
          id: toastId,
          duration: secs * 1000 + 500,
          action: { label: "Undo", onClick: cancel },
        });
      };

      const cleanup = () => {
        clearTimeout(state.timerId);
        clearInterval(state.intervalId);
        toast.dismiss(toastId);
      };

      function silentCancel() {
        state.cancelled = true;
        cleanup();
      }

      function cancel() {
        if (state.cancelled) return;
        state.cancelled = true;
        cleanup();
        revert();
        toast.success("Action undone.", { duration: 2000 });
        pendingRef.current = null;
      }

      // Show first toast
      show(state.secondsLeft);

      // Update same toast every second — no new toast created
      state.intervalId = setInterval(() => {
        state.secondsLeft -= 1;
        if (state.secondsLeft > 0) {
          show(state.secondsLeft);
        } else {
          clearInterval(state.intervalId);
        }
      }, 1000);

      // Fire API after delay
      state.timerId = setTimeout(async () => {
        clearInterval(state.intervalId);
        toast.dismiss(toastId);
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
          pendingRef.current = null;
        }
      }, delay);

      pendingRef.current = { cancel, silentCancel };
      return { cancel, silentCancel };
    },
    [delayMs]
  );

  return { withUndo };
}

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

  const toastId = `undo-${Date.now()}`;
  const state = {
    cancelled: false,
    secondsLeft: Math.ceil(delay / 1000),
    timerId: null,
    intervalId: null,
  };

  const show = (secs) =>
    toast(`${message} (${secs}s)`, {
      id: toastId,
      duration: secs * 1000 + 500,
      action: { label: "Undo", onClick: cancel },
    });
  const cleanup = () => {
    clearTimeout(state.timerId);
    clearInterval(state.intervalId);
    toast.dismiss(toastId);
  };

  function cancel() {
    if (state.cancelled) return;
    state.cancelled = true;
    cleanup();
    revert();
    toast.success("Action undone.", { duration: 2000 });
  }

  show(state.secondsLeft);

  state.intervalId = setInterval(() => {
    state.secondsLeft -= 1;
    if (state.secondsLeft > 0) show(state.secondsLeft);
    else clearInterval(state.intervalId);
  }, 1000);

  state.timerId = setTimeout(async () => {
    clearInterval(state.intervalId);
    toast.dismiss(toastId);
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
    }
  }, delay);

  return { cancel };
}

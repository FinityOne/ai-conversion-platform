/**
 * Lightweight imperative toast system — no React context needed.
 * Any client component can call toast.success / toast.error / toast.info.
 * The <Toaster /> component listens for the events and renders the UI.
 */

export type ToastType = "success" | "error" | "info";

export interface ToastEvent {
  id:      string;
  message: string;
  type:    ToastType;
}

export const TOAST_EVENT = "clozeflow:toast";

function dispatch(message: string, type: ToastType) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastEvent>(TOAST_EVENT, {
      detail: { id: crypto.randomUUID(), message, type },
    }),
  );
}

export const toast = {
  success: (message: string) => dispatch(message, "success"),
  error:   (message: string) => dispatch(message, "error"),
  info:    (message: string) => dispatch(message, "info"),
};

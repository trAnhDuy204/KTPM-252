import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  variant = "danger",
}) {
  const cancelRef = useRef(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const colors = {
    danger: {
      icon: "bg-danger-soft/65 text-danger",
      button: "bg-danger text-white hover:bg-danger/90",
    },
    warning: {
      icon: "bg-warning-soft/75 text-warning",
      button: "bg-accent text-accent-contrast hover:bg-accent-strong",
    },
  };

  const tone = colors[variant] || colors.danger;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="relative w-full max-w-sm rounded-2xl border border-edge bg-card p-6 shadow-2xl shadow-black/20 animate-fadein"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3l9.66 16.59A1 1 0 0120.66 21H3.34a1 1 0 01-.86-1.41L12 3z"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 id={titleId} className="text-base font-semibold text-hi">
              {title}
            </h3>
            <p id={messageId} className="mt-1 text-sm leading-relaxed text-muted">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            className="rounded-xl border border-edge bg-raised px-4 py-2 text-sm font-medium text-dim transition-all duration-200 hover:border-edge-md hover:bg-raised-2 hover:text-hi"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${tone.button}`}
            onClick={onConfirm}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

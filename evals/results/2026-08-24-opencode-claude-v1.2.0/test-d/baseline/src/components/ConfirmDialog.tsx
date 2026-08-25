import { useEffect, useId, useRef, useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  /** Label for the confirming action, e.g. "Revoke key" */
  confirmLabel: string;
  tone?: "danger" | "default";
  /**
   * If set, the user must type this exact string into a text field before the
   * confirm button is enabled — used for the most consequential actions
   * (delete account, cancel plan) so a stray click can't trigger them.
   */
  typeToConfirm?: string;
  busyLabel?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  tone = "danger",
  typeToConfirm,
  busyLabel = "Working…",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [typedValue, setTypedValue] = useState("");
  const [busy, setBusy] = useState(false);
  const headingId = useId();
  const descId = useId();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      setTypedValue("");
      setBusy(false);
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Native <dialog> fires "close" on Escape / backdrop dismissal too — keep parent state in sync.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => onClose();
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [onClose]);

  const gateSatisfied = !typeToConfirm || typedValue === typeToConfirm;
  const confirmTone =
    tone === "danger"
      ? "bg-danger-500 hover:bg-danger-600 focus-visible:outline-danger-500"
      : "bg-accent-500 hover:bg-accent-600 focus-visible:outline-accent-500";

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
      dialogRef.current?.close();
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      aria-describedby={descId}
      className="w-full max-w-md rounded-xl bg-white p-0 shadow-popover backdrop:bg-transparent"
      onCancel={(e) => {
        // Let native Escape-to-close behavior stand, just resync state.
        e.currentTarget.close();
      }}
    >
      <div className="p-5">
        <h2 id={headingId} className="text-base font-semibold text-ink-900">
          {title}
        </h2>
        <p id={descId} className="mt-2 text-sm leading-relaxed text-ink-500">
          {description}
        </p>

        {typeToConfirm && (
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Type <span className="font-mono text-ink-900">{typeToConfirm}</span> to confirm
            </span>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            />
          </label>
        )}
      </div>
      <div className="flex justify-end gap-2 rounded-b-xl border-t border-border bg-canvas px-5 py-3">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-white"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!gateSatisfied || busy}
          onClick={handleConfirm}
          className={`rounded-md px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-ink-400/50 ${confirmTone}`}
        >
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

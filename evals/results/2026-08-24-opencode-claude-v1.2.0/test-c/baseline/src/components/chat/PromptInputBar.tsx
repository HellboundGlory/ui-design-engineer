"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import type { Attachment } from "@/lib/types";
import { MAX_FILES_PER_MESSAGE } from "@/lib/attachments";
import { AttachmentChip } from "./AttachmentChip";

interface PromptInputBarProps {
  value: string;
  onChange: (value: string) => void;
  attachments: Attachment[];
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveAttachment: (id: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  notice?: string | null;
}

const MAX_TEXTAREA_HEIGHT = 200;

export function PromptInputBar({
  value,
  onChange,
  attachments,
  onAddFiles,
  onRemoveAttachment,
  onSend,
  onStop,
  isStreaming,
  notice,
}: PromptInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  const hasUploading = attachments.some((a) => a.status === "uploading");
  const hasBlockingError = attachments.some((a) => a.status === "error");
  const canSend =
    !isStreaming &&
    !hasUploading &&
    !hasBlockingError &&
    (value.trim().length > 0 || attachments.length > 0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    if (files.length > 0) onAddFiles(files);
  };

  return (
    <div
      className="relative"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        dragCounter.current += 1;
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
      }}
    >
      <div
        className={`rounded-2xl border bg-surface shadow-sm transition-colors ${
          isDragging ? "border-accent" : ""
        }`}
        style={{
          borderColor: isDragging ? "var(--color-accent)" : "var(--color-border)",
        }}
      >
        {attachments.length > 0 && (
          <div className="scroll-thin flex gap-2 overflow-x-auto border-b px-3 pt-3 pb-2.5">
            {attachments.map((att) => (
              <AttachmentChip key={att.id} attachment={att} onRemove={onRemoveAttachment} />
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 px-3 py-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={attachments.length >= MAX_FILES_PER_MESSAGE}
            aria-label="Attach files"
            title="Attach files"
            className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-raised hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Paperclip size={17} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the agent..."
            rows={1}
            className="scroll-thin max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-[14.5px] leading-relaxed text-text placeholder:text-text-faint focus:outline-none"
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-text text-bg transition-opacity hover:opacity-85"
              aria-label="Stop generating"
              title="Stop generating"
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send message"
              title="Send message"
              className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all disabled:cursor-not-allowed"
              style={{
                background: canSend ? "var(--color-accent)" : "var(--color-border)",
                color: canSend ? "var(--color-accent-contrast)" : "var(--color-text-faint)",
              }}
            >
              <ArrowUp size={17} strokeWidth={2.4} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-3.5 pb-2 text-[11px] text-text-faint">
          <span>
            {hasBlockingError
              ? "Remove the failed attachment to continue"
              : "Enter to send · Shift+Enter for a new line"}
          </span>
          {attachments.length > 0 && (
            <span>
              {attachments.length}/{MAX_FILES_PER_MESSAGE} attached
            </span>
          )}
        </div>
      </div>

      {notice && (
        <div
          className="absolute -top-9 left-0 rounded-md border px-2.5 py-1.5 text-[12px] shadow-sm"
          style={{
            background: "var(--color-surface)",
            borderColor: "color-mix(in srgb, var(--color-status-error) 40%, var(--color-border))",
            color: "var(--color-status-error)",
          }}
        >
          {notice}
        </div>
      )}

      {isDragging && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-dashed text-[13px] font-medium"
          style={{
            borderColor: "var(--color-accent)",
            background: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
            color: "var(--color-accent)",
          }}
        >
          Drop files to attach
        </div>
      )}
    </div>
  );
}

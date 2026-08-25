"use client";

import { AlertCircle, File, FileText, Image as ImageIcon, X } from "lucide-react";
import type { Attachment } from "@/lib/types";
import { formatBytes } from "@/lib/format";

const KIND_ICON = {
  image: ImageIcon,
  text: FileText,
  pdf: FileText,
  other: File,
};

export function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove?: (id: string) => void;
}) {
  const Icon = KIND_ICON[attachment.kind];
  const isError = attachment.status === "error";
  const isUploading = attachment.status === "uploading";

  return (
    <div
      className="group relative flex w-56 items-center gap-2.5 overflow-hidden rounded-lg border bg-surface px-2.5 py-2"
      style={{
        borderColor: isError
          ? "color-mix(in srgb, var(--color-status-error) 45%, var(--color-border))"
          : "var(--color-border)",
      }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-raised">
        {attachment.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- client-generated blob: URL, not eligible for next/image optimization
          <img
            src={attachment.previewUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : isError ? (
          <AlertCircle size={15} style={{ color: "var(--color-status-error)" }} />
        ) : (
          <Icon size={15} className="text-text-faint" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-medium text-text" title={attachment.name}>
          {attachment.name}
        </div>
        {isError ? (
          <div className="truncate text-[11px]" style={{ color: "var(--color-status-error)" }}>
            {attachment.error}
          </div>
        ) : (
          <div className="truncate text-[11px] text-text-faint">
            {formatBytes(attachment.size)}
            {isUploading ? ` · uploading ${Math.round(attachment.progress)}%` : ""}
          </div>
        )}
        {isUploading && (
          <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-surface-raised">
            <div
              className="h-full rounded-full transition-[width] duration-150"
              style={{ width: `${attachment.progress}%`, background: "var(--color-accent)" }}
            />
          </div>
        )}
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(attachment.id)}
          aria-label={`Remove ${attachment.name}`}
          className="shrink-0 self-start rounded p-0.5 text-text-faint opacity-70 hover:bg-surface-raised hover:text-text hover:opacity-100"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

import { createId } from "./format";
import type { Attachment, AttachmentKind } from "./types";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_FILES_PER_MESSAGE = 6;

const BLOCKED_EXTENSIONS = [
  ".exe",
  ".zip",
  ".rar",
  ".7z",
  ".dmg",
  ".sh",
  ".bat",
  ".msi",
  ".apk",
];

export function kindFromFile(file: File): AttachmentKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (
    file.type.startsWith("text/") ||
    /\.(md|txt|json|csv|ts|tsx|js|jsx|yml|yaml)$/i.test(file.name)
  ) {
    return "text";
  }
  return "other";
}

function extensionOf(name: string): string {
  const match = /\.[^.]+$/.exec(name);
  return match ? match[0].toLowerCase() : "";
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

export function validateFile(file: File): ValidationResult {
  if (BLOCKED_EXTENSIONS.includes(extensionOf(file.name))) {
    return {
      ok: false,
      error: `${extensionOf(file.name)} files aren't supported`,
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: "File exceeds the 10 MB limit" };
  }
  if (file.size === 0) {
    return { ok: false, error: "File is empty" };
  }
  return { ok: true };
}

export function createAttachmentFromFile(file: File): Attachment {
  const validation = validateFile(file);
  const kind = kindFromFile(file);
  const isImage = kind === "image" && validation.ok;
  return {
    id: createId("att"),
    name: file.name,
    size: file.size,
    mimeType: file.type,
    kind,
    status: validation.ok ? "uploading" : "error",
    progress: validation.ok ? 0 : 0,
    error: validation.error,
    previewUrl: isImage ? URL.createObjectURL(file) : undefined,
  };
}

/**
 * Simulates a network upload for an already-validated attachment, reporting
 * progress via `onProgress` and resolving via `onDone`. Returns a cleanup
 * function that cancels the simulation (used if the attachment is removed
 * before the upload finishes).
 */
export function simulateUpload(
  onProgress: (progress: number) => void,
  onDone: () => void,
): () => void {
  let progress = 0;
  const interval = setInterval(
    () => {
      progress = Math.min(100, progress + 12 + Math.random() * 20);
      onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        onDone();
      }
    },
    90 + Math.random() * 60,
  );
  return () => clearInterval(interval);
}

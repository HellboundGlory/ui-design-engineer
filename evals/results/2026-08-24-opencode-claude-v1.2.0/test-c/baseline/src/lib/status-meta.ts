import type { ToolCallStatus } from "./types";

export const TOOL_STATUS_META: Record<
  ToolCallStatus,
  { label: string; colorVar: string; description: string }
> = {
  pending: {
    label: "Queued",
    colorVar: "var(--color-status-pending)",
    description: "Waiting to run",
  },
  running: {
    label: "Running",
    colorVar: "var(--color-status-running)",
    description: "In progress",
  },
  complete: {
    label: "Complete",
    colorVar: "var(--color-status-complete)",
    description: "Finished successfully",
  },
  error: {
    label: "Failed",
    colorVar: "var(--color-status-error)",
    description: "Finished with an error",
  },
};

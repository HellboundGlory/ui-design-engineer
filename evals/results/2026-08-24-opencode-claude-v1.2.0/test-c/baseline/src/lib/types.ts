export type ToolCallStatus = "pending" | "running" | "complete" | "error";

export interface ToolCall {
  id: string;
  name: string;
  label: string;
  input: Record<string, unknown>;
  output?: string;
  error?: string;
  status: ToolCallStatus;
  startedAt?: number;
  completedAt?: number;
}

export interface TextBlock {
  id: string;
  type: "text";
  text: string;
}

export interface ToolCallBlock {
  id: string;
  type: "tool-call";
  toolCall: ToolCall;
}

export type AssistantBlock = TextBlock | ToolCallBlock;

export type AttachmentStatus = "uploading" | "ready" | "error";

export type AttachmentKind = "image" | "text" | "pdf" | "other";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  kind: AttachmentKind;
  status: AttachmentStatus;
  progress: number;
  error?: string;
  previewUrl?: string;
}

export interface UserMessage {
  id: string;
  role: "user";
  text: string;
  attachments: Attachment[];
  createdAt: number;
}

export type AssistantMessageStatus = "streaming" | "done" | "stopped";

export interface AssistantMessage {
  id: string;
  role: "assistant";
  blocks: AssistantBlock[];
  status: AssistantMessageStatus;
  createdAt: number;
}

export type ChatMessage = UserMessage | AssistantMessage;

export type AgentStreamEvent =
  | { type: "text-delta"; blockId: string; delta: string }
  | { type: "text-block-start"; blockId: string }
  | { type: "tool-call-start"; toolCall: ToolCall }
  | { type: "tool-call-running"; id: string }
  | { type: "tool-call-complete"; id: string; output: string }
  | { type: "tool-call-error"; id: string; error: string }
  | { type: "message-done" };

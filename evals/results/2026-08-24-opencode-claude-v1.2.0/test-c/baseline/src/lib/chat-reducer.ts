import type { AgentStreamEvent, AssistantMessage, ChatMessage } from "./types";

function updateAssistant(
  messages: ChatMessage[],
  id: string,
  updater: (msg: AssistantMessage) => AssistantMessage,
): ChatMessage[] {
  return messages.map((m) => (m.id === id && m.role === "assistant" ? updater(m) : m));
}

export function applyAgentEvent(
  messages: ChatMessage[],
  assistantId: string,
  event: AgentStreamEvent,
): ChatMessage[] {
  switch (event.type) {
    case "text-block-start":
      return updateAssistant(messages, assistantId, (m) => ({
        ...m,
        blocks: [...m.blocks, { id: event.blockId, type: "text", text: "" }],
      }));

    case "text-delta":
      return updateAssistant(messages, assistantId, (m) => ({
        ...m,
        blocks: m.blocks.map((b) =>
          b.id === event.blockId && b.type === "text"
            ? { ...b, text: b.text + event.delta }
            : b,
        ),
      }));

    case "tool-call-start":
      return updateAssistant(messages, assistantId, (m) => ({
        ...m,
        blocks: [
          ...m.blocks,
          { id: event.toolCall.id, type: "tool-call", toolCall: event.toolCall },
        ],
      }));

    case "tool-call-running":
      return updateAssistant(messages, assistantId, (m) => ({
        ...m,
        blocks: m.blocks.map((b) =>
          b.type === "tool-call" && b.toolCall.id === event.id
            ? { ...b, toolCall: { ...b.toolCall, status: "running", startedAt: Date.now() } }
            : b,
        ),
      }));

    case "tool-call-complete":
      return updateAssistant(messages, assistantId, (m) => ({
        ...m,
        blocks: m.blocks.map((b) =>
          b.type === "tool-call" && b.toolCall.id === event.id
            ? {
                ...b,
                toolCall: {
                  ...b.toolCall,
                  status: "complete",
                  output: event.output,
                  completedAt: Date.now(),
                },
              }
            : b,
        ),
      }));

    case "tool-call-error":
      return updateAssistant(messages, assistantId, (m) => ({
        ...m,
        blocks: m.blocks.map((b) =>
          b.type === "tool-call" && b.toolCall.id === event.id
            ? {
                ...b,
                toolCall: {
                  ...b.toolCall,
                  status: "error",
                  error: event.error,
                  completedAt: Date.now(),
                },
              }
            : b,
        ),
      }));

    case "message-done":
      return updateAssistant(messages, assistantId, (m) => ({ ...m, status: "done" }));

    default:
      return messages;
  }
}

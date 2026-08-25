import { Sparkles } from "lucide-react";
import type { AssistantMessage as AssistantMessageType } from "@/lib/types";
import { MarkdownContent } from "./MarkdownContent";
import { ToolCallCard } from "./ToolCallCard";

export function AssistantMessage({ message }: { message: AssistantMessageType }) {
  const isStreaming = message.status === "streaming";
  const lastBlockId = message.blocks[message.blocks.length - 1]?.id;

  return (
    <div className="enter-block flex gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15">
        <Sparkles size={13} style={{ color: "var(--color-accent)" }} />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {message.blocks.length === 0 && isStreaming && <ThinkingIndicator />}
        {message.blocks.map((block) => {
          if (block.type === "text") {
            if (!block.text) return null;
            const isLastStreamingBlock = isStreaming && block.id === lastBlockId;
            return (
              <div key={block.id} className="relative">
                <MarkdownContent text={block.text} />
                {isLastStreamingBlock && <span className="streaming-caret" />}
              </div>
            );
          }
          return <ToolCallCard key={block.id} toolCall={block.toolCall} />;
        })}
        {message.status === "stopped" && (
          <p className="text-[12px] text-text-faint italic">Generation stopped</p>
        )}
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="status-dot-running h-1.5 w-1.5 rounded-full bg-text-faint"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";

const STICK_THRESHOLD = 120;

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stuckToBottom = useRef(true);
  const [showJump, setShowJump] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !stuckToBottom.current) return;
    el.scrollTop = el.scrollHeight;
  });

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stuckToBottom.current = distance < STICK_THRESHOLD;
    setShowJump(distance >= STICK_THRESHOLD);
  };

  const jumpToBottom = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    stuckToBottom.current = true;
    setShowJump(false);
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="scroll-thin h-full overflow-y-auto"
      >
        <div className="mx-auto flex max-w-[42rem] flex-col gap-5 px-4 py-6">
          {messages.map((message) =>
            message.role === "user" ? (
              <UserMessage key={message.id} message={message} />
            ) : (
              <AssistantMessage key={message.id} message={message} />
            ),
          )}
        </div>
      </div>

      {showJump && (
        <button
          type="button"
          onClick={jumpToBottom}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-surface px-3 py-1.5 text-[12px] text-text-muted shadow-md hover:text-text"
        >
          <ArrowDown size={13} /> Jump to latest
        </button>
      )}
    </div>
  );
}

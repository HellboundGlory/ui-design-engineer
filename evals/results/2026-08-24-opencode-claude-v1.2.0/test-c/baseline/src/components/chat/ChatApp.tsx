"use client";

import { useCallback, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { AssistantMessage as AssistantMessageType, Attachment, ChatMessage } from "@/lib/types";
import { createId } from "@/lib/format";
import {
  MAX_FILES_PER_MESSAGE,
  createAttachmentFromFile,
  simulateUpload,
} from "@/lib/attachments";
import { applyAgentEvent } from "@/lib/chat-reducer";
import { runAgentTurn } from "@/lib/mock-agent";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { MessageList } from "./MessageList";
import { EmptyState } from "./EmptyState";
import { PromptInputBar } from "./PromptInputBar";

export function ChatApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composerText, setComposerText] = useState("");
  const [composerAttachments, setComposerAttachments] = useState<Attachment[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const uploadCancelers = useRef<Map<string, () => void>>(new Map());
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3200);
  };

  const patchAttachment = (id: string, patch: Partial<Attachment>) => {
    setComposerAttachments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
  };

  const handleAddFiles = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files);
    setComposerAttachments((prev) => {
      const room = MAX_FILES_PER_MESSAGE - prev.length;
      if (room <= 0) {
        flashNotice(`You can attach up to ${MAX_FILES_PER_MESSAGE} files per message`);
        return prev;
      }
      const accepted = incoming.slice(0, room);
      if (incoming.length > accepted.length) {
        flashNotice(`Only ${room} more file${room === 1 ? "" : "s"} can be added`);
      }
      const created = accepted.map((file) => createAttachmentFromFile(file));
      created.forEach((att) => {
        if (att.status !== "uploading") return;
        const cancel = simulateUpload(
          (progress) => patchAttachment(att.id, { progress }),
          () => patchAttachment(att.id, { status: "ready", progress: 100 }),
        );
        uploadCancelers.current.set(att.id, cancel);
      });
      return [...prev, ...created];
    });
  }, []);

  const handleRemoveAttachment = useCallback((id: string) => {
    uploadCancelers.current.get(id)?.();
    uploadCancelers.current.delete(id);
    setComposerAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const canSend =
    !isStreaming &&
    !composerAttachments.some((a) => a.status === "uploading" || a.status === "error") &&
    (composerText.trim().length > 0 || composerAttachments.length > 0);

  const handleSend = useCallback(() => {
    if (!canSend) return;

    const userMessage: ChatMessage = {
      id: createId("msg"),
      role: "user",
      text: composerText.trim(),
      attachments: composerAttachments,
      createdAt: Date.now(),
    };

    const assistantMessage: AssistantMessageType = {
      id: createId("msg"),
      role: "assistant",
      blocks: [],
      status: "streaming",
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setComposerText("");
    setComposerAttachments([]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    runAgentTurn(
      userMessage.text,
      userMessage.attachments,
      (event) => setMessages((prev) => applyAgentEvent(prev, assistantMessage.id, event)),
      controller.signal,
    ).then((result) => {
      if (result === "stopped") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id && m.role === "assistant"
              ? { ...m, status: "stopped" }
              : m,
          ),
        );
      }
      setIsStreaming(false);
      abortRef.current = null;
    });
  }, [canSend, composerText, composerAttachments]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <div className="flex h-dvh flex-col bg-bg">
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15">
            <Sparkles size={13} style={{ color: "var(--color-accent)" }} />
          </div>
          <span className="text-[13px] font-medium text-text">Agent Console</span>
          <span className="rounded border px-1.5 py-0.5 text-[10px] text-text-faint">
            simulated
          </span>
        </div>
        <ThemeToggle />
      </header>

      {messages.length === 0 ? (
        <EmptyState onPick={setComposerText} />
      ) : (
        <MessageList messages={messages} />
      )}

      <div className="shrink-0 px-4 pb-4">
        <div className="mx-auto max-w-[42rem]">
          <PromptInputBar
            value={composerText}
            onChange={setComposerText}
            attachments={composerAttachments}
            onAddFiles={handleAddFiles}
            onRemoveAttachment={handleRemoveAttachment}
            onSend={handleSend}
            onStop={handleStop}
            isStreaming={isStreaming}
            notice={notice}
          />
        </div>
      </div>
    </div>
  );
}

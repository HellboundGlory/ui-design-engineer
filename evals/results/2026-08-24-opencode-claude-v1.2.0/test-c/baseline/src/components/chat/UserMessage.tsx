import type { UserMessage as UserMessageType } from "@/lib/types";
import { formatClock } from "@/lib/format";
import { AttachmentChip } from "./AttachmentChip";

export function UserMessage({ message }: { message: UserMessageType }) {
  return (
    <div className="enter-block flex flex-col items-end gap-1.5">
      <div
        className="max-w-[min(38rem,88%)] rounded-2xl rounded-tr-sm border px-4 py-2.5"
        style={{
          background: "var(--color-user-bubble)",
          borderColor: "var(--color-user-border)",
        }}
      >
        <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap text-text">
          {message.text}
        </p>
      </div>
      {message.attachments.length > 0 && (
        <div className="flex max-w-[min(38rem,88%)] flex-wrap justify-end gap-2">
          {message.attachments.map((att) => (
            <AttachmentChip key={att.id} attachment={att} />
          ))}
        </div>
      )}
      <span className="pr-1 text-[11px] text-text-faint">{formatClock(message.createdAt)}</span>
    </div>
  );
}

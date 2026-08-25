import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  tone?: "default" | "danger";
}

export function SectionCard({ title, description, children, footer, tone = "default" }: SectionCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-xl border bg-white shadow-panel ${
        tone === "danger" ? "border-danger-500/30" : "border-border"
      }`}
    >
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className={`text-sm font-semibold ${tone === "danger" ? "text-danger-600" : "text-ink-900"}`}>{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {footer && (
        <div
          className={`flex items-center justify-end gap-2 border-t px-5 py-3 sm:px-6 ${
            tone === "danger" ? "border-danger-500/30 bg-danger-50/40" : "border-border bg-canvas/60"
          }`}
        >
          {footer}
        </div>
      )}
    </section>
  );
}

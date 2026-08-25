import type { ReactNode } from "react";

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ChartPanel({ title, subtitle, children, className = "" }: ChartPanelProps) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 ${className}`}>
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

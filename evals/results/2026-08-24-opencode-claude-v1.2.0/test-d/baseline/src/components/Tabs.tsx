import { useRef } from "react";
import type { TabDef, TabId } from "../types";

interface TabsProps {
  tabs: TabDef[];
  activeId: TabId;
  onChange: (id: TabId) => void;
}

/**
 * ARIA "tabs" pattern (manual activation would also be valid, but automatic
 * activation with roving tabindex + arrow-key movement matches how most
 * settings UIs — GitHub, Stripe, Vercel — actually behave).
 * https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 */
export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map());

  function focusAndActivate(id: TabId) {
    onChange(id);
    tabRefs.current.get(id)?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex !== null) {
      e.preventDefault();
      focusAndActivate(tabs[nextIndex].id);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Settings sections"
      className="flex gap-1 overflow-x-auto border-b border-border px-1 sm:px-0"
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`relative shrink-0 whitespace-nowrap px-3.5 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-500 ${
              selected ? "text-ink-900" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            {tab.label}
            <span
              aria-hidden="true"
              className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full transition-colors ${
                selected ? "bg-accent-500" : "bg-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

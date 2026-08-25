"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import diff from "react-syntax-highlighter/dist/esm/languages/prism/diff";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import { useTheme } from "@/components/theme/ThemeProvider";

const LANGUAGES: Record<string, unknown> = {
  tsx,
  typescript,
  ts: typescript,
  jsx,
  javascript,
  js: javascript,
  json,
  bash,
  sh: bash,
  shell: bash,
  diff,
  css,
  markdown,
  md: markdown,
  python,
  py: python,
};

for (const [name, def] of Object.entries(LANGUAGES)) {
  SyntaxHighlighter.registerLanguage(name, def as never);
}

export function CodeBlock({ language, code }: { language?: string; code: string }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const normalized = (language ?? "").toLowerCase();
  const supported = normalized in LANGUAGES;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — silently no-op
    }
  };

  return (
    <div className="group/code relative overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b bg-surface-raised px-3 py-1.5">
        <span className="font-mono text-[11px] text-text-faint">
          {normalized || "text"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-text-faint transition-colors hover:bg-surface hover:text-text"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {supported ? (
        <SyntaxHighlighter
          language={normalized}
          style={theme === "dark" ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: "0.75rem 0.9rem",
            background: "var(--color-surface)",
            fontSize: "12.5px",
            lineHeight: 1.6,
          }}
          codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>
      ) : (
        <pre className="scroll-thin overflow-x-auto bg-surface px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-text">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

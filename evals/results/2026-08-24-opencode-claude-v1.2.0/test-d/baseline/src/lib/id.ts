/** Short, URL-safe random id — good enough for in-memory mock records. */
export function makeId(prefix = ""): string {
  const rand = crypto.getRandomValues(new Uint32Array(2));
  const s = Array.from(rand, (n) => n.toString(36)).join("");
  return prefix ? `${prefix}_${s}` : s;
}

/** Generates a plausible-looking secret API key string. Never persisted beyond creation-time display. */
export function makeApiKeySecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "A")
    .replace(/\//g, "B")
    .replace(/=/g, "");
  return `mk_live_${b64}`;
}

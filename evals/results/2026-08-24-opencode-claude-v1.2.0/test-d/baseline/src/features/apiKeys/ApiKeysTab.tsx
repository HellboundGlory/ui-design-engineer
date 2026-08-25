import { useId, useReducer, useRef, useState } from "react";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { FormField, Select } from "../../components/FormField";
import { SectionCard } from "../../components/SectionCard";
import { useToast } from "../../components/Toast";
import { formatDate, relativeFromNow, isoDaysAgo } from "../../lib/format";
import { makeApiKeySecret, makeId } from "../../lib/id";
import { required } from "../../lib/validation";
import type { ApiKey, ApiKeyScope } from "../../types";

const SCOPE_LABEL: Record<ApiKeyScope, string> = {
  "read-only": "Read only",
  "read-write": "Read & write",
  admin: "Admin",
};

const SCOPE_TONE: Record<ApiKeyScope, "neutral" | "accent" | "danger"> = {
  "read-only": "neutral",
  "read-write": "accent",
  admin: "danger",
};

const INITIAL_KEYS: ApiKey[] = [
  {
    id: makeId("key"),
    name: "Production backend",
    scope: "read-write",
    last4: "8f2a",
    createdAt: isoDaysAgo(210),
    lastUsedAt: isoDaysAgo(0),
  },
  {
    id: makeId("key"),
    name: "CI pipeline",
    scope: "read-only",
    last4: "c103",
    createdAt: isoDaysAgo(64),
    lastUsedAt: isoDaysAgo(2),
  },
  {
    id: makeId("key"),
    name: "Legacy import script",
    scope: "admin",
    last4: "44e9",
    createdAt: isoDaysAgo(400),
    lastUsedAt: null,
  },
];

type Action =
  | { type: "add"; key: ApiKey }
  | { type: "revoke"; id: string };

function keysReducer(state: ApiKey[], action: Action): ApiKey[] {
  switch (action.type) {
    case "add":
      return [action.key, ...state];
    case "revoke":
      return state.filter((k) => k.id !== action.id);
  }
}

export function ApiKeysTab() {
  const { push } = useToast();
  const [keys, dispatch] = useReducer(keysReducer, INITIAL_KEYS);

  // --- Create flow ---
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScope, setNewScope] = useState<ApiKeyScope>("read-only");
  const [nameError, setNameError] = useState<string | undefined>();
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const createDialogRef = useRef<HTMLDialogElement>(null);
  const revealDialogRef = useRef<HTMLDialogElement>(null);
  const nameId = useId();

  function openCreate() {
    setNewName("");
    setNewScope("read-only");
    setNameError(undefined);
    setCreateOpen(true);
    requestAnimationFrame(() => createDialogRef.current?.showModal());
  }

  function closeCreate() {
    setCreateOpen(false);
    createDialogRef.current?.close();
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = required(newName, "Key name");
    if (err) {
      setNameError(err);
      return;
    }
    const secret = makeApiKeySecret();
    const key: ApiKey = {
      id: makeId("key"),
      name: newName.trim(),
      scope: newScope,
      last4: secret.slice(-4),
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };
    dispatch({ type: "add", key });
    closeCreate();
    setRevealedSecret(secret);
    setCopied(false);
    requestAnimationFrame(() => revealDialogRef.current?.showModal());
  }

  async function copySecret() {
    if (!revealedSecret) return;
    try {
      await navigator.clipboard.writeText(revealedSecret);
      setCopied(true);
      push("success", "Key copied to clipboard.");
    } catch {
      push("error", "Couldn't access the clipboard — copy the key manually.");
    }
  }

  function closeReveal() {
    revealDialogRef.current?.close();
    setRevealedSecret(null);
    push("info", "New key created. Store it somewhere safe — it won't be shown again.");
  }

  // --- Revoke flow ---
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="API keys"
        description="Keys authenticate requests to the API on your behalf. Treat them like passwords."
        footer={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-md bg-accent-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            Create API key
          </button>
        }
      >
        {keys.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-sm font-medium text-ink-700">No API keys yet</p>
            <p className="max-w-sm text-sm text-ink-400">
              Create a key to start making authenticated requests to the API.
            </p>
          </div>
        ) : (
          <div className="table-scroll -mx-1 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-400">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Key</th>
                  <th className="px-3 py-2 font-medium">Scope</th>
                  <th className="px-3 py-2 font-medium">Created</th>
                  <th className="px-3 py-2 font-medium">Last used</th>
                  <th className="px-3 py-2 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-3 font-medium text-ink-900">{key.name}</td>
                    <td className="px-3 py-3">
                      <code className="rounded bg-canvas px-1.5 py-0.5 font-mono text-xs text-ink-500">
                        mk_live_••••••••{key.last4}
                      </code>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={SCOPE_TONE[key.scope]}>{SCOPE_LABEL[key.scope]}</Badge>
                    </td>
                    <td className="px-3 py-3 text-ink-500">{formatDate(key.createdAt)}</td>
                    <td className="px-3 py-3 text-ink-500">{relativeFromNow(key.lastUsedAt)}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setRevokeTarget(key)}
                        className="rounded-md px-2 py-1 text-sm font-medium text-danger-500 hover:bg-danger-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-danger-500"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Create key dialog */}
      <dialog
        ref={createDialogRef}
        aria-labelledby={`${nameId}-title`}
        className="w-full max-w-md rounded-xl bg-white p-0 shadow-popover"
        onCancel={() => setCreateOpen(false)}
        onClose={() => setCreateOpen(false)}
      >
        {createOpen && (
          <form onSubmit={handleCreateSubmit} noValidate>
            <div className="p-5">
              <h2 id={`${nameId}-title`} className="text-base font-semibold text-ink-900">
                Create API key
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                The full key is only shown once, immediately after creation.
              </p>
              <div className="mt-4 flex flex-col gap-4">
                <FormField
                  label="Key name"
                  placeholder="e.g. Staging worker"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  error={nameError}
                  autoFocus
                />
                <Select label="Scope" value={newScope} onChange={(e) => setNewScope(e.target.value as ApiKeyScope)}>
                  <option value="read-only">Read only — can fetch data, no mutations</option>
                  <option value="read-write">Read &amp; write — can create and update records</option>
                  <option value="admin">Admin — full access, including billing and team settings</option>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 rounded-b-xl border-t border-border bg-canvas px-5 py-3">
              <button
                type="button"
                onClick={closeCreate}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-accent-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                Create key
              </button>
            </div>
          </form>
        )}
      </dialog>

      {/* Reveal-once secret dialog */}
      <dialog
        ref={revealDialogRef}
        aria-labelledby="reveal-title"
        className="w-full max-w-md rounded-xl bg-white p-0 shadow-popover"
        onCancel={(e) => e.preventDefault()}
      >
        {revealedSecret && (
          <div>
            <div className="p-5">
              <h2 id="reveal-title" className="text-base font-semibold text-ink-900">
                Copy your new API key
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                For security, this is the only time the full key is shown. Store it in a password manager or secrets
                vault.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-md border border-border-strong bg-canvas p-3">
                <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-ink-900">
                  {revealedSecret}
                </code>
                <button
                  type="button"
                  onClick={copySecret}
                  className="shrink-0 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 shadow-sm ring-1 ring-inset ring-border-strong hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-500"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-3 text-xs text-warn-500">
                Anyone with this key can act on your account within its granted scope. Never commit it to source
                control.
              </p>
            </div>
            <div className="flex justify-end rounded-b-xl border-t border-border bg-canvas px-5 py-3">
              <button
                type="button"
                onClick={closeReveal}
                className="rounded-md bg-accent-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                Done, I've saved it
              </button>
            </div>
          </div>
        )}
      </dialog>

      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => {
          if (!revokeTarget) return;
          dispatch({ type: "revoke", id: revokeTarget.id });
          push("success", `"${revokeTarget.name}" revoked.`);
        }}
        title={`Revoke "${revokeTarget?.name}"?`}
        description="Any application using this key will immediately lose access. This cannot be undone — you'll need to create a new key to restore access."
        confirmLabel="Revoke key"
        busyLabel="Revoking…"
      />
    </div>
  );
}

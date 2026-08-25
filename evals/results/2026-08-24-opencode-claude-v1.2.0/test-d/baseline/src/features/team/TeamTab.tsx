import { useReducer, useRef, useState } from "react";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { FormField, Select } from "../../components/FormField";
import { SectionCard } from "../../components/SectionCard";
import { useToast } from "../../components/Toast";
import { formatDate, isoDaysAgo } from "../../lib/format";
import { emailError } from "../../lib/validation";
import { makeId } from "../../lib/id";
import type { TeamMember, TeamRole } from "../../types";

const ROLE_LABEL: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

const ROLE_DESCRIPTION: Record<TeamRole, string> = {
  owner: "Full control, including billing and ownership transfer.",
  admin: "Can manage team members, API keys, and settings.",
  member: "Can use the product and manage their own resources.",
  viewer: "Read-only access to shared resources.",
};

const CURRENT_USER_EMAIL = "jordan.reyes@example.com";

const INITIAL_MEMBERS: TeamMember[] = [
  { id: makeId("mem"), name: "Jordan Reyes", email: CURRENT_USER_EMAIL, role: "owner", status: "active", joinedAt: isoDaysAgo(410) },
  { id: makeId("mem"), name: "Priya Natarajan", email: "priya.natarajan@example.com", role: "admin", status: "active", joinedAt: isoDaysAgo(300) },
  { id: makeId("mem"), name: "Marcus Bell", email: "marcus.bell@example.com", role: "member", status: "active", joinedAt: isoDaysAgo(120) },
  { id: makeId("mem"), name: "Sofia Álvarez", email: "sofia.alvarez@example.com", role: "viewer", status: "active", joinedAt: isoDaysAgo(40) },
  { id: makeId("mem"), name: "", email: "devon.k@example.com", role: "member", status: "invited", joinedAt: null },
];

type Action =
  | { type: "setRole"; id: string; role: TeamRole }
  | { type: "remove"; id: string }
  | { type: "invite"; member: TeamMember };

function membersReducer(state: TeamMember[], action: Action): TeamMember[] {
  switch (action.type) {
    case "setRole":
      return state.map((m) => (m.id === action.id ? { ...m, role: action.role } : m));
    case "remove":
      return state.filter((m) => m.id !== action.id);
    case "invite":
      return [...state, action.member];
  }
}

export function TeamTab() {
  const { push } = useToast();
  const [members, dispatch] = useReducer(membersReducer, INITIAL_MEMBERS);

  const active = members.filter((m) => m.status === "active");
  const pending = members.filter((m) => m.status === "invited");
  const ownerCount = active.filter((m) => m.role === "owner").length;

  // --- Invite flow ---
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("member");
  const [inviteError, setInviteError] = useState<string | undefined>();
  const inviteDialogRef = useRef<HTMLDialogElement>(null);

  function openInvite() {
    setInviteEmail("");
    setInviteRole("member");
    setInviteError(undefined);
    setInviteOpen(true);
    requestAnimationFrame(() => inviteDialogRef.current?.showModal());
  }

  function closeInvite() {
    setInviteOpen(false);
    inviteDialogRef.current?.close();
  }

  function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = emailError(inviteEmail);
    if (err) {
      setInviteError(err);
      return;
    }
    const normalized = inviteEmail.trim().toLowerCase();
    if (members.some((m) => m.email.toLowerCase() === normalized)) {
      setInviteError("This person is already a member or has a pending invite.");
      return;
    }
    dispatch({
      type: "invite",
      member: { id: makeId("mem"), name: "", email: inviteEmail.trim(), role: inviteRole, status: "invited", joinedAt: null },
    });
    push("success", `Invitation sent to ${inviteEmail.trim()}.`);
    closeInvite();
  }

  // --- Remove member (destructive) ---
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  // --- Revoke invite (lighter-weight: immediate + toast, no modal) ---
  function revokeInvite(member: TeamMember) {
    dispatch({ type: "remove", id: member.id });
    push("info", `Invitation to ${member.email} revoked.`);
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Members"
        description={`${active.length} active member${active.length === 1 ? "" : "s"}.`}
        footer={
          <button
            type="button"
            onClick={openInvite}
            className="rounded-md bg-accent-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            Invite member
          </button>
        }
      >
        <div className="table-scroll -mx-1 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-400">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Joined</th>
                <th className="px-3 py-2 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {active.map((member) => {
                const isOwner = member.role === "owner";
                const isSelf = member.email.toLowerCase() === CURRENT_USER_EMAIL;
                const isLastOwner = isOwner && ownerCount <= 1;
                return (
                  <tr key={member.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-3">
                      <p className="font-medium text-ink-900">
                        {member.name}
                        {isSelf && <span className="ml-1.5 text-xs font-normal text-ink-400">(you)</span>}
                      </p>
                      <p className="text-xs text-ink-400">{member.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      {isOwner ? (
                        <span title="Transfer ownership to change this role.">
                          <Badge tone="accent">Owner</Badge>
                        </span>
                      ) : (
                        <label className="sr-only" htmlFor={`role-${member.id}`}>
                          Role for {member.name}
                        </label>
                      )}
                      {!isOwner && (
                        <select
                          id={`role-${member.id}`}
                          value={member.role}
                          onChange={(e) => {
                            dispatch({ type: "setRole", id: member.id, role: e.target.value as TeamRole });
                            push("success", `${member.name}'s role changed to ${ROLE_LABEL[e.target.value as TeamRole]}.`);
                          }}
                          className="rounded-md border border-border-strong bg-white px-2 py-1 text-sm text-ink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-500"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-3 text-ink-500">{formatDate(member.joinedAt)}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setRemoveTarget(member)}
                        disabled={isLastOwner}
                        title={isLastOwner ? "Transfer ownership before removing the last owner." : undefined}
                        className="rounded-md px-2 py-1 text-sm font-medium text-danger-500 hover:bg-danger-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-danger-500 disabled:cursor-not-allowed disabled:text-ink-400 disabled:hover:bg-transparent"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {pending.length > 0 && (
        <SectionCard title="Pending invitations" description="These people haven't accepted their invite yet.">
          <ul className="flex flex-col divide-y divide-border">
            {pending.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-ink-900">{member.email}</p>
                  <p className="text-xs text-ink-400">Invited as {ROLE_LABEL[member.role]}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="warn">Pending</Badge>
                  <button
                    type="button"
                    onClick={() => revokeInvite(member)}
                    className="rounded-md px-2 py-1 text-sm font-medium text-ink-500 hover:bg-canvas hover:text-danger-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-500"
                  >
                    Revoke
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Invite dialog */}
      <dialog
        ref={inviteDialogRef}
        aria-labelledby="invite-title"
        className="w-full max-w-md rounded-xl bg-white p-0 shadow-popover"
        onCancel={() => setInviteOpen(false)}
        onClose={() => setInviteOpen(false)}
      >
        {inviteOpen && (
          <form onSubmit={handleInviteSubmit} noValidate>
            <div className="p-5">
              <h2 id="invite-title" className="text-base font-semibold text-ink-900">
                Invite a team member
              </h2>
              <p className="mt-1 text-sm text-ink-500">They'll receive an email invite to join your team.</p>
              <div className="mt-4 flex flex-col gap-4">
                <FormField
                  label="Email address"
                  type="email"
                  placeholder="name@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  error={inviteError}
                  autoFocus
                />
                <Select label="Role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as TeamRole)}>
                  <option value="admin">Admin — {ROLE_DESCRIPTION.admin}</option>
                  <option value="member">Member — {ROLE_DESCRIPTION.member}</option>
                  <option value="viewer">Viewer — {ROLE_DESCRIPTION.viewer}</option>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 rounded-b-xl border-t border-border bg-canvas px-5 py-3">
              <button
                type="button"
                onClick={closeInvite}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-accent-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                Send invite
              </button>
            </div>
          </form>
        )}
      </dialog>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (!removeTarget) return;
          dispatch({ type: "remove", id: removeTarget.id });
          push("success", `${removeTarget.name} removed from the team.`);
        }}
        title={`Remove ${removeTarget?.name}?`}
        description={`${removeTarget?.name} will immediately lose access to this team's data, API keys, and billing. They can be re-invited later.`}
        confirmLabel="Remove member"
        busyLabel="Removing…"
      />
    </div>
  );
}

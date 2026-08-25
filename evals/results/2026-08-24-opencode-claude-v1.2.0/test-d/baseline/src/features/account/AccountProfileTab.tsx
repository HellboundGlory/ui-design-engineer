import { useState } from "react";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { FormField, Select } from "../../components/FormField";
import { SectionCard } from "../../components/SectionCard";
import { useToast } from "../../components/Toast";
import type { AccountState } from "../../types";
import { emailError, maxLength, minLength, required, type FieldErrors } from "../../lib/validation";

const TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const INITIAL_ACCOUNT: AccountState = {
  fullName: "Jordan Reyes",
  email: "jordan.reyes@example.com",
  timezone: "America/New_York",
  bio: "Product engineer focused on developer tooling.",
};

type ProfileField = "fullName" | "email" | "bio";
type PasswordField = "current" | "next" | "confirm";

export function AccountProfileTab() {
  const { push } = useToast();

  // --- Profile form: separate "saved" and "draft" so we can detect dirtiness and revert ---
  const [saved, setSaved] = useState<AccountState>(INITIAL_ACCOUNT);
  const [draft, setDraft] = useState<AccountState>(INITIAL_ACCOUNT);
  const [profileErrors, setProfileErrors] = useState<FieldErrors<ProfileField>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);

  function validateProfile(state: AccountState): FieldErrors<ProfileField> {
    return {
      fullName: required(state.fullName, "Full name") ?? maxLength(state.fullName, 80, "Full name"),
      email: emailError(state.email),
      bio: maxLength(state.bio, 280, "Bio"),
    };
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateProfile(draft);
    const hasErrors = Object.values(errors).some(Boolean);
    setProfileErrors(errors);
    if (hasErrors) {
      push("error", "Fix the highlighted fields before saving.");
      return;
    }
    setSavingProfile(true);
    // Simulated network round-trip so the loading/disabled state is real, not just cosmetic.
    setTimeout(() => {
      setSaved(draft);
      setSavingProfile(false);
      push("success", "Profile updated.");
    }, 500);
  }

  function handleProfileReset() {
    setDraft(saved);
    setProfileErrors({});
  }

  // --- Password change ---
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdErrors, setPwdErrors] = useState<FieldErrors<PasswordField>>({});
  const [changingPwd, setChangingPwd] = useState(false);

  function validatePassword(): FieldErrors<PasswordField> {
    const current = required(pwd.current, "Current password");
    const next =
      required(pwd.next, "New password") ??
      minLength(pwd.next, 10, "New password") ??
      (pwd.next && pwd.next === pwd.current ? "New password must differ from the current password." : undefined);
    const confirm =
      required(pwd.confirm, "Confirmation") ?? (pwd.confirm !== pwd.next ? "Passwords do not match." : undefined);
    return { current, next, confirm };
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validatePassword();
    setPwdErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      push("error", "Fix the highlighted fields before changing your password.");
      return;
    }
    setChangingPwd(true);
    setTimeout(() => {
      setChangingPwd(false);
      setPwd({ current: "", next: "", confirm: "" });
      setPwdErrors({});
      push("success", "Password changed. You'll stay signed in on this device.");
    }, 600);
  }

  // --- Delete account (destructive, type-to-confirm) ---
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Profile"
        description="This information may be visible to other members of your team."
        footer={
          <>
            <button
              type="button"
              onClick={handleProfileReset}
              disabled={!isDirty || savingProfile}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Discard changes
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={!isDirty || savingProfile}
              className="rounded-md bg-accent-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 disabled:cursor-not-allowed disabled:bg-ink-400/50"
            >
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
          </>
        }
      >
        <form id="profile-form" onSubmit={handleProfileSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="flex items-center gap-4 sm:col-span-2">
            <div
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-100 text-lg font-semibold text-accent-700"
            >
              {draft.fullName
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-medium text-ink-900">Profile photo</p>
              <p className="text-xs text-ink-400">Generated from your initials — custom uploads aren't wired up in this build.</p>
            </div>
          </div>

          <FormField
            label="Full name"
            value={draft.fullName}
            onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
            error={profileErrors.fullName}
            autoComplete="name"
          />
          <FormField
            label="Email address"
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            error={profileErrors.email}
            autoComplete="email"
          />
          <Select
            label="Timezone"
            value={draft.timezone}
            onChange={(e) => setDraft((d) => ({ ...d, timezone: e.target.value }))}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </Select>
          <div className="sm:col-span-2">
            <FormField
              as="textarea"
              label="Bio"
              value={draft.bio}
              onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
              error={profileErrors.bio}
              hint={`${draft.bio.length}/280`}
              maxLength={280}
            />
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Change password"
        description="Choose a password that's at least 10 characters and not used elsewhere."
        footer={
          <button
            type="submit"
            form="password-form"
            disabled={changingPwd}
            className="rounded-md bg-accent-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 disabled:cursor-not-allowed disabled:bg-ink-400/50"
          >
            {changingPwd ? "Updating…" : "Update password"}
          </button>
        }
      >
        <form id="password-form" onSubmit={handlePasswordSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <FormField
              label="Current password"
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
              error={pwdErrors.current}
              autoComplete="current-password"
            />
          </div>
          <FormField
            label="New password"
            type="password"
            value={pwd.next}
            onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
            error={pwdErrors.next}
            autoComplete="new-password"
          />
          <FormField
            label="Confirm new password"
            type="password"
            value={pwd.confirm}
            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
            error={pwdErrors.confirm}
            autoComplete="new-password"
          />
        </form>
      </SectionCard>

      <SectionCard
        title="Danger zone"
        description="Deleting your account is permanent and cannot be undone."
        tone="danger"
        footer={
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            disabled={deleted}
            className="rounded-md bg-danger-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-danger-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete account
          </button>
        }
      >
        {deleted ? (
          <div className="flex items-center gap-2">
            <Badge tone="danger">Deletion scheduled</Badge>
            <p className="text-sm text-ink-500">This account will be permanently removed. (Simulated — nothing was actually deleted.)</p>
          </div>
        ) : (
          <p className="text-sm text-ink-500">
            This removes your profile, revokes every API key you own, and removes you from all teams. Team data owned
            by others is unaffected.
          </p>
        )}
      </SectionCard>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleted(true);
          push("success", "Account deletion simulated — this is a mock action, nothing was sent anywhere.");
        }}
        title="Delete your account?"
        description={`This permanently deletes ${saved.fullName}'s account, revokes all API keys, and removes them from every team. This cannot be undone.`}
        confirmLabel="Delete account"
        busyLabel="Deleting…"
        typeToConfirm={saved.email}
      />
    </div>
  );
}

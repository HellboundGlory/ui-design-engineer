export type TabId = "account" | "api-keys" | "billing" | "team";

export interface TabDef {
  id: TabId;
  label: string;
  description: string;
}

// ---- Account ----
export interface AccountState {
  fullName: string;
  email: string;
  timezone: string;
  bio: string;
}

// ---- API Keys ----
export type ApiKeyScope = "read-only" | "read-write" | "admin";

export interface ApiKey {
  id: string;
  name: string;
  scope: ApiKeyScope;
  /** Last 4 characters only — the full secret is never retained after creation. */
  last4: string;
  createdAt: string; // ISO date
  lastUsedAt: string | null; // ISO date
}

// ---- Billing ----
export type PlanId = "free" | "pro" | "enterprise";

export interface PlanDef {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  seatLimit: number;
  apiCallLimit: number;
  highlights: string[];
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
}

// ---- Team ----
export type TeamRole = "owner" | "admin" | "member" | "viewer";
export type MemberStatus = "active" | "invited";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: MemberStatus;
  joinedAt: string | null;
}

import type { Invoice, PlanDef } from "../../types";
import { isoDaysAgo } from "../../lib/format";

export const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    seatLimit: 3,
    apiCallLimit: 10_000,
    highlights: ["3 seats", "10,000 API calls / mo", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    cadence: "per month",
    seatLimit: 20,
    apiCallLimit: 250_000,
    highlights: ["20 seats", "250,000 API calls / mo", "Priority email support", "Audit log (30 days)"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    cadence: "billed annually",
    seatLimit: Infinity,
    apiCallLimit: Infinity,
    highlights: ["Unlimited seats", "Unlimited API calls", "SSO & SCIM", "Dedicated support engineer"],
  },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: "inv_2026_07", date: isoDaysAgo(24), amount: "$49.00", status: "paid" },
  { id: "inv_2026_06", date: isoDaysAgo(54), amount: "$49.00", status: "paid" },
  { id: "inv_2026_05", date: isoDaysAgo(85), amount: "$49.00", status: "paid" },
  { id: "inv_2026_04", date: isoDaysAgo(116), amount: "$49.00", status: "failed" },
];

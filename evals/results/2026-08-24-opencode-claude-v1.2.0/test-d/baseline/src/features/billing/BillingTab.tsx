import { useState } from "react";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { SectionCard } from "../../components/SectionCard";
import { useToast } from "../../components/Toast";
import { formatDate } from "../../lib/format";
import type { Invoice, PlanId } from "../../types";
import { MOCK_INVOICES, PLANS } from "./plans";
import { UsageMeter } from "./UsageMeter";

const INVOICE_STATUS_TONE: Record<Invoice["status"], "success" | "warn" | "danger"> = {
  paid: "success",
  pending: "warn",
  failed: "danger",
};

export function BillingTab() {
  const { push } = useToast();
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>("pro");
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("pro");
  const [switchTarget, setSwitchTarget] = useState<PlanId | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancelEffectiveDate, setCancelEffectiveDate] = useState<string | null>(null);

  const currentPlan = PLANS.find((p) => p.id === currentPlanId)!;
  const seatsUsed = 12;
  const apiCallsUsed = 184_203;

  const currentIndex = PLANS.findIndex((p) => p.id === currentPlanId);
  const selectedIndex = PLANS.findIndex((p) => p.id === switchTarget);
  const isDowngrade = switchTarget !== null && selectedIndex < currentIndex;

  return (
    <div className="flex flex-col gap-6">
      {cancelled && cancelEffectiveDate && (
        <div className="rounded-lg border border-warn-500/30 bg-warn-50 px-4 py-3 text-sm text-ink-700">
          Your subscription is set to cancel at the end of the current billing period ({formatDate(cancelEffectiveDate)}). You'll keep Pro features until then.
        </div>
      )}

      <SectionCard title="Current plan" description="Your plan determines usage limits and available features.">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-ink-900">{currentPlan.name}</p>
              <Badge tone="accent">{currentPlan.price} {currentPlan.cadence}</Badge>
              {cancelled && <Badge tone="warn">Cancels soon</Badge>}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
              {currentPlan.highlights.map((h) => (
                <li key={h} className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-accent-500">
                    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {h}
                </li>
              ))}
            </ul>
          </div>
          {!cancelled && currentPlanId !== "free" && (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-danger-500 hover:bg-danger-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-danger-500"
            >
              Cancel plan
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <UsageMeter label="Seats" used={seatsUsed} limit={currentPlan.seatLimit} />
          <UsageMeter label="API calls this month" used={apiCallsUsed} limit={currentPlan.apiCallLimit} />
        </div>
      </SectionCard>

      <SectionCard title="Change plan" description="Switching plans takes effect immediately; you're billed a prorated difference.">
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const isSelected = plan.id === selectedPlanId;
            return (
              <label
                key={plan.id}
                className={`relative flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-sm transition-colors ${
                  isSelected ? "border-accent-500 ring-1 ring-accent-500" : "border-border hover:border-border-strong"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.id}
                  checked={isSelected}
                  onChange={() => setSelectedPlanId(plan.id)}
                  className="absolute right-3 top-3 h-4 w-4 accent-[var(--color-accent-500)]"
                />
                <span className="pr-6 font-semibold text-ink-900">{plan.name}</span>
                <span className="text-ink-500">
                  {plan.price} <span className="text-xs text-ink-400">{plan.cadence}</span>
                </span>
                {isCurrent && <Badge tone="neutral">Current plan</Badge>}
              </label>
            );
          })}
        </div>
        {selectedPlanId !== currentPlanId && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setSwitchTarget(selectedPlanId)}
              className="rounded-md bg-accent-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              Switch to {PLANS.find((p) => p.id === selectedPlanId)!.name}
            </button>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Payment method"
        description="Used for your monthly subscription charge."
        footer={
          <button
            type="button"
            onClick={() => push("info", "Payment method editing isn't wired up in this demo build.")}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-canvas"
          >
            Update payment method
          </button>
        }
      >
        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-8 w-12 items-center justify-center rounded bg-ink-900 text-[10px] font-bold tracking-wide text-white">
            VISA
          </div>
          <div>
            <p className="font-medium text-ink-900">Visa ending in 4242</p>
            <p className="text-ink-400">Expires 08/2029</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Invoice history" description="Download past invoices for your records.">
        <div className="table-scroll -mx-1 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-ink-400">
                <th className="px-3 py-2 font-medium">Invoice</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_INVOICES.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-3 font-mono text-xs text-ink-500">{inv.id}</td>
                  <td className="px-3 py-3 text-ink-700">{formatDate(inv.date)}</td>
                  <td className="px-3 py-3 text-ink-900">{inv.amount}</td>
                  <td className="px-3 py-3">
                    <Badge tone={INVOICE_STATUS_TONE[inv.status]}>{inv.status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => push("info", `Downloading ${inv.id} isn't wired up in this demo build.`)}
                      className="rounded-md px-2 py-1 text-sm font-medium text-accent-600 hover:bg-accent-50"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={switchTarget !== null}
        onClose={() => setSwitchTarget(null)}
        onConfirm={() => {
          if (!switchTarget) return;
          setCurrentPlanId(switchTarget);
          setCancelled(false);
          push("success", `Switched to the ${PLANS.find((p) => p.id === switchTarget)!.name} plan.`);
        }}
        title={`Switch to ${switchTarget ? PLANS.find((p) => p.id === switchTarget)!.name : ""}?`}
        description={
          isDowngrade
            ? "Downgrading reduces your seat and usage limits immediately. If you're currently over the new plan's limits, some team members or integrations may lose access."
            : "You'll be charged a prorated amount for the rest of this billing cycle, then the new plan's price on your next renewal."
        }
        confirmLabel={`Switch plan`}
        tone={isDowngrade ? "danger" : "default"}
        busyLabel="Switching…"
      />

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => {
          setCancelled(true);
          setCancelEffectiveDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString());
          push("success", "Your plan is set to cancel at the end of the billing period.");
        }}
        title="Cancel your subscription?"
        description="You'll keep Pro features until the end of the current billing period, then your account drops to the Free plan. Any usage above Free's limits will be blocked at that point."
        confirmLabel="Cancel plan"
        busyLabel="Cancelling…"
        typeToConfirm="CANCEL"
      />
    </div>
  );
}

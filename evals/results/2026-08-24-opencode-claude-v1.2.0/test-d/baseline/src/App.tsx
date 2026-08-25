import { useEffect, useState } from "react";
import { Tabs } from "./components/Tabs";
import { ToastProvider } from "./components/Toast";
import { AccountProfileTab } from "./features/account/AccountProfileTab";
import { ApiKeysTab } from "./features/apiKeys/ApiKeysTab";
import { BillingTab } from "./features/billing/BillingTab";
import { TeamTab } from "./features/team/TeamTab";
import type { TabDef, TabId } from "./types";

const TABS: TabDef[] = [
  { id: "account", label: "Account Profile", description: "Your personal information and password." },
  { id: "api-keys", label: "API Keys", description: "Manage credentials used to access the API." },
  { id: "billing", label: "Billing Plan", description: "Subscription, usage, and payment details." },
  { id: "team", label: "Team Permissions", description: "Who has access to this workspace, and at what level." },
];

function tabFromHash(): TabId {
  const hash = window.location.hash.replace("#", "");
  return TABS.some((t) => t.id === hash) ? (hash as TabId) : "account";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(tabFromHash);

  useEffect(() => {
    const onHashChange = () => setActiveTab(tabFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function changeTab(id: TabId) {
    setActiveTab(id);
    window.location.hash = id;
  }

  const activeDef = TABS.find((t) => t.id === activeTab)!;

  return (
    <ToastProvider>
      <div className="min-h-svh bg-canvas">
        <header className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-900 text-sm font-bold text-white">
              M
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">Meridian</p>
              <p className="text-xs text-ink-400">Acme Robotics workspace</p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="text-xl font-semibold text-ink-900">Settings</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your account, API access, billing, and team.</p>

          <div className="mt-6">
            <Tabs tabs={TABS} activeId={activeTab} onChange={changeTab} />
          </div>

          <div className="mt-6">
            <h2 id={`panel-${activeTab}-heading`} className="sr-only">
              {activeDef.label}
            </h2>
            <div
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              tabIndex={0}
              className="focus-visible:outline-none"
            >
              {activeTab === "account" && <AccountProfileTab />}
              {activeTab === "api-keys" && <ApiKeysTab />}
              {activeTab === "billing" && <BillingTab />}
              {activeTab === "team" && <TeamTab />}
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

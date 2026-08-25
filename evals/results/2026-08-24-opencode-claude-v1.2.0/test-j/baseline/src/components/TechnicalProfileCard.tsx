import type { EngineerProfile } from '../data/engineerProfile'

const statusStyles: Record<EngineerProfile['status'], { dot: string; text: string; label: string }> = {
  operational: { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Operational' },
  degraded: { dot: 'bg-amber-400', text: 'text-amber-400', label: 'Degraded' },
  offline: { dot: 'bg-rose-400', text: 'text-rose-400', label: 'Offline' },
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
      <dt className="font-sans-tech text-[10px] uppercase tracking-[0.12em] text-zinc-500">{label}</dt>
      <dd className="mt-1 font-mono-tech text-lg font-semibold tabular-nums text-zinc-100">
        {value}
        {unit && <span className="ml-0.5 text-xs font-normal text-zinc-500">{unit}</span>}
      </dd>
    </div>
  )
}

export function TechnicalProfileCard({ profile }: { profile: EngineerProfile }) {
  const status = statusStyles[profile.status]

  return (
    <section
      aria-label={`Engineer profile for ${profile.name}`}
      className="w-full max-w-md border border-zinc-800 bg-zinc-900 font-sans-tech text-zinc-200 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]"
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-3 border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-zinc-700 bg-zinc-800 font-mono-tech text-sm font-semibold text-zinc-200"
          >
            {profile.avatarInitials}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold leading-tight text-zinc-50">{profile.name}</h2>
            <p className="truncate font-mono-tech text-xs text-zinc-500">@{profile.handle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 border border-zinc-800 bg-zinc-950 px-2 py-1">
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot} animate-pulse-dot`} aria-hidden="true" />
          <span className={`font-mono-tech text-[11px] font-medium ${status.text}`}>{status.label}</span>
        </div>
      </header>

      {/* Role / team meta */}
      <div className="grid grid-cols-2 gap-px border-b border-zinc-800 bg-zinc-800 text-xs">
        <div className="bg-zinc-900 px-5 py-2.5">
          <p className="text-zinc-500">Role</p>
          <p className="mt-0.5 font-medium text-zinc-200">{profile.role}</p>
        </div>
        <div className="bg-zinc-900 px-5 py-2.5">
          <p className="text-zinc-500">Team</p>
          <p className="mt-0.5 font-medium text-zinc-200">{profile.team}</p>
        </div>
        <div className="bg-zinc-900 px-5 py-2.5">
          <p className="text-zinc-500">Location</p>
          <p className="mt-0.5 font-medium text-zinc-200">{profile.location}</p>
        </div>
        <div className="bg-zinc-900 px-5 py-2.5">
          <p className="text-zinc-500">Timezone</p>
          <p className="mt-0.5 font-mono-tech font-medium text-zinc-200">{profile.timezone}</p>
        </div>
      </div>

      {/* Dense stat grid */}
      <dl className="grid grid-cols-3 gap-px bg-zinc-800 px-0 py-0">
        <Stat label="Uptime SLA" value={profile.stats.uptimeSlaPct.toFixed(3)} unit="%" />
        <Stat label="p50 latency" value={String(profile.stats.p50ResponseMs)} unit="ms" />
        <Stat label="p99 latency" value={String(profile.stats.p99ResponseMs)} unit="ms" />
        <Stat label="Incidents / 90d" value={String(profile.stats.incidentsResolved90d)} />
        <Stat label="Services owned" value={String(profile.stats.servicesOwned)} />
        <Stat label="On-call hrs / mo" value={String(profile.stats.onCallHoursThisMonth)} unit="h" />
      </dl>

      {/* Owned services */}
      <div className="border-t border-zinc-800 px-5 py-3.5">
        <p className="mb-2 font-sans-tech text-[10px] uppercase tracking-[0.12em] text-zinc-500">Owned services</p>
        <ul className="flex flex-wrap gap-1.5">
          {profile.ownedServices.map((service) => (
            <li
              key={service}
              className="border border-zinc-700 bg-zinc-950 px-2 py-0.5 font-mono-tech text-[11px] text-zinc-300"
            >
              {service}
            </li>
          ))}
        </ul>
      </div>

      {/* Last deploy + contact */}
      <footer className="flex items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950/60 px-5 py-3 text-[11px] text-zinc-500">
        <p className="min-w-0 truncate">
          Last deploy{' '}
          <span className={profile.lastDeploy.result === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
            {profile.lastDeploy.service}
          </span>{' '}
          &middot; {profile.lastDeploy.relativeTime}
        </p>
        <div className="flex shrink-0 gap-3 font-mono-tech">
          <a
            className="rounded-sm text-zinc-400 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-200 hover:decoration-zinc-500"
            href={`mailto:${profile.contact.email}`}
          >
            email
          </a>
          <a
            className="rounded-sm text-zinc-400 underline decoration-zinc-700 underline-offset-2 hover:text-zinc-200 hover:decoration-zinc-500"
            href={`https://github.com/${profile.contact.github}`}
            target="_blank"
            rel="noreferrer"
          >
            github
          </a>
        </div>
      </footer>
    </section>
  )
}

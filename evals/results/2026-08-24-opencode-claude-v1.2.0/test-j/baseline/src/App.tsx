import { NavLink, Route, Routes } from 'react-router-dom'
import { TechnicalProfileCard } from './components/TechnicalProfileCard'
import { PlayfulProfileCard } from './components/PlayfulProfileCard'
import { engineerProfile } from './data/engineerProfile'
import { readerProfile } from './data/readerProfile'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to content
      </a>
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-stone-900">User Profile Card — Two Directions</p>
            <p className="text-xs text-stone-500">Same concept, two products, two audiences.</p>
          </div>
          <nav aria-label="Card directions" className="flex gap-1 rounded-lg bg-stone-100 p-1">
            <NavItem to="/">Compare</NavItem>
            <NavItem to="/technical">Orbit (Technical)</NavItem>
            <NavItem to="/playful">Kindred (Playful)</NavItem>
          </nav>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-5xl px-6 py-10">
        {children}
      </main>
    </div>
  )
}

function ComparePage() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Precise &amp; data-dense — Orbit
        </h2>
        <p className="mb-4 text-sm text-stone-500">
          On-call engineer directory card. Optimized for scanning under incident pressure: dense grid, monospace
          numerals, near-zero motion, dark neutral palette with a single status accent.
        </p>
        <TechnicalProfileCard profile={engineerProfile} />
      </div>
      <div>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-stone-500">
          Warm &amp; playful — Kindred
        </h2>
        <p className="mb-4 text-sm text-stone-500">
          Social reading-app profile card. Optimized for delight and connection: generous radius, warm gradient,
          illustrated badges, and hover motion that rewards interaction.
        </p>
        <PlayfulProfileCard profile={readerProfile} />
      </div>
    </div>
  )
}

function TechnicalPage() {
  return (
    <div className="flex flex-col items-start">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-stone-500">Orbit — Engineer Card</h2>
      <p className="mb-6 max-w-md text-sm text-stone-500">
        Internal infra tool. An incident commander scans this card in seconds to find ownership, load, and
        reliability numbers — not personality.
      </p>
      <TechnicalProfileCard profile={engineerProfile} />
    </div>
  )
}

function PlayfulPage() {
  return (
    <div className="flex flex-col items-start">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-stone-500">Kindred — Reader Card</h2>
      <p className="mb-6 max-w-md text-sm text-stone-500">
        Social reading app. A friend tapping into your profile should feel your enthusiasm before a single stat.
      </p>
      <PlayfulProfileCard profile={readerProfile} />
    </div>
  )
}

function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<ComparePage />} />
        <Route path="/technical" element={<TechnicalPage />} />
        <Route path="/playful" element={<PlayfulPage />} />
      </Routes>
    </Shell>
  )
}

export default App

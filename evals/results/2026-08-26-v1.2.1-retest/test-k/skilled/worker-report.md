# Worker Report — Team page

## What I explored first

Meridian is a Vite + React 19 + TypeScript + Mantine v9 studio project-management
app with two existing pages:

- **Overview** (`src/pages/Overview.tsx`) — stat cards, a recent-activity feed, and
  an at-risk-projects list.
- **Projects** (`src/pages/Projects.tsx`) — a dense table of every project with
  status, progress, lead avatar, and due date.

The design system lives in `src/theme.ts` (no DESIGN.md, per the README): an
indigo `meridian` primary color, Fraunces/Inter type pairing, `md` default
radius, bordered `Card`s, and light-variant `Badge`/`ThemeIcon`. `src/data.ts`
holds all mock data (`projects`, `activity`) typed in `src/types.ts`, consumed
directly by page components — no API layer, no state management, no tests in
the repo.

## What I built

A **Team** page (`src/pages/Team.tsx`) at `/team`, added as a third nav item
(`IconUsers`) alongside Overview and Projects in `src/components/Layout.tsx`.

Rationale: Overview answers "what's happening," Projects answers "what's the
work," and neither answers "who's doing it and are they overloaded" — a core
question for a studio lead running multiple client engagements. It's a
distinct feature, not a variant of an existing page.

The page shows:
- Four top-line `StatCard`s (team size, average utilization, members over
  capacity, members on the bench) — matching Overview's stat-row pattern.
- A card grid (one card per team member) showing avatar/name/role, a
  utilization bar (active projects vs. that person's capacity, color-coded
  teal/yellow/red/slate), and the list of their assigned projects with
  `StatusBadge`.

## Data model changes

- `types.ts`: added a `TeamMember` interface (`id`, `name`, `initials`, `role`,
  `capacity`).
- `data.ts`: added a `team` array. Names/initials match the existing project
  leads (Nadia Osei, Marcus Ito, Priya Chandran, Dev Patel) so the roster is
  consistent with `projects.ts`, plus two additional roles (Visual Designer,
  QA Lead) with no current lead assignments — this makes the "on the bench" /
  utilization stats non-trivial instead of everyone always being at exactly
  their capacity.

Workload numbers (active project count, average progress, utilization %) are
derived at render time from the existing `projects` array by matching
`project.lead.name === member.name`, rather than stored redundantly — keeps
the two datasets from drifting out of sync.

## Reused vs. new

Reused as-is: `StatCard`, `StatusBadge`, `Card`/`Avatar`/`Progress`/`Badge`
theme defaults, the `meridian` avatar color convention, and the
title+dimmed-subtitle page header pattern from Overview/Projects. No new
dependencies were introduced — `@mantine/dates` and `@mantine/notifications`
were already installed but unused, and neither was needed for this feature.

## Verification

- `npx tsc -b` — clean.
- `npx oxlint` — clean.
- `npm run build` — succeeds (build output removed after verification).
- Manually reviewed the rendered component logic; could not take a live
  screenshot in this sandbox because the Claude-in-Chrome browser extension
  wasn't connected in this environment. Verified via type-checking, linting,
  and a successful production build instead.

## Tradeoffs / notes for follow-up

- `capacity` is a static number per member rather than derived from anything
  (e.g. seniority, hours). It's a reasonable placeholder for a seed dataset
  but a real implementation would likely want this configurable.
- The two bench members (Elena Cruz, Tom Reyes) have no projects in
  `data.ts`. They exist purely to make the utilization/bench stats
  meaningful — if the seed data model is extended later, consider giving
  them non-lead project assignments (e.g. a `contributors` field on
  `Project`) rather than only tracking `lead`.

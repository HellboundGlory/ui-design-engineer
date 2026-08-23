# Data Visualization

Chart selection and implementation guidance. Load alongside `dashboard-architecture.md` for anything analytics- or monitoring-related.

## Map the question to the chart, not the chart to the data

Every chart should answer a specific question. Pick the chart type from the question being asked, not from which chart component is easiest to drop in:

| The user is asking... | Reach for... |
|---|---|
| "How is this changing over time?" | Line chart (single or multi-series) |
| "How do these categories compare?" | Bar chart (vertical for few categories, horizontal for many or for long labels) |
| "How is this distributed?" | Histogram, box plot |
| "Is there a relationship between two variables?" | Scatter plot |
| "When/where is activity concentrated?" | Heatmap |
| "What sequence of states did this go through?" | Timeline / Gantt-style chart |
| "How do the parts make up the whole, at one point in time?" | Stacked bar (preferred for more than ~4 segments) or a limited donut/pie (only for 2-4 segments where the whole is meaningful) |
| "What's the current single value relative to a target?" | A number with a threshold indicator, gauge, or progress bar — often not a "chart" at all |

If none of these questions is actually what the user needs answered, the right visualization may be a table or a plain number — see `dashboard-architecture.md`. Charts used decoratively (to make a screen "feel data-rich" without answering a real question) are an anti-pattern, not a feature.

## Series limits (Heuristic)

Cap simultaneous color-coded series at around 5. Beyond that, colors become impossible to distinguish and legends become a lookup chore rather than an aid. When there are more categories than that:

- Aggregate the smallest into an "Other" category.
- Split into small multiples (several small charts, one per category/segment) instead of one overloaded chart.
- Let the user filter/toggle series rather than showing all of them simultaneously by default.

## Never fake it

A static SVG wavy line with no underlying data, a sparkline with no real values behind it, or a chart with hardcoded example data left in from scaffolding is a hard anti-pattern (see `anti-patterns-catalog.md`) — it looks like a real feature and isn't one, which is worse than not having a chart at all. Every chart in a finished implementation must be wired to a real (even if currently mocked-for-development) dynamic data source, and every data point should be reachable via tooltip or an accessible data table alternative.

## Choosing a charting library

Don't default to any single library regardless of context — select based on the project's actual needs:

- **Reuse whatever the project already has.** If a chart library is already a dependency, use it; introducing a second charting engine for a new chart is the same kind of drift problem as a second primitive engine (see `component-selection.md`).
- **Recharts** — a solid default for a new React/Tailwind project needing standard business charts (line, bar, area, pie) with reasonable customization and accessibility support without much setup cost.
- **Visx** — when a chart needs bespoke, highly custom visual treatment beyond what a declarative charting library's API comfortably supports (D3 primitives with React composability).
- **Observable Plot** — strong for exploratory/analytical visualizations and grammar-of-graphics style composition, particularly outside a heavy component-framework context.
- **ECharts** — worth considering for very large datasets, dense enterprise analytics, or when built-in interactions (zoom, brush, complex tooltips) are needed out of the box.
- **TanStack Table** (not a charting library, but frequently the *correct* choice) — when the real answer to "visualize this data" is a well-built sortable/filterable table, not a chart at all.

Weigh existing project stack first, then complexity of interaction needed, then bundle size and performance for the data volume involved. Never introduce a heavy charting engine for a single simple line chart when the project's existing lightweight option (or even a plain CSS/SVG sparkline wired to real data) would do.

## Accessible data visualization

Charts are one of the easiest places to accidentally fail accessibility:

- Never rely on color alone to distinguish series — pair color with pattern, line style, direct labeling, or a legend with text labels.
- Ensure legend text and axis labels meet the same contrast requirements as body text (`accessibility-wcag.md`).
- Provide a non-visual path to the same data: a tooltip reachable via keyboard focus (not just hover), or an adjacent/toggleable data table.
- Verify chosen chart colors are colorblind-safe where the chart's meaning depends on distinguishing series — don't assume a "nice looking" palette is safe without checking.

## Formatting details that read as craft

- Use tabular/monospace numerals in tooltips, axis labels, and any adjacent numeric display (see `design-system-tokens.md`).
- Format large numbers for their audience (1.2K / 1.2M for glanceable dashboards; full precision where exactness matters, e.g., financial figures).
- Keep tooltips concise and consistently formatted across every chart in the product — a tooltip style that varies chart-to-chart is a small but visible form of visual drift.
- Match chart colors to the project's semantic tokens where the data has semantic meaning (error-colored line for an error-rate chart), and to a considered categorical palette otherwise — not to whatever default color array the charting library ships with.

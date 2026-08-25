import { EndpointTable } from './components/EndpointTable'
import { ErrorRateChart } from './components/ErrorRateChart'
import { KpiCard } from './components/KpiCard'
import { LatencyChart } from './components/LatencyChart'
import { ThroughputChart } from './components/ThroughputChart'
import { useTrafficFeed } from './hooks/useTrafficFeed'

const INTERVAL_OPTIONS = [
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
  { label: '5s', value: 5000 },
]

function App() {
  const { history, endpoints, isLive, toggleLive, intervalMs, setIntervalMs } = useTrafficFeed(2000)

  const latest = history[history.length - 1]
  const previous = history.length > 1 ? history[history.length - 2] : null

  const totalRequests = Math.round(endpoints.reduce((sum, e) => sum + e.rps, 0))

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__title-row">
          <div className="app-header__brand">
            <span className="app-header__logo" aria-hidden="true" />
            <h1>API Traffic Dashboard</h1>
          </div>
          <div className="app-header__controls">
            <span className="live-indicator" role="status" aria-live="polite">
              <span className={`live-indicator__dot ${isLive ? 'is-live' : 'is-paused'}`} aria-hidden="true" />
              {isLive ? 'Live' : 'Paused'}
            </span>
            <label className="interval-select">
              <span className="interval-select__label">Refresh</span>
              <select
                value={intervalMs}
                onChange={(e) => setIntervalMs(Number(e.target.value))}
                aria-label="Refresh interval"
              >
                {INTERVAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="pause-btn" onClick={toggleLive} aria-pressed={!isLive}>
              {isLive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
        <p className="app-header__subtitle">Simulated real-time traffic across {endpoints.length} endpoints</p>
      </header>

      <main className="app-main">
        <section className="kpi-row" aria-label="Key metrics">
          <KpiCard
            label="Total Throughput"
            value={totalRequests.toLocaleString()}
            unit=" req/s"
            delta={previous ? latest.throughputRps - previous.throughputRps : null}
          />
          <KpiCard
            label="Error Rate"
            value={latest ? latest.errorRatePct.toFixed(2) : '0.00'}
            unit="%"
            delta={previous ? latest.errorRatePct - previous.errorRatePct : null}
            increaseIsBad
          />
          <KpiCard
            label="Latency p50"
            value={latest ? String(latest.p50) : '0'}
            unit="ms"
            delta={previous ? latest.p50 - previous.p50 : null}
            increaseIsBad
          />
          <KpiCard
            label="Latency p99"
            value={latest ? String(latest.p99) : '0'}
            unit="ms"
            delta={previous ? latest.p99 - previous.p99 : null}
            increaseIsBad
            hint="tail latency"
          />
        </section>

        <section className="chart-grid" aria-label="Traffic trends">
          <ThroughputChart data={history} />
          <ErrorRateChart data={history} />
        </section>

        <LatencyChart data={history} />

        <EndpointTable endpoints={endpoints} />
      </main>

      <footer className="app-footer">
        <p>
          Data shown is a simulated traffic feed generated in-browser for demo purposes — there is no backend API
          behind this dashboard.
        </p>
      </footer>
    </div>
  )
}

export default App

import { useEffect, useRef, useState } from 'react'
import {
  aggregateSample,
  createInitialEndpoints,
  stepEndpoints,
  TRAFFIC_HISTORY_WINDOW,
  type EndpointState,
  type TrafficSample,
} from '../data/traffic'

export interface TrafficFeed {
  history: TrafficSample[]
  endpoints: EndpointState[]
  isLive: boolean
  toggleLive: () => void
  intervalMs: number
  setIntervalMs: (ms: number) => void
}

/**
 * Drives the simulated real-time feed. Ticks on an interval, advancing every
 * endpoint's simulated metrics and appending a new aggregated sample to a
 * rolling history window used by the charts.
 */
export function useTrafficFeed(initialIntervalMs = 2000): TrafficFeed {
  const [endpoints, setEndpoints] = useState<EndpointState[]>(() => createInitialEndpoints())
  const [history, setHistory] = useState<TrafficSample[]>(() => [
    aggregateSample(createInitialEndpoints(), Date.now()),
  ])
  const [isLive, setIsLive] = useState(true)
  const [intervalMs, setIntervalMs] = useState(initialIntervalMs)
  const endpointsRef = useRef(endpoints)
  endpointsRef.current = endpoints

  useEffect(() => {
    if (!isLive) return

    const id = window.setInterval(() => {
      setEndpoints((prev) => {
        const next = stepEndpoints(prev)
        const sample = aggregateSample(next, Date.now())
        setHistory((prevHistory) => {
          const nextHistory = [...prevHistory, sample]
          if (nextHistory.length > TRAFFIC_HISTORY_WINDOW) {
            return nextHistory.slice(nextHistory.length - TRAFFIC_HISTORY_WINDOW)
          }
          return nextHistory
        })
        return next
      })
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [isLive, intervalMs])

  return {
    history,
    endpoints,
    isLive,
    toggleLive: () => setIsLive((v) => !v),
    intervalMs,
    setIntervalMs,
  }
}

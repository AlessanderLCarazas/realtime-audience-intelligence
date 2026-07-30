import { useEffect, useRef, useState, useCallback } from "react"
import { WS_URL } from "../config/api"

const MAX_HISTORY = 60

export function useMetricsSocket() {
  const [latestMetrics, setLatestMetrics] = useState(null)
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState(null)
  const [connected, setConnected] = useState(false)
  const [cumulativePurchases, setCumulativePurchases] = useState({})
  const [cumulativeRegions, setCumulativeRegions] = useState({})
  const wsRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let reconnectTimeout = null

    function connect() {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        if (!cancelled) setConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data)

          if (parsed.type === "status_report") {
            setStatus(parsed)
            return
          }

          setLatestMetrics(parsed)

          setHistory((prev) => {
            const next = [...prev, parsed]
            if (next.length > MAX_HISTORY) {
              return next.slice(next.length - MAX_HISTORY)
            }
            return next
          })

          setCumulativePurchases((prev) => {
            const next = { ...prev }
            const items = parsed.productos_mas_comprados || []
            items.forEach((item) => {
              next[item.producto] = (next[item.producto] || 0) + item.compras
            })
            return next
          })

          setCumulativeRegions((prev) => {
            const next = { ...prev }
            const entries = Object.entries(parsed.compras_por_region || {})
            entries.forEach(([region, count]) => {
              next[region] = (next[region] || 0) + count
            })
            return next
          })
        } catch (e) {
          console.log("mensaje invalido recibido del websocket")
        }
      }

      ws.onclose = () => {
        if (!cancelled) {
          setConnected(false)
          reconnectTimeout = setTimeout(connect, 2000)
        }
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      cancelled = true
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  const sendCommand = useCallback((command) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(command))
    } else {
      console.log("no se pudo enviar comando, websocket no conectado")
    }
  }, [])

  const resetCumulative = useCallback(() => {
    setCumulativePurchases({})
    setCumulativeRegions({})
    setHistory([])
  }, [])

  return {
    latestMetrics,
    history,
    status,
    connected,
    sendCommand,
    cumulativePurchases,
    cumulativeRegions,
    resetCumulative
  }
}

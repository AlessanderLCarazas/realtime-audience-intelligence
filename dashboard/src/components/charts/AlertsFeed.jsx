import { useState, useEffect } from "react"

function AlertsFeed({ latestMetrics }) {
  const [alertsHistory, setAlertsHistory] = useState([])

  useEffect(() => {
    if (latestMetrics && Array.isArray(latestMetrics.alertas) && latestMetrics.alertas.length > 0) {
      const now = new Date().toLocaleTimeString()
      const newEntries = latestMetrics.alertas.map((msg, idx) => ({
        id: `${Date.now()}-${idx}-${Math.random()}`,
        time: now,
        message: typeof msg === "string" ? msg : JSON.stringify(msg)
      }))

      setAlertsHistory((prev) => {
        // Evita duplicar exactamente la misma alerta en el mismo segundo
        const filtered = newEntries.filter(
          (ne) => !prev.length || prev[0].message !== ne.message || prev[0].time !== ne.time
        )
        return [...filtered, ...prev].slice(0, 50) // Mantiene las últimas 50 alertas
      })
    }
  }, [latestMetrics])

  return (
    <div className="chart-card wide">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3>historial de alertas ({alertsHistory.length})</h3>
        {alertsHistory.length > 0 && (
          <button
            onClick={() => setAlertsHistory([])}
            style={{
              background: "transparent",
              border: "1px solid #2a2f3a",
              color: "#8a93a6",
              borderRadius: "4px",
              padding: "2px 8px",
              fontSize: "11px",
              cursor: "pointer"
            }}
          >
            limpiar
          </button>
        )}
      </div>

      {alertsHistory.length === 0 ? (
        <p className="waiting-message" style={{ margin: "16px 0" }}>sin alertas registradas en esta sesión</p>
      ) : (
        <div style={{ maxHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
          {alertsHistory.map((a) => (
            <div
              key={a.id}
              style={{
                padding: "6px 10px",
                background: "rgba(245, 101, 101, 0.12)",
                borderLeft: "3px solid #f56565",
                borderRadius: "4px",
                fontSize: "12px",
                display: "flex",
                gap: "10px",
                alignItems: "center"
              }}
            >
              <span style={{ color: "#8a93a6", fontSize: "11px", fontFamily: "monospace" }}>[{a.time}]</span>
              <span style={{ color: "#f56565", fontWeight: "500" }}>{a.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AlertsFeed

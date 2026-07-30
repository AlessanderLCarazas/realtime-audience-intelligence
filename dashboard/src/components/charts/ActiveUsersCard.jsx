import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

function ActiveUsersCard({ latestMetrics, history, status }) {
  const activeNow = status?.active_agents ?? latestMetrics?.usuarios_activos ?? 0
  const totalSpawned = status?.total_agents_spawned ?? 0
  const uniqueInWindow = latestMetrics?.usuarios_activos ?? 0

  // Preparar historial con etiquetas de tiempo y números legibles
  const chartData = (history || []).slice(-15).map((item, index) => {
    let timeLabel = `T-${15 - index}s`
    if (item.timestamp) {
      const date = new Date(item.timestamp)
      if (!isNaN(date.getTime())) {
        timeLabel = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      }
    }

    return {
      time: timeLabel,
      activos: item.usuarios_activos || item.active_agents || 0
    }
  })

  return (
    <div className="chart-card">
      <h3 style={{ color: "#ffffff", fontWeight: "600" }}>USUARIOS Y AGENTES</h3>

      {/* Números principales */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "10px" }}>
        <div>
          <div className="big-number" style={{ color: "#4f7cff", fontSize: "38px", lineHeight: "1" }}>
            {activeNow}
          </div>
          <div className="summary-label" style={{ marginTop: "4px" }}>ACTIVOS AHORA</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#ffffff", fontSize: "28px", fontWeight: "bold" }}>
            {totalSpawned}
          </div>
          <div className="summary-label" style={{ marginTop: "2px" }}>TOTAL GENERADOS</div>
        </div>
      </div>

      <p className="chart-caption" style={{ marginTop: "8px", marginBottom: "8px" }}>
        únicos en la última ventana (0.5s): <strong style={{ color: "#ffffff" }}>{uniqueInWindow}</strong>
      </p>

      {/* Gráfico de Área con Eje Y (números), Eje X (tiempo) y Grilla */}
      <div style={{ height: "135px", marginTop: "10px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="activeUsersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f7cff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#4f7cff" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" vertical={false} />
            <XAxis dataKey="time" stroke="#8a93a6" fontSize={10} tickLine={false} />
            <YAxis stroke="#8a93a6" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "#1a1d24", border: "1px solid #2a2f3a", borderRadius: "6px" }}
              itemStyle={{ color: "#4f7cff", fontSize: "12px" }}
              labelStyle={{ color: "#8a93a6", fontSize: "11px" }}
            />
            <Area
              type="monotone"
              dataKey="activos"
              stroke="#4f7cff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#activeUsersGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ActiveUsersCard

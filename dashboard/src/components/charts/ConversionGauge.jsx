import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip } from "recharts"

function ConversionGauge({ latestMetrics }) {
  const logins = latestMetrics?.logins || 0
  const purchases = latestMetrics?.purchases || 0
  const abandons = latestMetrics?.abandons || 0

  let rate = 0
  if (latestMetrics && typeof latestMetrics.tasa_conversion === "number" && !isNaN(latestMetrics.tasa_conversion)) {
    rate = latestMetrics.tasa_conversion
  } else if (logins > 0) {
    rate = (purchases / logins) * 100
  }

  const abandonRate = logins > 0 ? ((abandons / logins) * 100).toFixed(1) : "0.0"

  // Datos para el Medidor Circular (RadialBarChart)
  const radialData = [
    { name: "Logins", count: logins, fill: "#4f7cff" },
    { name: "Abandonos", count: abandons, fill: "#f56565" },
    { name: "Compras", count: purchases, fill: "#48bb78" }
  ]

  return (
    <div className="chart-card">
      <h3>conversión de compras</h3>

      {/* KPI Principal */}
      <div style={{ textAlign: "center", marginTop: "4px" }}>
        <div className="big-number" style={{ color: "#48bb78", fontSize: "36px", lineHeight: "1" }}>
          {rate.toFixed(1)}%
        </div>
        <p className="chart-caption" style={{ marginTop: "4px" }}>
          compras / logins en la última ventana (0.5s)
        </p>
      </div>

      {/* Gráfico Medidor Circular (Tacómetro / Arcos) */}
      <div style={{ height: "160px", marginTop: "4px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="25%"
            outerRadius="95%"
            barSize={12}
            data={radialData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              minAngle={15}
              background={{ fill: "#1a1d24" }}
              clockWise
              dataKey="count"
              cornerRadius={6}
              isAnimationActive={false}
            />
            <Tooltip
              contentStyle={{ background: "#1a1d24", border: "1px solid #2a2f3a", borderRadius: "6px" }}
              itemStyle={{ color: "#fff", fontSize: "11px" }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Cajas numéricas de soporte */}
      <div style={{ display: "flex", justifyContent: "space-around", margin: "8px 0", padding: "8px 0", background: "#12151c", borderRadius: "6px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#4f7cff", fontWeight: "bold", fontSize: "18px" }}>{logins}</div>
          <div className="summary-label">logins</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#48bb78", fontWeight: "bold", fontSize: "18px" }}>{purchases}</div>
          <div className="summary-label">compras</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#f56565", fontWeight: "bold", fontSize: "18px" }}>{abandons}</div>
          <div className="summary-label">abandonos</div>
        </div>
      </div>

      {/* Tabla detallada inferior */}
      <table className="simple-table" style={{ marginTop: "8px" }}>
        <thead>
          <tr>
            <th>métrica de flujo</th>
            <th style={{ textAlign: "right" }}>valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>tasa de abandono</td>
            <td style={{ textAlign: "right", color: parseFloat(abandonRate) > 50 ? "#f56565" : "#8a93a6", fontWeight: "bold" }}>
              {abandonRate}%
            </td>
          </tr>
          <tr>
            <td>eficiencia de sesión</td>
            <td style={{ textAlign: "right", color: rate > 15 ? "#48bb78" : "#8a93a6" }}>
              {logins > 0 ? `${((purchases / logins) * 100).toFixed(0)}% éxito` : "0%"}
            </td>
          </tr>
          <tr>
            <td>perfiles activos</td>
            <td style={{ textAlign: "right", color: "#4f7cff" }}>
              {latestMetrics?.audiencias_por_perfil ? Object.keys(latestMetrics.audiencias_por_perfil).length : 0}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default ConversionGauge

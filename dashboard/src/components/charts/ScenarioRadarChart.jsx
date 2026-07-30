import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from "recharts"

function ScenarioRadarChart({ latestMetrics, status }) {
  const logins = latestMetrics?.logins || 0
  const purchases = latestMetrics?.purchases || 0
  const abandons = latestMetrics?.abandons || 0
  const conversionRate = logins > 0 ? (purchases / logins) * 100 : 0
  const abandonRate = logins > 0 ? (abandons / logins) * 100 : 0
  const profilesCount = latestMetrics?.audiencias_por_perfil ? Object.keys(latestMetrics.audiencias_por_perfil).length : 0
  const eventsPerSec = latestMetrics?.eventos_por_segundo || 0

  // Datos normalizados (0-100) para comparación multidimensional
  const data = [
    { metric: "Conversión (%)", actual: Math.min(100, Math.round(conversionRate * 2.5)), baseline: 30 },
    { metric: "Tasa Abandono", actual: Math.min(100, Math.round(abandonRate)), baseline: 40 },
    { metric: "Throughput (Evt/s)", actual: Math.min(100, Math.round(eventsPerSec * 4)), baseline: 25 },
    { metric: "Variedad Perfiles", actual: Math.min(100, profilesCount * 12.5), baseline: 50 },
    { metric: "Volumen Compras", actual: Math.min(100, purchases * 10), baseline: 20 },
  ]

  const currentScenario = status?.scenario ? status.scenario.toUpperCase() : "DÍA NORMAL"

  return (
    <div className="chart-card wide">
      <h3>perfil analítico de escenario ({currentScenario})</h3>
      <p className="chart-caption">
        matriz multidimensional: comportamiento detectado en tiempo real vs. baseline de referencia
      </p>

      <div style={{ height: "250px", marginTop: "8px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#2a2f3a" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "#8a93a6", fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2a2f3a" tick={false} />
            <Radar
              name={`ESCENARIO: ${currentScenario}`}
              dataKey="actual"
              stroke="#4f7cff"
              fill="#4f7cff"
              fillOpacity={0.5}
              isAnimationActive={false}
            />
            <Radar
              name="BASELINE REFERENCIAL"
              dataKey="baseline"
              stroke="#48bb78"
              fill="#48bb78"
              fillOpacity={0.15}
              isAnimationActive={false}
            />
            <Tooltip contentStyle={{ background: "#1a1d24", border: "1px solid #2a2f3a", borderRadius: "6px" }} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ScenarioRadarChart

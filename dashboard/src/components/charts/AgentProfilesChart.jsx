import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"

const BAR_COLORS = ["#4f7cff", "#36b37e", "#ffab00", "#ff5630", "#6554c0", "#00b8d9", "#48bb78"]

function AgentProfilesChart({ latestMetrics, status }) {
  // Intentar obtener perfiles de Flink o en su defecto de los agentes activos en el status
  let rawProfiles = latestMetrics?.agentes_por_perfil || latestMetrics?.audiencias_detectadas || latestMetrics?.perfiles || {}

  if (Object.keys(rawProfiles).length === 0 && status?.agents && Array.isArray(status.agents)) {
    rawProfiles = status.agents.reduce((acc, agent) => {
      const p = agent.profile || agent.agent_profile || "indefinido"
      acc[p] = (acc[p] || 0) + 1
      return acc
    }, {})
  }

  const profileData = Object.entries(rawProfiles)
    .map(([key, value]) => ({
      perfil: key.replace("_", " "),
      cantidad: Number(value) || 0
    }))
    .filter(item => item.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)

  return (
    <div className="chart-card">
      <h3 style={{ color: "#ffffff", fontWeight: "600" }}>TIPOS DE CLIENTES (PERFILES DE AGENTES)</h3>
      <p className="chart-caption">distribución de agentes activos por perfil simulado</p>

      <div style={{ height: "180px", marginTop: "10px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={profileData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" vertical={false} />
            <XAxis dataKey="perfil" stroke="#8a93a6" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
            <YAxis stroke="#8a93a6" tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#1a1d24", border: "1px solid #2a2f3a", borderRadius: "6px" }} />
            <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
              {profileData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="simple-table" style={{ marginTop: "10px" }}>
        <thead>
          <tr><th>perfil de cliente</th><th style={{ textAlign: "right" }}>agentes activos</th></tr>
        </thead>
        <tbody>
          {profileData.map((item, i) => (
            <tr key={i}>
              <td>{item.perfil}</td>
              <td style={{ textAlign: "right", fontWeight: "bold", color: "#4f7cff" }}>{item.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AgentProfilesChart

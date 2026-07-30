import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"

const AUDIENCE_TRANSLATION = {
  cliente_estacional: "Alta Intención de Compra",
  cliente_indeciso: "Riesgo de Abandono",
  comparador: "Interesados en Tecnología",
  usuario_explorador: "Potenciales p/ Campañas",
  comprador_nocturno: "Usuarios que Abandonan Carrito",
  cliente_frecuente: "Clientes Frecuentes",
  cliente_premium: "Clientes Premium"
}

const BAR_COLORS = ["#36b37e", "#ff5630", "#4f7cff", "#ffab00", "#6554c0", "#00b8d9", "#48bb78"]

function DigitalAudiencesChart({ latestMetrics, status }) {
  let rawAudiences = latestMetrics?.audiencias_detectadas || latestMetrics?.agentes_por_perfil || latestMetrics?.perfiles || {}

  if (Object.keys(rawAudiences).length === 0 && status?.agents && Array.isArray(status.agents)) {
    rawAudiences = status.agents.reduce((acc, agent) => {
      const p = agent.profile || agent.agent_profile || "indefinido"
      acc[p] = (acc[p] || 0) + 1
      return acc
    }, {})
  }

  const audienceData = Object.entries(rawAudiences)
    .map(([key, value]) => ({
      audiencia: AUDIENCE_TRANSLATION[key] || key.replace("_", " "),
      cantidad: Number(value) || 0
    }))
    .filter(item => item.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)

  return (
    <div className="chart-card">
      <h3 style={{ color: "#ffffff", fontWeight: "600" }}>AUDIENCIAS DIGITALES DETECTADAS</h3>
      <p className="chart-caption">segmentación por comportamiento observada en tiempo real</p>

      <div style={{ height: "180px", marginTop: "10px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={audienceData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" vertical={false} />
            <XAxis dataKey="audiencia" stroke="#8a93a6" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
            <YAxis stroke="#8a93a6" tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#1a1d24", border: "1px solid #2a2f3a", borderRadius: "6px" }} />
            <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
              {audienceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <table className="simple-table" style={{ marginTop: "10px" }}>
        <thead>
          <tr><th>audiencia digital</th><th style={{ textAlign: "right" }}>usuarios detectados</th></tr>
        </thead>
        <tbody>
          {audienceData.map((item, i) => (
            <tr key={i}>
              <td>{item.audiencia}</td>
              <td style={{ textAlign: "right", fontWeight: "bold", color: "#36b37e" }}>{item.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DigitalAudiencesChart

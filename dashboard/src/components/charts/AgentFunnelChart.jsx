import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"

function AgentFunnelChart({ latestMetrics }) {
  const logins = latestMetrics?.logins || 0
  const views = latestMetrics?.productos_mas_vistos ? latestMetrics.productos_mas_vistos.reduce((acc, p) => acc + p.vistas, 0) : 0
  const abandons = latestMetrics?.abandons || 0
  const purchases = latestMetrics?.purchases || 0
  const carts = abandons + purchases

  // Cálculo de tasas de conversión entre etapas
  const cartToBuyRate = carts > 0 ? ((purchases / carts) * 100).toFixed(1) : "0.0"
  const overallConversion = logins > 0 ? ((purchases / logins) * 100).toFixed(1) : "0.0"
  const totalDropOff = logins > 0 ? (((logins - purchases) / logins) * 100).toFixed(1) : "0.0"

  const funnelData = [
    { step: "1. Logins", count: logins, color: "#4f7cff" },
    { step: "2. Vistas", count: views, color: "#36b37e" },
    { step: "3. Carrito", count: carts, color: "#ffab00" },
    { step: "4. Compras", count: purchases, color: "#48bb78" }
  ]

  return (
    <div className="chart-card">
      <h3>embudo de conversión (funnel)</h3>
      <p className="chart-caption">flujo paso a paso en la última ventana (0.5s)</p>
      
      {/* Gráfico de Barras */}
      <div style={{ height: "170px", marginTop: "4px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelData} layout="vertical" margin={{ left: 5, right: 20, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
            <XAxis type="number" stroke="#8a93a6" allowDecimals={false} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="step" stroke="#8a93a6" tick={{ fontSize: 11 }} width={75} />
            <Tooltip contentStyle={{ background: "#1a1d24", border: "1px solid #2a2f3a", borderRadius: "6px" }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SECCIÓN ADICIONAL: Métricas y Fuga de Usuarios */}
      <div style={{ marginTop: "12px", borderTop: "1px solid #2a2f3a", paddingTop: "10px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
          <div style={{ background: "#1a1d24", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
            <div style={{ color: "#48bb78", fontSize: "16px", fontWeight: "bold" }}>{cartToBuyRate}%</div>
            <div className="summary-label" style={{ fontSize: "10px" }}>éxito carrito → compra</div>
          </div>
          <div style={{ background: "#1a1d24", padding: "8px", borderRadius: "6px", textAlign: "center" }}>
            <div style={{ color: "#f56565", fontSize: "16px", fontWeight: "bold" }}>{totalDropOff}%</div>
            <div className="summary-label" style={{ fontSize: "10px" }}>fuga total de usuarios</div>
          </div>
        </div>

        <table className="simple-table" style={{ fontSize: "11px" }}>
          <thead>
            <tr>
              <th>etapa</th>
              <th style={{ textAlign: "right" }}>eventos</th>
              <th style={{ textAlign: "right" }}>retención</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span style={{ color: "#4f7cff" }}>●</span> Sesiones (Logins)</td>
              <td style={{ textAlign: "right" }}>{logins}</td>
              <td style={{ textAlign: "right", color: "#8a93a6" }}>100%</td>
            </tr>
            <tr>
              <td><span style={{ color: "#ffab00" }}>●</span> Intención (Carrito)</td>
              <td style={{ textAlign: "right" }}>{carts}</td>
              <td style={{ textAlign: "right", color: "#ffab00" }}>
                {logins > 0 ? ((carts / logins) * 100).toFixed(0) : 0}%
              </td>
            </tr>
            <tr>
              <td><span style={{ color: "#48bb78" }}>●</span> Conversión Final</td>
              <td style={{ textAlign: "right", fontWeight: "bold", color: "#48bb78" }}>{purchases}</td>
              <td style={{ textAlign: "right", fontWeight: "bold", color: "#48bb78" }}>
                {overallConversion}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AgentFunnelChart

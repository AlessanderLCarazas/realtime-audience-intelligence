function LostRevenueCard({ latestMetrics }) {
  const abandons = latestMetrics?.abandons || 0
  const purchases = latestMetrics?.purchases || 0
  
  // Estimación promedio de ticket por producto (~S/ 185)
  const estimatedLoss = abandons * 185
  const estimatedRevenue = purchases * 240

  return (
    <div className="chart-card">
      <h3>impacto financiero en tiempo real</h3>
      <p className="chart-caption">valorización estimada en la ventana activa</p>
      
      <div style={{ display: "flex", justifyContent: "space-around", margin: "14px 0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#f56565", fontSize: "22px", fontWeight: "bold" }}>
            S/ {estimatedLoss.toLocaleString()}
          </div>
          <div className="summary-label">en riesgo (abandonos)</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#48bb78", fontSize: "22px", fontWeight: "bold" }}>
            S/ {estimatedRevenue.toLocaleString()}
          </div>
          <div className="summary-label">convertido (compras)</div>
        </div>
      </div>

      <table className="simple-table" style={{ marginTop: "10px" }}>
        <thead>
          <tr><th>indicador monetario</th><th style={{ textAlign: "right" }}>estimación</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>pérdida x seg. aprox.</td>
            <td style={{ textAlign: "right", color: "#f56565", fontWeight: "bold" }}>
              S/ {(estimatedLoss * 2).toLocaleString()}/s
            </td>
          </tr>
          <tr>
            <td>retención de valor</td>
            <td style={{ textAlign: "right", color: purchases >= abandons ? "#48bb78" : "#f56565" }}>
              {abandons + purchases > 0 ? ((purchases / (purchases + abandons)) * 100).toFixed(1) : 0}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default LostRevenueCard

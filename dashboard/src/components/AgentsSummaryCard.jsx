function AgentsSummaryCard({ status }) {
  const totalGenerados = status ? status.total_agents_spawned : 0
  const activos = status ? status.active_agents : 0

  return (
    <div className="chart-card">
      <h3>agentes de la sesion</h3>
      <div className="summary-row">
        <div className="summary-block">
          <div className="summary-number">{totalGenerados}</div>
          <div className="summary-label">total generados</div>
        </div>
        <div className="summary-block">
          <div className="summary-number">{activos}</div>
          <div className="summary-label">activos ahora</div>
        </div>
      </div>
    </div>
  )
}

export default AgentsSummaryCard

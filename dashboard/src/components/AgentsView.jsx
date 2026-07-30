function AgentsView({ status }) {
  const agents = status && status.agents ? status.agents : []
  const totalGenerados = status ? status.total_agents_spawned || 0 : 0
  const activos = status ? status.active_agents || 0 : 0
  const activeAgentsCount = agents.length

  return (
    <div className="agents-view">
      <div className="agents-summary-header">
        <div className="summary-block">
          <div className="summary-number">{totalGenerados}</div>
          <div className="summary-label">total generados (sesion)</div>
        </div>
        <div className="summary-block">
          <div className="summary-number">{activos}</div>
          <div className="summary-label">activos ahora</div>
        </div>
      </div>

      <h2 style={{ color: "#ffffff", fontWeight: "700", fontSize: "18px", textShadow: "0 0 10px rgba(255,255,255,0.2)", margin: "16px 0 12px 0" }}>
        agentes activos ahora ({activeAgentsCount} mostrados)
      </h2>

      {agents.length === 0 ? (
        <p className="waiting-message">sin agentes activos en este momento</p>
      ) : (
        <div className="agents-grid">
          {agents.map((a) => (
            <div key={a.agent_id} className="agent-card">
              <div className="agent-profile">{a.profile}</div>
              <pre className="agent-json">{JSON.stringify(a, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AgentsView

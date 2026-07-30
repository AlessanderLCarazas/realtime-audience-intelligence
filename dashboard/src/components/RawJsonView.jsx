function RawJsonView({ latestMetrics, history }) {
  return (
    <div className="raw-json-view">
      <h2>vista de debug - json crudo</h2>
      <h3>ultimo mensaje</h3>
      <pre>{JSON.stringify(latestMetrics, null, 2)}</pre>
      <h3>historico ({history.length} mensajes)</h3>
      <pre>{JSON.stringify(history, null, 2)}</pre>
    </div>
  )
}

export default RawJsonView

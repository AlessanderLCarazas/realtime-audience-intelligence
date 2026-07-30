import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

function EventsPerSecondChart({ history }) {
  const data = history.map((m, i) => ({ i, eps: m.eventos_por_segundo }))

  return (
    <div className="chart-card">
      <h3>eventos por segundo</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
          <XAxis dataKey="i" hide />
          <YAxis stroke="#8a93a6" />
          <Tooltip />
          <Line type="monotone" dataKey="eps" stroke="#4fd1c5" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EventsPerSecondChart

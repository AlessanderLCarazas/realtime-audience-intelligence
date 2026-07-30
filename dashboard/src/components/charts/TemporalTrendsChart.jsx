import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

function TemporalTrendsChart({ history }) {
  const data = history.map((m, i) => ({
    i,
    logins: m.logins,
    purchases: m.purchases,
    abandons: m.abandons
  }))

  const totals = history.reduce(
    (acc, m) => {
      acc.logins += m.logins
      acc.purchases += m.purchases
      acc.abandons += m.abandons
      return acc
    },
    { logins: 0, purchases: 0, abandons: 0 }
  )

  return (
    <div className="chart-card wide">
      <h3>tendencias temporales</h3>
      <p className="chart-caption">ultimas {history.length} ventanas capturadas</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
          <XAxis dataKey="i" hide />
          <YAxis stroke="#8a93a6" allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Line type="monotone" dataKey="logins" stroke="#4f7cff" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="purchases" stroke="#48bb78" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="abandons" stroke="#f56565" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <table className="simple-table">
        <thead>
          <tr><th>metrica</th><th>total en el rango mostrado</th></tr>
        </thead>
        <tbody>
          <tr><td>logins</td><td>{totals.logins}</td></tr>
          <tr><td>compras</td><td>{totals.purchases}</td></tr>
          <tr><td>abandonos</td><td>{totals.abandons}</td></tr>
        </tbody>
      </table>
    </div>
  )
}

export default TemporalTrendsChart

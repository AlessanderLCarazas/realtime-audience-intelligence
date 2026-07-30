import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

function AudienceChart({ latestMetrics }) {
  const raw = latestMetrics ? latestMetrics.audiencias_por_perfil : {}
  const data = Object.entries(raw)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="chart-card wide">
      <h3>audiencias detectadas</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
          <XAxis dataKey="name" stroke="#8a93a6" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={70} />
          <YAxis stroke="#8a93a6" allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#4f7cff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <table className="simple-table">
        <thead>
          <tr><th>perfil</th><th>cantidad</th></tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AudienceChart

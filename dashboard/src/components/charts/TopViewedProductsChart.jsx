import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

function TopViewedProductsChart({ latestMetrics }) {
  const data = latestMetrics ? latestMetrics.productos_mas_vistos : []

  return (
    <div className="chart-card">
      <h3>productos mas visitados</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
          <XAxis type="number" stroke="#8a93a6" allowDecimals={false} />
          <YAxis type="category" dataKey="producto" stroke="#8a93a6" tick={{ fontSize: 10 }} width={110} />
          <Tooltip />
          <Bar dataKey="vistas" fill="#4fd1c5" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <table className="simple-table">
        <thead>
          <tr><th>producto</th><th>vistas</th></tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.producto}>
              <td>{row.producto}</td>
              <td>{row.vistas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TopViewedProductsChart

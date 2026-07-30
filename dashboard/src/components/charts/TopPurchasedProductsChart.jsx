import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

function TopPurchasedProductsChart({ cumulativePurchases }) {
  const data = Object.entries(cumulativePurchases || {})
    .map(([producto, compras]) => ({ producto, compras }))
    .sort((a, b) => b.compras - a.compras)
    .slice(0, 10)

  return (
    <div className="chart-card">
      <h3>productos mas comprados</h3>
      <p className="chart-caption">acumulado desde el inicio de la sesion</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
          <XAxis type="number" stroke="#8a93a6" allowDecimals={false} />
          <YAxis type="category" dataKey="producto" stroke="#8a93a6" tick={{ fontSize: 10 }} width={110} />
          <Tooltip />
          <Bar dataKey="compras" fill="#f6ad55" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <table className="simple-table">
        <thead>
          <tr><th>producto</th><th>compras</th></tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.producto}>
              <td>{row.producto}</td>
              <td>{row.compras}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TopPurchasedProductsChart


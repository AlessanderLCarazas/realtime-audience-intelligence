import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

const COLOR_MAP = {
  login: "#ffab00",
  view_product: "#00b8d9",
  search: "#6554c0",
  add_to_cart: "#ff5630",
  remove_from_cart: "#ff7452",
  purchase: "#36b37e",
  abandon: "#de350b"
}

const DEFAULT_COLORS = ["#4f7cff", "#ffab00", "#36b37e", "#ff5630", "#6554c0", "#00b8d9", "#ff7452"]

function EventsByTypeChart({ latestMetrics }) {
  // Extraer datos de forma segura
  const rawEvents = latestMetrics?.eventos_por_tipo || latestMetrics?.event_counts || {}

  // Convertir objeto en arreglo compatible con Recharts
  const chartData = Object.entries(rawEvents)
    .map(([name, value]) => ({
      name,
      value: Number(value) || 0
    }))
    .filter((item) => item.value > 0)

  const totalEvents = chartData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="chart-card">
      <h3 style={{ color: "#ffffff", fontWeight: "600" }}>EVENTOS POR TIPO</h3>
      <p className="chart-caption">distribución en la última ventana activa</p>

      {/* Contenedor con altura explícita para evitar colapsos de Recharts */}
      <div style={{ width: "100%", height: "210px", marginTop: "4px" }}>
        {totalEvents === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#8a93a6", fontSize: "12px" }}>
            esperando transmisión de eventos...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={68}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLOR_MAP[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1a1d24", border: "1px solid #2a2f3a", borderRadius: "6px" }}
                itemStyle={{ color: "#fff", fontSize: "12px" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default EventsByTypeChart

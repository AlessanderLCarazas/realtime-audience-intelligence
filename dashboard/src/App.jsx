import { useState } from "react"
import { useMetricsSocket } from "./hooks/useMetricsSocket"
import DashboardView from "./components/DashboardView"
import RawJsonView from "./components/RawJsonView"
import AgentsView from "./components/AgentsView"
import "./App.css"
import ParticlesBackground from "./components/ParticlesBackground"
function App() {
  const [view, setView] = useState("dashboard")
  const { latestMetrics, history, status, connected, sendCommand, cumulativePurchases, cumulativeRegions, resetCumulative } = useMetricsSocket()

  return (
    <div className="app-container" style={{ position: "relative", zIndex: 1 }}>
    <ParticlesBackground />
      <header className="app-header">
        <h1>Dashboard -La Tiendita de Don Pepe</h1>
        <div className="header-right">
          <span className={connected ? "status-dot online" : "status-dot offline"}></span>
          <span className="status-text">{connected ? "conectado" : "desconectado"}</span>
          <button className={view === "dashboard" ? "debug-toggle active" : "debug-toggle"} onClick={() => setView("dashboard")}>
            dashboard
          </button>
          <button className={view === "agentes" ? "debug-toggle active" : "debug-toggle"} onClick={() => setView("agentes")}>
            agentes
          </button>
          <button className={view === "debug" ? "debug-toggle active" : "debug-toggle"} onClick={() => setView("debug")}>
            debug
          </button>
        </div>
      </header>

      {view === "debug" && <RawJsonView latestMetrics={latestMetrics} history={history} />}
      {view === "agentes" && <AgentsView status={status} />}
      {view === "dashboard" && (
 
        <DashboardView
          latestMetrics={latestMetrics}
          history={history}
          status={status}
          sendCommand={sendCommand}
          cumulativePurchases={cumulativePurchases}
          cumulativeRegions={cumulativeRegions}
          resetCumulative={resetCumulative}
        />

      )}
    </div>
  )
}

export default App

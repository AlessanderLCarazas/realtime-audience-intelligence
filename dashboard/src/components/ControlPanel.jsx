import { useState } from "react"
import { Play, Pause, RotateCcw, Sun, Moon } from "lucide-react"

const SCENARIOS = [
  { value: "dia_normal", label: "dia normal" },
  { value: "navidad", label: "navidad" },
  { value: "fiestas_patrias", label: "fiestas patrias" },
  { value: "cyber_monday", label: "cyber monday" }
]

const DURATIONS = [
  { value: 60, label: "1 minuto" },
  { value: 300, label: "5 minutos" },
  { value: 600, label: "10 minutos" },
  { value: null, label: "infinito" }
]

function formatRemaining(seconds) {
  if (seconds === null || seconds === undefined) return "infinito"
  const total = Math.max(0, Math.floor(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0")
}

function ControlPanel({ sendCommand, status, onResetExtra }) {
  const [scenario, setScenario] = useState("dia_normal")
  const [duration, setDuration] = useState(300)
  const [period, setPeriod] = useState("dia")

  const handleScenarioChange = (e) => {
    const value = e.target.value
    setScenario(value)
    sendCommand({ command: "set_scenario", scenario: value })
  }

  const handleDurationChange = (e) => {
    const raw = e.target.value
    const value = raw === "null" ? null : parseInt(raw, 10)
    setDuration(value)
    sendCommand({ command: "set_duration", duration_seconds: value })
  }

  const togglePeriod = () => {
    const next = period === "dia" ? "noche" : "dia"
    setPeriod(next)
    sendCommand({ command: "set_period", period: next })
  }

  const handlePlay = () => sendCommand({ command: "play" })
  const handlePause = () => sendCommand({ command: "pause" })
  const handleReset = () => {
    sendCommand({ command: "reset" })
    if (onResetExtra) onResetExtra()
  }
  return (
    <div className="control-panel">
      <div className="control-group">
        <label>escenario</label>
        <select value={scenario} onChange={handleScenarioChange}>
          {SCENARIOS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>duracion</label>
        <select value={duration === null ? "null" : duration} onChange={handleDurationChange}>
          {DURATIONS.map((d) => (
            <option key={d.label} value={d.value === null ? "null" : d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>periodo</label>
        <button className="period-toggle" onClick={togglePeriod}>
          {period === "dia" ? <Sun size={18} /> : <Moon size={18} />}
          <span>{period}</span>
        </button>
      </div>

      <div className="control-group">
        <label>tiempo restante</label>
        <div className="remaining-time">
          {status ? formatRemaining(status.remaining_seconds) : "--:--"}
        </div>
      </div>

      <div className="control-group">
        <label>estado generador</label>
        <div className="remaining-time small">
          {status ? status.status : "sin datos"}
        </div>
      </div>

      <div className="control-group control-icons">
        <button className="icon-btn play" onClick={handlePlay} title="play">
          <Play size={20} />
        </button>
        <button className="icon-btn pause" onClick={handlePause} title="pause">
          <Pause size={20} />
        </button>
        <button className="icon-btn reset" onClick={handleReset} title="reset">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  )
}

export default ControlPanel

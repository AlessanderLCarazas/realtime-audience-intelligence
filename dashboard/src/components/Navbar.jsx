function Navbar({ view, setView, status }) {
  const isConnected = status && status.connected !== false

  return (
    <header
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        background: "rgba(22, 26, 36, 0.85)",
        backdropFilter: "blur(10px)",
        borderRadius: "8px",
        marginBottom: "16px",
        border: "1px solid rgba(255, 255, 255, 0.08)"
      }}
    >
      {/* Título Principal */}
      <div className="navbar-brand" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h1
          style={{
            color: "#ffffff",
            fontSize: "20px",
            fontWeight: "700",
            margin: 0,
            textShadow: "0 0 12px rgba(255, 255, 255, 0.4)",
            letterSpacing: "0.5px"
          }}
        >
          Tiendita de Don Pepe
        </h1>
        <span style={{ color: "#8a93a6", fontSize: "12px", fontWeight: "400" }}>
          | Dashboard en Tiempo Real
        </span>
      </div>

      {/* Indicador de estado y Botones */}
      <div className="navbar-controls" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: isConnected ? "#48bb78" : "#f56565"
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: isConnected ? "#48bb78" : "#f56565",
              boxShadow: isConnected ? "0 0 8px #48bb78" : "0 0 8px #f56565"
            }}
          />
          {isConnected ? "conectado" : "desconectado"}
        </span>

        <div className="nav-buttons" style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setView("dashboard")}
            style={{
              background: view === "dashboard" ? "#4f7cff" : "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            dashboard
          </button>
          <button
            onClick={() => setView("agents")}
            style={{
              background: view === "agents" ? "#4f7cff" : "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            agentes
          </button>
          <button
            onClick={() => setView("debug")}
            style={{
              background: view === "debug" ? "#4f7cff" : "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "6px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
          >
            debug
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar

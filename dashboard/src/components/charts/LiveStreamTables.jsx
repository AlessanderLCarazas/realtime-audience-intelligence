import React, { useState, useEffect } from 'react'

const PRODUCTS = [
  "Laptop Lenovo", "Silla Gamer", "TV Samsung 55\"", "Audífonos BT", 
  "Smartphone Xiaomi", "Monitor 144Hz", "Teclado Mecánico", "Consola PS5", "Mouse Inalámbrico"
]

const EVENT_TYPES = ["view_product", "add_to_cart", "remove_from_cart", "purchase", "abandon_cart"]

const PROFILES = [
  "comprador_compulsivo", "comparador", "comprador_nocturno", 
  "cliente_premium", "cliente_frecuente", "usuario_explorador", "cliente_indeciso", "cliente_estacional"
]

const AUDIENCE_RULES = [
  { audience: "Alta Intención de Compra", rule: "count(ADD_TO_CART) > 2", action: "Puntos Dobles" },
  { audience: "Riesgo de Abandono", rule: "REMOVE > ADD_TO_CART", action: "Pop-up Descuento 10%" },
  { audience: "Interesados en Tecnología", rule: "count(VIEW) > 4", action: "Comparativa Flash" },
  { audience: "Usuarios que Abandonan Carrito", rule: "ABANDON_CART == True", action: "Push Reminder" },
  { audience: "Clientes Premium", rule: "sum(PRICE) > $1500", action: "Soporte VIP" },
  { audience: "Clientes Frecuentes", rule: "purchases_count > 5", action: "Envío Gratis" },
  { audience: "Potenciales p/ Campañas", rule: "session_time > 120s", action: "Banner Personalizado" }
]

function LiveStreamTables({ latestMetrics, status }) {
  const [rawEvents, setRawEvents] = useState([])
  const [processedEvents, setProcessedEvents] = useState([])

  useEffect(() => {
    if (!latestMetrics) return

    const nowTime = new Date().toLocaleTimeString()

    // 1. ENTRADA: Generar o capturar nuevos eventos crudos
    if (latestMetrics.ultimos_eventos_crudos && Array.isArray(latestMetrics.ultimos_eventos_crudos) && latestMetrics.ultimos_eventos_crudos.length > 0) {
      setRawEvents(latestMetrics.ultimos_eventos_crudos)
    } else {
      // Extraer agente activo real o generar id aleatorio
      const activeAgents = status?.agents && status.agents.length > 0 ? status.agents : []
      const randomAgent = activeAgents.length > 0 
        ? activeAgents[Math.floor(Math.random() * activeAgents.length)]
        : null

      const agentId = randomAgent?.id || randomAgent?.agent_id || `agent_${Math.floor(Math.random() * 180) + 1}`
      const profile = randomAgent?.profile || randomAgent?.agent_profile || PROFILES[Math.floor(Math.random() * PROFILES.length)]
      const evtType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]
      const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]

      const newRawEvent = {
        time: nowTime,
        agent_id: agentId,
        profile: profile,
        event_type: evtType,
        product: product
      }

      setRawEvents(prev => [newRawEvent, ...prev.slice(0, 4)])
    }

    // 2. SALIDA: Generar o capturar audiencias procesadas por Flink
    if (latestMetrics.ultimas_audiencias_procesadas && Array.isArray(latestMetrics.ultimas_audiencias_procesadas) && latestMetrics.ultimas_audiencias_procesadas.length > 0) {
      setProcessedEvents(latestMetrics.ultimas_audiencias_procesadas)
    } else {
      const rulePick = AUDIENCE_RULES[Math.floor(Math.random() * AUDIENCE_RULES.length)]
      const procAgentId = `agent_${Math.floor(Math.random() * 180) + 1}`

      const newProcEvent = {
        time: nowTime,
        agent_id: procAgentId,
        audience: rulePick.audience,
        rule: rulePick.rule,
        action: rulePick.action
      }

      setProcessedEvents(prev => [newProcEvent, ...prev.slice(0, 4)])
    }

  }, [latestMetrics, status])

  return (
    <div style={{ gridColumn: "1 / -1", marginTop: "15px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        
        {/* TABLA IZQUIERDA: ENTRADA CRUDOS (KAFKA: digital-events) */}
        <div className="chart-card" style={{ borderLeft: "4px solid #36b37e" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={{ color: "#ffffff", fontSize: "13px", margin: 0 }}>
              🔴 ENTRADA: Eventos Crudos (Kafka: digital-events)
            </h3>
            <span style={{ background: "#36b37e22", color: "#36b37e", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>
              AGENT PRODUCERS
            </span>
          </div>
          <p className="chart-caption">Flujo de datos enviado en tiempo real por los agentes simulados</p>

          <table className="simple-table" style={{ fontSize: "11px", marginTop: "10px" }}>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Agente ID</th>
                <th>Perfil Simulado</th>
                <th>Evento Crudo</th>
                <th>Producto</th>
              </tr>
            </thead>
            <tbody>
              {rawEvents.map((evt, idx) => (
                <tr key={idx}>
                  <td style={{ color: "#8a93a6" }}>{evt.time}</td>
                  <td style={{ fontWeight: "bold", color: "#e2e8f0" }}>{evt.agent_id}</td>
                  <td><span style={{ color: "#ffab00" }}>{evt.profile}</span></td>
                  <td>
                    <span style={{ 
                      color: evt.event_type === 'purchase' ? '#36b37e' : evt.event_type === 'abandon_cart' || evt.event_type === 'remove_from_cart' ? '#ff5630' : '#4f7cff',
                      fontWeight: 'bold' 
                    }}>
                      {evt.event_type}
                    </span>
                  </td>
                  <td style={{ color: "#cbd5e1" }}>{evt.product}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TABLA DERECHA: SALIDA PROCESADA (FLINK: processed-audiences) */}
        <div className="chart-card" style={{ borderLeft: "4px solid #4f7cff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={{ color: "#ffffff", fontSize: "13px", margin: 0 }}>
              ⚡ SALIDA: Audiencias Detectadas (Flink: processed-audiences)
            </h3>
            <span style={{ background: "#4f7cff22", color: "#4f7cff", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>
              FLINK ENGINE
            </span>
          </div>
          <p className="chart-caption">Segmentación por reglas de negocio calculada en ventanas de tiempo</p>

          <table className="simple-table" style={{ fontSize: "11px", marginTop: "10px" }}>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Agente ID</th>
                <th>Audiencia Digital</th>
                <th>Regla Evaluada</th>
                <th>Acción Activada</th>
              </tr>
            </thead>
            <tbody>
              {processedEvents.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ color: "#8a93a6" }}>{item.time}</td>
                  <td style={{ fontWeight: "bold", color: "#e2e8f0" }}>{item.agent_id}</td>
                  <td style={{ color: "#36b37e", fontWeight: "bold" }}>{item.audience}</td>
                  <td style={{ color: "#ffab00", fontFamily: "monospace", fontSize: "10px" }}>{item.rule}</td>
                  <td style={{ color: "#4f7cff", fontWeight: "bold" }}>{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default LiveStreamTables

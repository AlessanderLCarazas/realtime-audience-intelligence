# Plataforma Inteligente para Simulación y Análisis de Audiencias Digitales en Tiempo Real

---

## 📌 Contexto y Descripción del Proyecto

En el contexto actual de la analítica de datos, el almacenamiento y análisis tradicional mediante procesamiento por lotes (Batch Processing) resulta insuficiente para escenarios que requieren decisiones inmediatas. La presente plataforma resuelve esta limitación implementando una Arquitectura Orientada a Eventos (EDA) que ingiere, procesa y visualiza la actividad de usuarios digitales en el instante exacto en que ocurre.

El sistema simula la interacción continua de cientos de usuarios representados por agentes autónomos, cuyos comportamientos se adaptan a patrones psicológicos específicos y escenarios globales de mercado. Los eventos emitidos son capturados por Apache Kafka, procesados mediante ventanas de tiempo con estado en Apache Flink, y transmitidos mediante WebSockets (FastAPI) hacia un Dashboard analítico interactivo (React) con latencia sub-segundo.

---

## 🏗️ ## Arquitectura del Sistema (Flujo de Datos)

El pipeline de procesamiento se organiza en 6 capas funcionales desacopladas, garantizando escalabilidad horizontal y tolerancia a fallos:

```mermaid
graph TD
    subgraph C1 ["Capa 1: Simulación de Agentes"]
        A["Simulador de Agentes (Python 3.11)"]
    end

    subgraph C2 ["Capa 2: Ingesta de Eventos"]
        B["Apache Kafka Cluster (digital-events)"]
    end

    subgraph C3 ["Capa 3: Procesamiento Distribuido"]
        C["Apache Flink Engine (PyFlink)"]
    end

    subgraph C4 ["Capa 4: Salida y Persistencia"]
        D["Apache Kafka Sink (processed-audiences)"]
    end

    subgraph C5 ["Capa 5: Backend y WebSockets"]
        E["FastAPI Backend Server"]
    end

    subgraph C6 ["Capa 6: Presentación y Acción"]
        F["React Dashboard (Vite + Recharts)"]
    end

    A -->|"Eventos JSON"| B
    B -->|"Stream Data"| C
    C -->|"Métricas Procesadas"| D
    D -->|"Consumer Loop"| E
    E -->|"WebSocket Push sub-500ms"| F
---

## ⚙️ Especificación Técnica de las Capas de la Solución

### Capa 1: Simulación de Agentes Autónomos y Escenarios
Implementa hilos independientes en Python 3.11 para generar flujos continuos de eventos estructurados en JSON. Cada agente modela una conducta particular:

| Perfil de Agente | Patrón de Interacción y Comportamiento Generado |
| :--- | :--- |
| **Comprador Compulsivo** | Elevada tasa de conversión, intervalos de decisión mínimos, pocas consultas de producto. |
| **Comparador** | Alto volumen de eventos VIEW_PRODUCT y COMPARE_PRICE, tasa de conversión baja. |
| **Comprador Nocturno** | Generación de eventos concentrada únicamente en franjas horarias nocturnas (00:00 - 06:00). |
| **Cliente Premium** | Frecuencia de compra reducida pero con importes de transacciones elevados (cart_value > $1500). |
| **Cliente Frecuente** | Emisión constante de eventos de compra en intervalos regulares de tiempo. |
| **Usuario Explorador** | Navegación extensiva por el catálogo (VIEW_PRODUCT) sin ejecución de eventos PURCHASE. |
| **Cliente Indeciso** | Ciclos repetitivos de ADD_TO_CART seguidos de REMOVE_FROM_CART antes de finalizar o abandonar. |
| **Cliente Estacional** | Modifica dinámicamente su volumen de actividad según el escenario empresarial global. |

* **Motor de Escenarios Globales:** Permite inyectar alteraciones en la velocidad y distribución del comportamiento de los agentes mediante el tópico `system-control` (ej. Navidad, Cyber Monday, Fiestas Patrias, Campaña Escolar).

---

### Capa 2 y Capa 4: Clúster de Ingesta y Egresos (Apache Kafka)
Kafka actúa como el bus principal de mensajería asíncrona, desacoplando la generación de eventos del procesamiento analítico.

* **Tópico `digital-events` (Ingesta):** Recibe el flujo masivo crudo. Particionado mediante `agent_id` para garantizar el orden secuencial de los eventos por usuario dentro de cada partición.
* **Tópico `system-control` (Control):** Tópico en modo broadcast (1 partición) para enviar señales de cambio de escenario hacia los simuladores y motores de procesamiento.
* **Tópico `processed-audiences` (Egresos):** Contiene la clasificación de usuarios realizada por Apache Flink.
* **Tópico `dashboard-metrics` (Egresos):** Contiene las métricas agregadas por ventanas deslizantes orientadas a la visualización.

---

### Capa 3: Motor de Procesamiento en Streaming (Apache Flink)
Utiliza PyFlink para ejecutar analítica con estado (Stateful Stream Processing) sobre ventanas de tiempo deslizantes de 0.5 segundos.

* **KeyBy(`agent_id`):** Agrupa el flujo por el identificador único del agente para mantener el estado contextual de cada usuario.
* **Time Windows (Sliding 0.5s):** Evalúa el comportamiento reciente de la audiencia de forma continua.
* **Reglas de Clasificación:**
  - Riesgo de Abandono: count(REMOVE_FROM_CART) > count(ADD_TO_CART)
  - Alta Intención de Compra: count(ADD_TO_CART) >= 2 en ventana de 0.5s
* **Resultados Producidos:** Identificación de segmentos (Audiencias Digitales), cálculo de tasas de conversión instantáneas y detección de anomalías de flujo.

---

### Capa 5: Backend & WebSockets (FastAPI)
Servidor desarrollado en Python que conecta el motor de persistencia/egreso de Kafka con la interfaz de usuario.

* **Kafka Consumer Loop:** Consume asíncronamente las métricas procesadas desde los tópicos de egreso de Kafka.
* **WebSocket Server Push:** Retransmite las métricas y eventos al frontend con una latencia garantizada menor a 500ms.
* **Controlador REST API:** Proporciona los endpoints de control para cambiar los escenarios de simulación global en tiempo real.

---

### Capa 6: Presentación y Acción (React Dashboard)
Interfaz gráfica construida en React.js (Vite, TailwindCSS y Recharts) orientada a la toma de decisiones empresariales. Visualiza de forma dinámica:

1. **KPIs en Vivo:** Usuarios activos en tiempo real, eventos procesados por segundo (EPS) y medidor de tasa de conversión (Gauge).
2. **Distribución de Eventos y Productos:** Rankings de productos más visitados, más comprados y distribución de eventos por tipo.
3. **Métricas Geográficas y Temporales:** Análisis de compras por región y gráficos de tendencias temporales.
4. **Segmentación y Funnel:** Estado dinámico del embudo de conversión y audiencias detectadas por Flink.
5. **Tablas Live Stream:** Trazabilidad paso a paso de los eventos procesados (Kafka vs. Flink).
6. **Activación de Acciones:** Disparo de automatizaciones según la audiencia (Pop-ups de descuento, notificaciones push, alertas de fraude y asignación de soporte VIP).

import ControlPanel from "./ControlPanel"
import ActiveUsersCard from "./charts/ActiveUsersCard"
import EventsPerSecondChart from "./charts/EventsPerSecondChart"
import EventsByTypeChart from "./charts/EventsByTypeChart"
import AgentProfilesChart from "./charts/AgentProfilesChart"
import DigitalAudiencesChart from "./charts/DigitalAudiencesChart"
import TopViewedProductsChart from "./charts/TopViewedProductsChart"
import TopPurchasedProductsChart from "./charts/TopPurchasedProductsChart"
import PurchasesByRegionChart from "./charts/PurchasesByRegionChart"
import TemporalTrendsChart from "./charts/TemporalTrendsChart"
import ConversionGauge from "./charts/ConversionGauge"
import AlertsFeed from "./charts/AlertsFeed"
import ScenarioRadarChart from "./charts/ScenarioRadarChart"
import AgentFunnelChart from "./charts/AgentFunnelChart"
import LostRevenueCard from "./charts/LostRevenueCard"
import LiveStreamTables from "./charts/LiveStreamTables"

function DashboardView({ latestMetrics, history, status, sendCommand, cumulativePurchases, cumulativeRegions, resetCumulative }) {
  return (
    <div className="dashboard-view">
      <ControlPanel sendCommand={sendCommand} status={status} onResetExtra={resetCumulative} />

      {!latestMetrics ? (
        <p className="waiting-message">esperando metricas del backend...</p>
      ) : (
        <div className="dashboard-grid">
          {/* BLOQUE 1: KPIs Principales */}
          <ActiveUsersCard latestMetrics={latestMetrics} history={history} status={status} />
          <EventsPerSecondChart history={history} />
          <EventsByTypeChart latestMetrics={latestMetrics} />
          <ConversionGauge latestMetrics={latestMetrics} />

          {/* BLOQUE 2: Perfiles vs Audiencias */}
          <AgentProfilesChart latestMetrics={latestMetrics} status={status} />
          <DigitalAudiencesChart latestMetrics={latestMetrics} status={status} />

          {/* BLOQUE 3: Productos y Geografía */}
          <TopViewedProductsChart latestMetrics={latestMetrics} />
          <TopPurchasedProductsChart cumulativePurchases={cumulativePurchases} />
          <PurchasesByRegionChart cumulativeRegions={cumulativeRegions} />

          {/* BLOQUE 4: Métricas Temporales, Funnel y Alertas */}
          <TemporalTrendsChart history={history} />
          <AgentFunnelChart latestMetrics={latestMetrics} />

          <AlertsFeed latestMetrics={latestMetrics} />
          <LostRevenueCard latestMetrics={latestMetrics} />

          {/* BLOQUE 5: Radar Analítico */}
          <ScenarioRadarChart latestMetrics={latestMetrics} status={status} />

          {/* BLOQUE 6: Trazabilidad de Streams en Tiempo Real (Kafka vs Flink) */}
          <LiveStreamTables latestMetrics={latestMetrics} status={status} />
        </div>
      )}
    </div>
  )
}

export default DashboardView

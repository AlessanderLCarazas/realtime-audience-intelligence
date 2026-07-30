import json
from collections import Counter, deque
from datetime import datetime

from pyflink.common import SimpleStringSchema, WatermarkStrategy
from pyflink.common.typeinfo import Types

from pyflink.common.time import Time

from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.functions import ProcessAllWindowFunction
from pyflink.datastream.connectors.kafka import KafkaSource, KafkaSink, KafkaOffsetsInitializer, KafkaRecordSerializationSchema
from pyflink.datastream.window import TumblingProcessingTimeWindows

KAFKA_BOOTSTRAP = "kafka:29092"
SOURCE_TOPIC = "store-events"
SINK_TOPIC = "dashboard-metrics"
WINDOW_MILLIS = 500
class MetricsProcessFunction(ProcessAllWindowFunction):
    def open(self, runtime_context):
        self.eps_history = deque(maxlen=30)

    def process(self, context, elements):
        events = []
        for raw in elements:
            try:
                events.append(json.loads(raw))
            except ValueError:
                continue
        total_events = len(events)
        if total_events == 0:
            return
        window_start = context.window().start
        window_end = context.window().end
        duration_seconds = (window_end - window_start) / 1000.0
        if duration_seconds <= 0:
            duration_seconds = WINDOW_MILLIS / 1000.0
        active_agents = set()
        event_type_counter = Counter()
        profile_counter = Counter()
        flavor_counter = Counter()
        views_counter = Counter()
        purchases_counter = Counter()
        region_purchase_counter = Counter()
        login_count = 0
        purchase_count = 0
        abandon_count = 0
        for ev in events:
            active_agents.add(ev.get("agent_id"))
            event_type = ev.get("event_type")
            event_type_counter[event_type] += 1
            profile_counter[ev.get("agent_profile")] += 1
            flavor = ev.get("scenario_flavor")
            if flavor:
                flavor_counter[flavor] += 1
            if event_type == "login":
                login_count += 1
            elif event_type == "view_product":
                views_counter[ev.get("product_name")] += 1
            elif event_type == "purchase":
                purchase_count += 1
                purchases_counter[ev.get("product_name")] += 1
                region_purchase_counter[ev.get("region")] += 1
            elif event_type == "abandon":
                abandon_count += 1
        eventos_por_segundo = round(total_events / duration_seconds, 2)
        self.eps_history.append(eventos_por_segundo)
        avg_eps = sum(self.eps_history) / len(self.eps_history)
        sesiones_terminadas = purchase_count + abandon_count
        tasa_abandono = (abandon_count / sesiones_terminadas) if sesiones_terminadas > 0 else 0.0
        tasa_conversion = (purchase_count / login_count) if login_count > 0 else 0.0
        alerts = []
        if sesiones_terminadas >= 5 and tasa_abandono > 0.7:
            alerts.append({"severity": "warning", "message": "tasa de abandono alta: " + str(round(tasa_abandono * 100, 1)) + "%"})
        if avg_eps > 0 and len(self.eps_history) >= 5 and eventos_por_segundo > avg_eps * 2.5:
            alerts.append({"severity": "info", "message": "pico anomalo de eventos por segundo: " + str(eventos_por_segundo)})
        if login_count >= 5 and tasa_conversion < 0.05:
            alerts.append({"severity": "warning", "message": "conversion muy baja: " + str(round(tasa_conversion * 100, 1)) + "%"})
        metrics = {
            "window_start": window_start,
            "window_end": window_end,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%dt%H:%M:%S.%f")[:-3] + "z",
            "usuarios_activos": len(active_agents),
            "eventos_por_segundo": eventos_por_segundo,
            "eventos_totales": total_events,
            "eventos_por_tipo": dict(event_type_counter),
            "audiencias_por_perfil": dict(profile_counter),
            "audiencias_estacional_flavor": dict(flavor_counter),
            "productos_mas_vistos": [{"producto": p, "vistas": c} for p, c in views_counter.most_common(10)],
            "productos_mas_comprados": [{"producto": p, "compras": c} for p, c in purchases_counter.most_common(10)],
            "compras_por_region": dict(region_purchase_counter),
            "conversion": round(tasa_conversion, 4),
            "logins": login_count,
            "purchases": purchase_count,
            "abandons": abandon_count,
            "alertas": alerts
        }
        yield json.dumps(metrics)

def build_job():
    env = StreamExecutionEnvironment.get_execution_environment()
    env.set_parallelism(1)
    env.add_jars("file:///home/ubuntu/kafka-flink-tienda/flink-libs/flink-sql-connector-kafka-3.2.0-1.19.jar")

    source = KafkaSource.builder() \
        .set_bootstrap_servers(KAFKA_BOOTSTRAP) \
        .set_topics(SOURCE_TOPIC) \
        .set_group_id("flink-metrics-job") \
        .set_starting_offsets(KafkaOffsetsInitializer.latest()) \
        .set_value_only_deserializer(SimpleStringSchema()) \
        .build()

    sink = KafkaSink.builder() \
        .set_bootstrap_servers(KAFKA_BOOTSTRAP) \
        .set_record_serializer(
            KafkaRecordSerializationSchema.builder()
            .set_topic(SINK_TOPIC)
            .set_value_serialization_schema(SimpleStringSchema())
            .build()
        ) \
        .build()

    stream = env.from_source(source, WatermarkStrategy.no_watermarks(), "store-events-source")

    windowed = stream.window_all(TumblingProcessingTimeWindows.of(Time.milliseconds(WINDOW_MILLIS))) \
        .process(MetricsProcessFunction(), output_type=Types.STRING())

    windowed.sink_to(sink)

    env.execute("dashboard-metrics-job")

if __name__ == "__main__":
    build_job()

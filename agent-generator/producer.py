import json
import os
import random
import threading
import time
import uuid
from datetime import datetime
from confluent_kafka import Consumer, Producer

BOOTSTRAP_SERVERS = os.environ.get("kafka_bootstrap", "localhost:9092")

REGIONS = ["lima", "arequipa", "cusco", "trujillo", "piura", "chiclayo", "huancayo", "tacna"]
DEVICES = ["mobile", "desktop", "tablet"]

CATALOG = {
    "electronica": [("p001", "laptop lenovo", 1899.90), ("p002", "smartphone samsung", 1299.50), ("p003", "audifonos sony", 249.90)],
    "hogar": [("p010", "licuadora oster", 189.90), ("p011", "juego de ollas", 349.90)],
    "ropa": [("p020", "casaca invierno", 129.90), ("p021", "zapatillas nike", 349.90)],
    "alimentos": [("p030", "paneton donofrio", 29.90), ("p031", "chocolate sublime", 8.50)],
    "juguetes": [("p040", "muneca barbie", 99.90), ("p041", "carro control remoto", 149.90)],
    "decoracion": [("p050", "arbol navideno", 249.90), ("p051", "luces led", 49.90)],
    "ropa_tipica": [("p060", "poncho arequipeno", 199.90), ("p061", "chalina de alpaca", 89.90)],
    "artesania": [("p070", "retablo ayacuchano", 129.90), ("p071", "ceramica de chulucanas", 99.90)],
    "tecnologia": [("p080", "smart tv lg", 1499.90), ("p081", "consola playstation", 2199.90)],
    "premium": [("p090", "smart tv oled 75 pulgadas", 6999.90), ("p091", "refrigeradora smart samsung", 4599.90), ("p092", "laptop gamer rog", 8999.90)]
}

SCENARIOS = {
    "dia_normal": {"rate": 2.0, "categories": ["electronica", "hogar", "ropa", "alimentos"]},
    "navidad": {"rate": 8.0, "categories": ["juguetes", "electronica", "ropa", "decoracion"]},
    "fiestas_patrias": {"rate": 6.0, "categories": ["ropa_tipica", "alimentos", "artesania", "electronica"]},
    "cyber_monday": {"rate": 12.0, "categories": ["electronica", "hogar", "ropa", "tecnologia"]}
}

ESTACIONAL_FLAVOR = {
    "dia_normal": "estacional_ocasional",
    "navidad": "estacional_navideno",
    "fiestas_patrias": "estacional_turista",
    "cyber_monday": "estacional_cazador_ofertas"
}

PROFILE_CONFIG = {
    "comprador_compulsivo": {"weight": 15, "min_views": 1, "max_views": 1, "purchase_bias": 0.85, "delay": (0.1, 0.4), "indeciso": False, "premium": False, "night_only": False},
    "comparador": {"weight": 15, "min_views": 4, "max_views": 6, "purchase_bias": 0.3, "delay": (0.5, 1.5), "indeciso": False, "premium": False, "night_only": False},
    "comprador_nocturno": {"weight": 10, "min_views": 2, "max_views": 3, "purchase_bias": 0.45, "delay": (0.4, 1.2), "indeciso": False, "premium": False, "night_only": True},
    "cliente_premium": {"weight": 5, "min_views": 1, "max_views": 2, "purchase_bias": 0.75, "delay": (0.5, 1.2), "indeciso": False, "premium": True, "night_only": False},
    "cliente_frecuente": {"weight": 20, "min_views": 1, "max_views": 2, "purchase_bias": 0.6, "delay": (0.2, 0.6), "indeciso": False, "premium": False, "night_only": False},
    "usuario_explorador": {"weight": 15, "min_views": 6, "max_views": 9, "purchase_bias": 0.0, "delay": (0.3, 0.9), "indeciso": False, "premium": False, "night_only": False},
    "cliente_indeciso": {"weight": 10, "min_views": 1, "max_views": 2, "purchase_bias": 0.2, "delay": (0.4, 1.0), "indeciso": True, "premium": False, "night_only": False},
    "cliente_estacional": {"weight": 20, "min_views": 2, "max_views": 3, "purchase_bias": 0.5, "delay": (0.4, 1.2), "indeciso": False, "premium": False, "night_only": False}
}

state_lock = threading.Lock()
state = {
    "status": "stopped",
    "scenario": "dia_normal",
    "period": "dia",
    "duration_seconds": None,
    "remaining_seconds": None
}
active_agents = {}
total_agents_spawned = 0

def now_iso():
    return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

def choose_profile(period):
    pool = []
    for name, cfg in PROFILE_CONFIG.items():
        if cfg["night_only"] and period != "noche":
            continue
        pool.append((name, cfg["weight"]))
    names = [p[0] for p in pool]
    weights = [p[1] for p in pool]
    return random.choices(names, weights=weights, k=1)[0]

def choose_product(scenario, premium):
    if premium:
        candidates = CATALOG["premium"]
        product_id, product_name, price = random.choice(candidates)
        return "premium", product_id, product_name, price
    category = random.choice(SCENARIOS[scenario]["categories"])
    product_id, product_name, price = random.choice(CATALOG[category])
    return category, product_id, product_name, price

def make_event(agent, event_type, extra=None):
    event = {
        "event_id": "evt-" + uuid.uuid4().hex[:10],
        "timestamp": now_iso(),
        "agent_id": agent["agent_id"],
        "agent_profile": agent["profile"],
        "event_type": event_type,
        "scenario": agent["scenario"],
        "session_id": agent["session_id"],
        "region": agent["region"],
        "city": agent["city"],
        "device": agent["device"]
    }
    if agent["profile"] == "cliente_estacional":
        event["scenario_flavor"] = agent["scenario_flavor"]
    if extra:
        event.update(extra)
    return event

def spawn_agent(scenario, period):
    profile = choose_profile(period)
    cfg = PROFILE_CONFIG[profile]
    agent_id = "a" + uuid.uuid4().hex[:8]
    region = random.choice(REGIONS)
    agent = {
        "agent_id": agent_id,
        "profile": profile,
        "scenario": scenario,
        "scenario_flavor": ESTACIONAL_FLAVOR[scenario],
        "session_id": "sess-" + uuid.uuid4().hex[:8],
        "region": region,
        "city": region,
        "device": random.choice(DEVICES),
        "step": "login",
        "views": 0,
        "target_views": random.randint(cfg["min_views"], cfg["max_views"]),
        "indecision_count": 0,
        "target_indecisions": random.randint(2, 3),
        "last_product": None,
        "created_at": time.time(),
        "next_action_at": time.time()
    }
    return agent

def send_event(producer, topic, event):
    producer.produce(topic, value=json.dumps(event).encode("utf-8"))

def next_delay(profile):
    lo, hi = PROFILE_CONFIG[profile]["delay"]
    return random.uniform(lo, hi)

def advance_agent(agent, producer):
    step = agent["step"]
    profile = agent["profile"]
    cfg = PROFILE_CONFIG[profile]
    if step == "login":
        send_event(producer, "store-events", make_event(agent, "login"))
        agent["step"] = "search"
        agent["next_action_at"] = time.time() + next_delay(profile)
    elif step == "search":
        send_event(producer, "store-events", make_event(agent, "search"))
        agent["step"] = "view_product"
        agent["next_action_at"] = time.time() + next_delay(profile)
    elif step == "view_product":
        category, product_id, product_name, price = choose_product(agent["scenario"], cfg["premium"])
        agent["last_product"] = (product_id, product_name, price)
        send_event(producer, "store-events", make_event(agent, "view_product", {
            "category": category,
            "product_id": product_id,
            "product_name": product_name,
            "price": price
        }))
        agent["views"] += 1
        if agent["views"] < agent["target_views"]:
            agent["next_action_at"] = time.time() + next_delay(profile)
        else:
            agent["step"] = "decide_cart"
            agent["next_action_at"] = time.time() + next_delay(profile)
    elif step == "decide_cart":
        if cfg["indeciso"] and agent["indecision_count"] < agent["target_indecisions"]:
            product_id, product_name, price = agent["last_product"]
            quantity = random.randint(1, 2)
            send_event(producer, "store-events", make_event(agent, "add_to_cart", {
                "product_id": product_id,
                "product_name": product_name,
                "price": price,
                "quantity": quantity
            }))
            agent["step"] = "remove_from_cart"
            agent["next_action_at"] = time.time() + next_delay(profile)
        elif random.random() < cfg["purchase_bias"]:
            product_id, product_name, price = agent["last_product"]
            quantity = random.randint(1, 3) if not cfg["premium"] else 1
            send_event(producer, "store-events", make_event(agent, "add_to_cart", {
                "product_id": product_id,
                "product_name": product_name,
                "price": price,
                "quantity": quantity
            }))
            agent["step"] = "purchase"
            agent["next_action_at"] = time.time() + next_delay(profile)
        else:
            agent["step"] = "abandon"
            agent["next_action_at"] = time.time()
    elif step == "remove_from_cart":
        product_id, product_name, price = agent["last_product"]
        send_event(producer, "store-events", make_event(agent, "remove_from_cart", {
            "product_id": product_id,
            "product_name": product_name,
            "price": price
        }))
        agent["indecision_count"] += 1
        agent["step"] = "decide_cart"
        agent["next_action_at"] = time.time() + next_delay(profile)
    elif step == "purchase":
        product_id, product_name, price = agent["last_product"]
        quantity = random.randint(1, 3) if not cfg["premium"] else 1
        duration_ms = int((time.time() - agent["created_at"]) * 1000)
        send_event(producer, "store-events", make_event(agent, "purchase", {
            "product_id": product_id,
            "product_name": product_name,
            "price": price,
            "quantity": quantity,
            "session_duration_ms": duration_ms
        }))
        agent["step"] = "done"
    elif step == "abandon":
        duration_ms = int((time.time() - agent["created_at"]) * 1000)
        send_event(producer, "store-events", make_event(agent, "abandon", {
            "session_duration_ms": duration_ms
        }))
        agent["step"] = "done"

def handle_control_command(command):
    global total_agents_spawned
    with state_lock:
        action = command.get("command")
        if action == "play":
            state["status"] = "running"
            # Si el tiempo restante no existe o llego a 0, lo reiniciamos al tiempo de duracion total
            if state["remaining_seconds"] is None or state["remaining_seconds"] <= 0:
                state["remaining_seconds"] = state["duration_seconds"]
        elif action == "pause":
            state["status"] = "paused"
        elif action == "reset":
            state["status"] = "stopped"
            state["remaining_seconds"] = state["duration_seconds"]
            active_agents.clear()
            total_agents_spawned = 0
        elif action == "set_scenario":
            state["scenario"] = command.get("scenario", state["scenario"])
        elif action == "set_period":
            state["period"] = command.get("period", state["period"])
        elif action == "set_duration":
            duration = command.get("duration_seconds")
            state["duration_seconds"] = duration
            state["remaining_seconds"] = duration
    print("control command received: " + str(command))

def control_listener():
    consumer = Consumer({
        "bootstrap.servers": BOOTSTRAP_SERVERS,
        "group.id": "agent-generator-control",
        "auto.offset.reset": "latest"
    })
    consumer.subscribe(["system-control"])
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            print("control listener error: " + str(msg.error()))
            continue
        try:
            payload = json.loads(msg.value().decode("utf-8"))
        except ValueError:
            continue
        if payload.get("command"):
            handle_control_command(payload)

def run_generator():
    global total_agents_spawned
    producer = Producer({"bootstrap.servers": BOOTSTRAP_SERVERS})
    listener_thread = threading.Thread(target=control_listener, daemon=True)
    listener_thread.start()
    print("generador iniciado, conectado a kafka en " + BOOTSTRAP_SERVERS)
    last_tick = time.time()
    last_print = time.time()
    last_status_report = time.time()

    while True:
        time.sleep(0.1) # Bucle rapido de 100ms
        producer.poll(0)
        now = time.time()
        
        elapsed = now - last_tick
        last_tick = now

        with state_lock:
            status = state["status"]
            scenario = state["scenario"]
            period = state["period"]
            remaining = state["remaining_seconds"]

        if status == "running":
            if remaining is not None:
                remaining = max(0.0, remaining - elapsed)
                with state_lock:
                    state["remaining_seconds"] = remaining
                if remaining <= 0:
                    with state_lock:
                        state["status"] = "stopped"
                    status = "stopped"
                    print("execution time finished, stopping generator")

            if status == "running":
                rate = SCENARIOS[scenario]["rate"]
                expected_new = rate * elapsed
                new_count = int(expected_new) + (1 if random.random() < (expected_new - int(expected_new)) else 0)
                for _ in range(new_count):
                    active_agents[uuid.uuid4().hex] = spawn_agent(scenario, period)
                total_agents_spawned += new_count

                ready_ids = [aid for aid, ag in list(active_agents.items()) if ag["next_action_at"] <= now]
                for aid in ready_ids:
                    if aid in active_agents:
                        advance_agent(active_agents[aid], producer)
                        if active_agents[aid]["step"] == "done":
                            del active_agents[aid]

        # Envia actualizaciones al frontend cada 0.5 segundos (sincronizado con Flink)
        if now - last_status_report >= 0.5:
            agents_snapshot = []
            for aid, ag in list(active_agents.items())[:300]:
                agents_snapshot.append({
                    "agent_id": ag["agent_id"],
                    "profile": ag["profile"],
                    "scenario": ag["scenario"],
                    "scenario_flavor": ag["scenario_flavor"],
                    "session_id": ag["session_id"],
                    "region": ag["region"],
                    "city": ag["city"],
                    "device": ag["device"],
                    "step": ag["step"],
                    "views": ag["views"],
                    "target_views": ag["target_views"],
                    "indecision_count": ag["indecision_count"]
                })
            send_event(producer, "system-control", {
                "type": "status_report",
                "status": status,
                "scenario": scenario,
                "period": period,
                "active_agents": len(active_agents),
                "total_agents_spawned": total_agents_spawned,
                "remaining_seconds": remaining,
                "agents": agents_snapshot
            })
            last_status_report = now

        if now - last_print >= 5.0:
            print(f"scenario {scenario} period {period} active agents {len(active_agents)} status {status}")
            last_print = now

if __name__ == "__main__":
    run_generator()

import json
import queue
import threading
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from confluent_kafka import Consumer, Producer

KAFKA_BOOTSTRAP = "localhost:9092"
METRICS_TOPIC = "dashboard-metrics"
CONTROL_TOPIC = "system-control"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

outgoing_queue = queue.Queue()
active_connections = set()
producer = Producer({"bootstrap.servers": KAFKA_BOOTSTRAP})

def kafka_metrics_consumer_thread():
    consumer = Consumer({
        "bootstrap.servers": KAFKA_BOOTSTRAP,
        "group.id": "dashboard-backend",
        "auto.offset.reset": "latest"
    })
    consumer.subscribe([METRICS_TOPIC])
    print("consumer de dashboard-metrics iniciado")
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            print("error en consumer de metrics: " + str(msg.error()))
            continue
        try:
            payload = msg.value().decode("utf-8")
        except Exception as e:
            continue
        outgoing_queue.put(payload)

def kafka_status_consumer_thread():
    consumer = Consumer({
        "bootstrap.servers": KAFKA_BOOTSTRAP,
        "group.id": "dashboard-backend-status",
        "auto.offset.reset": "latest"
    })
    consumer.subscribe([CONTROL_TOPIC])
    print("consumer de system-control iniciado")
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            print("error en consumer de status: " + str(msg.error()))
            continue
        try:
            payload = msg.value().decode("utf-8")
            parsed = json.loads(payload)
        except Exception as e:
            continue
        if parsed.get("type") == "status_report":
            outgoing_queue.put(payload)

def publish_control_command(command):
    producer.produce(CONTROL_TOPIC, value=json.dumps(command).encode("utf-8"))
    producer.poll(0)
    print("comando publicado a system-control: " + str(command))

async def broadcast_loop():
    while True:
        payload = await asyncio.to_thread(outgoing_queue.get)
        dead_connections = set()
        for ws in active_connections:
            try:
                await ws.send_text(payload)
            except Exception:
                dead_connections.add(ws)
        active_connections.difference_update(dead_connections)

@app.on_event("startup")
async def startup_event():
    threading.Thread(target=kafka_metrics_consumer_thread, daemon=True).start()
    threading.Thread(target=kafka_status_consumer_thread, daemon=True).start()
    asyncio.create_task(broadcast_loop())

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/control")
async def control(command: dict):
    publish_control_command(command)
    return {"status": "sent", "command": command}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    print("cliente conectado, total conexiones: " + str(len(active_connections)))
    try:
        while True:
            data = await websocket.receive_text()
            try:
                command = json.loads(data)
                if command.get("command"):
                    publish_control_command(command)
            except ValueError:
                print("mensaje invalido recibido por websocket: " + data)
    except WebSocketDisconnect:
        active_connections.discard(websocket)
        print("cliente desconectado, total conexiones: " + str(len(active_connections)))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

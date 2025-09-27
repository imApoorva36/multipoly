from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
import threading
import time
import sys
import os
import asyncio

# Add the agents directory to path
sys.path.append("agents_flat")


# Import and run agents in threads
def run_agents():
    """Start both agents in separate threads"""

    def start_chatbot():
        # Create new event loop for this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            # Import and initialize the chatbot agent
            from agents_flat.agent_chatbot import agent as chatbot_agent

            # Run the agent
            chatbot_agent.run()
        except Exception as e:
            print(f"Error in chatbot thread: {e}")
        finally:
            loop.close()

    def start_tutor():
        # Create new event loop for this thread
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            # Import and initialize the tutor agent
            from agents_flat.agent_tutor import tutor_agent

            # Run the agent
            tutor_agent.run()
        except Exception as e:
            print(f"Error in tutor thread: {e}")
        finally:
            loop.close()

    # Start agents in daemon threads
    chatbot_thread = threading.Thread(target=start_chatbot, daemon=True)
    tutor_thread = threading.Thread(target=start_tutor, daemon=True)

    chatbot_thread.start()
    time.sleep(2)
    tutor_thread.start()

    return chatbot_thread, tutor_thread


app = Flask(
    __name__,
    template_folder="frontend/templates",
    static_folder="frontend/static",
)

# Enable CORS for all routes
CORS(app, origins=["*"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])


# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add(
        "Access-Control-Allow-Headers", "Content-Type,Authorization"
    )
    response.headers.add(
        "Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"
    )
    return response


# Start agents
print("🚀 Starting agents...")
run_agents()
time.sleep(5)  # Give agents time to start

# Frontend routes (copied from frontend/app.py)
CHAT_URL = os.environ.get("CHAT_URL", "http://127.0.0.1:8010/chat")
TUTOR_URL = os.environ.get("TUTOR_URL", "http://127.0.0.1:8011/advise")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json(force=True)
    user_id = data.get("user_id", "u1")
    message = data.get("message", "Hello")
    model = data.get("model", "asi1-fast")
    r = requests.post(
        CHAT_URL,
        json={"user_id": user_id, "message": message, "model": model},
    )
    r.raise_for_status()
    return jsonify(r.json())


@app.route("/api/advise", methods=["POST"])
def api_advise():
    data = request.get_json(force=True)
    payload = {
        "user_id": data.get("user_id", "u1"),
        "state": data.get("state", {}),
        "question": data.get("question"),
        "force_refresh": data.get("force_refresh", False),
    }
    r = requests.post(TUTOR_URL, json=payload)
    r.raise_for_status()
    return jsonify(r.json())


@app.route("/health")
def health_check():
    return {
        "status": "healthy",
        "services": ["frontend", "chatbot", "tutor"],
    }, 200


# Direct agent proxy routes for external access
@app.route(
    "/agents/chatbot/<path:path>", methods=["GET", "POST", "PUT", "DELETE"]
)
def proxy_chatbot(path):
    """Proxy requests to chatbot agent"""
    import requests

    url = f"http://127.0.0.1:8010/{path}"

    if request.method == "GET":
        resp = requests.get(url, params=request.args)
    elif request.method == "POST":
        resp = requests.post(url, json=request.get_json(), params=request.args)
    elif request.method == "PUT":
        resp = requests.put(url, json=request.get_json(), params=request.args)
    elif request.method == "DELETE":
        resp = requests.delete(url, params=request.args)

    return resp.content, resp.status_code, resp.headers.items()


@app.route(
    "/agents/tutor/<path:path>", methods=["GET", "POST", "PUT", "DELETE"]
)
def proxy_tutor(path):
    """Proxy requests to tutor agent"""
    import requests

    url = f"http://127.0.0.1:8011/{path}"

    if request.method == "GET":
        resp = requests.get(url, params=request.args)
    elif request.method == "POST":
        resp = requests.post(url, json=request.get_json(), params=request.args)
    elif request.method == "PUT":
        resp = requests.put(url, json=request.get_json(), params=request.args)
    elif request.method == "DELETE":
        resp = requests.delete(url, params=request.args)

    return resp.content, resp.status_code, resp.headers.items()


# Agent info endpoints
@app.route("/agents/info")
def agents_info():
    return {
        "chatbot": {
            "name": "multipoly-chatbot",
            "port": 8010,
            "endpoints": ["/chat", "/health"],
            "direct_access": "https://multipoly.onrender.com/agents/chatbot",
        },
        "tutor": {
            "name": "multipoly-tutor",
            "port": 8011,
            "endpoints": [
                "/advise",
                "/update_knowledge",
                "/query_knowledge",
                "/health",
            ],
            "direct_access": "https://multipoly.onrender.com/agents/tutor",
        },
    }, 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

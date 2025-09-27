from __future__ import annotations
from flask import Flask, render_template, request, jsonify
import os
import requests

CHAT_URL = os.environ.get("CHAT_URL", "http://127.0.0.1:8010/chat")
TUTOR_URL = os.environ.get("TUTOR_URL", "http://127.0.0.1:8011/advise")

app = Flask(__name__)


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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

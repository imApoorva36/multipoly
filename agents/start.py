from flask import Flask, request, jsonify, render_template
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

# Start agents
print("🚀 Starting agents...")
run_agents()
time.sleep(5)  # Give agents time to start

# Your existing Flask routes here...
# Copy all routes from frontend/app.py


@app.route("/health")
def health_check():
    return {
        "status": "healthy",
        "services": ["frontend", "chatbot", "tutor"],
    }, 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

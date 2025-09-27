from __future__ import annotations
from datetime import datetime
from uuid import uuid4
from typing import Any, Dict, Optional
from uagents import Agent, Context, Model, Protocol
from uagents.setup import fund_agent_if_low
from dotenv import load_dotenv
import pathlib
import os
from metta_store import MeTTaStore
from asi_client import chat_completion
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)

# Load environment variables from .env file
load_dotenv()


# --- Models for REST endpoints ---
class AdviseRequest(Model):
    user_id: str
    state: Dict[str, Any]  # simplified Multipoly state
    question: Optional[str] = None
    force_refresh: Optional[bool] = False


class AdviseResponse(Model):
    advice: str
    source: str  # "metta" | "asi" | "fallback"


class HealthResponse(Model):
    status: str
    agent: str


# --- Agent ---
tutor_agent = Agent(
    name="multipoly-tutor",
    port=8011,
    mailbox=True,  # Enable mailbox for Agentverse
    publish_agent_details=True,  # Publish agent details for discovery
)
fund_agent_if_low(tutor_agent.wallet.address())
_store = MeTTaStore()

# Use the chat protocol specification directly - REQUIRED for ASI:One
protocol = Protocol(spec=chat_protocol_spec)


# Seed a small Multipoly knowledge base (demo rules)
def seed_knowledge():
    _store.add_fact("propertyA", "hasToken", "token_red")
    _store.add_fact("propertyB", "hasToken", "token_blue")
    _store.add_fact("token_red", "yields", "high")
    _store.add_fact("token_blue", "yields", "medium")
    _store.add_fact("fine1", "isFine", "one_time")
    kb = (
        pathlib.Path(__file__).resolve().parents[1]
        / "knowledge"
        / "multipoly.metta"
    )
    try:
        _store.load_program(kb.read_text(encoding="utf-8"))
    except Exception:
        pass


def metta_best_move(state: Dict[str, Any]) -> Optional[str]:
    pos = state.get("position")
    if not pos:
        return None
    bindings = _store.query(pos, "hasToken", "$t")
    token = bindings[0]["$t"] if bindings else None
    if token:
        y = _store.query(token, "yields", "high")
        if y:
            return (
                f"Consider buying or investing in {pos}; its token {token} "
                f"yields high."
            )
    return None


def ask_asi_for_move(state: Dict[str, Any], question: Optional[str]) -> str:
    prompt = (
        "You are an AI game tutor for Multipoly. Based on the provided game "
        "state, give the next best move succinctly."
    )
    user = f"Game state: {state}. "
    if question:
        user += f"Player question: {question}"
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": user},
    ]
    try:
        resp = chat_completion(messages)
        return resp["choices"][0]["message"]["content"]
    except Exception as e:
        return f"ASI:One error: {e}"


@protocol.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.utcnow(),
            acknowledged_msg_id=msg.msg_id,
        ),
    )
    text = ""
    for item in msg.content:
        if isinstance(item, TextContent):
            text += item.text
    # Try MeTTa KB first
    advice = metta_best_move({"position": text})
    if not advice:
        advice = ask_asi_for_move({"position": text}, None)

    await ctx.send(
        sender,
        ChatMessage(
            timestamp=datetime.utcnow(),
            msg_id=uuid4(),
            content=[
                TextContent(type="text", text=advice),
                EndSessionContent(type="end-session"),
            ],
        ),
    )


@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle acknowledgements (optional, useful for read receipts)"""
    ctx.logger.info(f"Received acknowledgement from {sender}")


# Include the protocol with manifest publishing for ASI:One discovery
tutor_agent.include(protocol, publish_manifest=True)


@tutor_agent.on_event("startup")
async def startup_handler(ctx: Context):
    seed_knowledge()
    ctx.logger.info(
        "Tutor ready at %s (REST on http://127.0.0.1:%s)",
        tutor_agent.address,
        tutor_agent.port,
    )
    ctx.logger.info("Registered chat protocol for ASI:One compatibility")


# REST endpoints for frontend already defined at the top of the file


# REST endpoints for frontend
@tutor_agent.on_rest_post("/advise", AdviseRequest, AdviseResponse)
async def rest_advise(ctx: Context, req: AdviseRequest) -> AdviseResponse:
    advice = metta_best_move(req.state)
    if not advice:
        advice = ask_asi_for_move(req.state, req.question)

    return AdviseResponse(advice=advice, source="asi")


@tutor_agent.on_rest_get("/health", HealthResponse)
async def health_check(ctx: Context) -> HealthResponse:
    """Health check endpoint"""
    return HealthResponse(status="healthy", agent="multipoly-tutor")


# Ensure ASI:One API key is set
ASI_ONE_API_KEY = os.getenv("ASI_ONE_API_KEY")
if not ASI_ONE_API_KEY:
    raise EnvironmentError(
        "Missing ASI_ONE_API_KEY. Set your ASI:One API key in the environment."
    )

# Pass the API key to the chat_completion function if required


if __name__ == "__main__":
    tutor_agent.run()

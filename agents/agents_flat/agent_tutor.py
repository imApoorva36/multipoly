from __future__ import annotations
from datetime import datetime
from uuid import uuid4
from typing import Any, Dict, Optional
from uagents import Agent, Context, Model, Protocol
from uagents.setup import fund_agent_if_low
from dotenv import load_dotenv
import os
from metta_store import MultipolyKnowledgeGraph
from asi_client import chat_completion
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
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


class KnowledgeUpdateRequest(Model):
    relation: str  # e.g., "investmentValue", "riskLevel", "yields"
    subject: str  # e.g., "Tokyo", "token_blue"
    value: str  # e.g., "excellent returns", "high"
    source: Optional[str] = "user_update"


class KnowledgeUpdateResponse(Model):
    success: bool
    message: str
    relation: str
    subject: str
    value: str


class KnowledgeQueryResponse(Model):
    relation: str
    subject: str
    results: list
    count: int


# --- Agent ---
tutor_agent = Agent(
    name="multipoly-tutor",
    port=8011,
    mailbox=True,  # Enable mailbox for Agentverse
    publish_agent_details=True,  # Publish agent details for discovery
)
fund_agent_if_low(tutor_agent.wallet.address())
_store = MultipolyKnowledgeGraph()

# Use the chat protocol specification directly - REQUIRED for ASI:One
protocol = Protocol(spec=chat_protocol_spec)


def metta_best_move(state: Dict[str, Any]) -> Optional[str]:
    """Use MeTTa knowledge graph to provide comprehensive game advice"""
    # Enhanced game state analysis using new MeTTa methods
    pos = state.get("position")
    player_tokens = state.get("tokens", {})
    game_phase = state.get("phase", "early_game")

    if not pos:
        return None

    # Get comprehensive strategic recommendations
    comprehensive_advice = _store.get_strategic_recommendations(
        {
            "position": pos,
            "phase": game_phase,
            "owned_properties": state.get("owned_properties", []),
        }
    )

    # If player is on a property, analyze purchase opportunity
    if pos != "start" and player_tokens:
        purchase_analysis = _store.analyze_purchase_opportunity(
            pos, player_tokens
        )
        comprehensive_advice += (
            f"\n\n🏠 Purchase Analysis:\n{purchase_analysis}"
        )

    # Add game mechanic reminders
    if pos == "start":
        airdrop_info = _store.query_game_mechanic("airdrop")
        if airdrop_info:
            comprehensive_advice += f"\n\n💰 Airdrop: {airdrop_info[0]}"

    return (
        comprehensive_advice
        if "MeTTa not available" not in comprehensive_advice
        else None
    )


def ask_asi_for_move(state: Dict[str, Any], question: Optional[str]) -> str:
    prompt = (
        "You are an AI game tutor for Multipoly - a strategic property investment game. "
        "Based on the provided game state, give the next best move succinctly."
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
        response = resp["choices"][0]["message"]["content"]
        return response
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

    # Parse input for better context (expect JSON or simple city name)
    game_state = {"position": text}
    try:
        # Try to parse as JSON for full game state
        import json

        parsed_state = json.loads(text)
        if isinstance(parsed_state, dict):
            game_state = parsed_state
    except:
        # Fallback to treating as city name
        game_state = {"position": text.strip()}

    # Try MeTTa KB first with enhanced context
    advice = metta_best_move(game_state)
    if not advice:
        advice = ask_asi_for_move(game_state, None)

    await ctx.send(
        sender,
        ChatMessage(
            timestamp=datetime.utcnow(),
            msg_id=uuid4(),
            content=[
                TextContent(type="text", text=advice),
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
    ctx.logger.info(
        "Tutor ready at %s (REST on http://127.0.0.1:%s)",
        tutor_agent.address,
        tutor_agent.port,
    )
    ctx.logger.info("MeTTa knowledge graph initialized for Multipoly")


# REST endpoints for frontend already defined at the top of the file


# REST endpoints for frontend
@tutor_agent.on_rest_post("/advise", AdviseRequest, AdviseResponse)
async def rest_advise(ctx: Context, req: AdviseRequest) -> AdviseResponse:
    advice = metta_best_move(req.state)
    source = "metta"

    if not advice:
        advice = ask_asi_for_move(req.state, req.question)
        source = "asi"

    return AdviseResponse(advice=advice, source=source)


@tutor_agent.on_rest_get("/health", HealthResponse)
async def health_check(ctx: Context) -> HealthResponse:
    """Health check endpoint"""
    return HealthResponse(status="healthy", agent="multipoly-tutor")


@tutor_agent.on_rest_post(
    "/knowledge/update", KnowledgeUpdateRequest, KnowledgeUpdateResponse
)
async def update_knowledge(
    ctx: Context, req: KnowledgeUpdateRequest
) -> KnowledgeUpdateResponse:
    """Update MeTTa knowledge graph with new facts"""
    try:
        # Use the knowledge graph's dynamic knowledge addition
        result = _store.add_dynamic_knowledge(
            req.relation, req.subject, req.value
        )

        ctx.logger.info(
            f"Knowledge updated: {req.relation}({req.subject}, {req.value}) - {result}"
        )

        return KnowledgeUpdateResponse(
            success=True,
            message=f"Successfully added knowledge: {result}",
            relation=req.relation,
            subject=req.subject,
            value=req.value,
        )
    except Exception as e:
        ctx.logger.error(f"Failed to update knowledge: {e}")
        return KnowledgeUpdateResponse(
            success=False,
            message=f"Failed to update knowledge: {str(e)}",
            relation=req.relation,
            subject=req.subject,
            value=req.value,
        )


@tutor_agent.on_rest_get(
    "/knowledge/query/{relation}/{subject}", KnowledgeQueryResponse
)
async def query_knowledge(
    ctx: Context, relation: str, subject: str
) -> Dict[str, Any]:
    """Query specific knowledge from MeTTa graph"""
    try:
        # Map relation types to appropriate query methods
        if relation == "token":
            results = _store.query_property_token(subject)
        elif relation == "investment":
            results = _store.query_investment_value(subject)
        elif relation == "risk":
            results = _store.query_risk_level(subject)
        elif relation == "yield":
            results = _store.query_token_yield(subject)
        elif relation == "strategy":
            results = _store.query_strategy(subject)
        else:
            results = []

        return {
            "relation": relation,
            "subject": subject,
            "results": results,
            "count": len(results),
        }
    except Exception as e:
        return {
            "relation": relation,
            "subject": subject,
            "results": [],
            "error": str(e),
        }


# Ensure ASI:One API key is set
ASI_ONE_API_KEY = os.getenv("ASI_ONE_API_KEY")
if not ASI_ONE_API_KEY:
    raise EnvironmentError(
        "Missing ASI_ONE_API_KEY. Set your ASI:One API key in the environment."
    )

# Pass the API key to the chat_completion function if required


if __name__ == "__main__":
    tutor_agent.run()

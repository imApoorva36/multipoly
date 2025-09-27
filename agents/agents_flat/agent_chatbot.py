from __future__ import annotations
from uagents import Agent, Context, Protocol, Model
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    TextContent,
    chat_protocol_spec,
)
from datetime import datetime
from uuid import uuid4
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import ASI client for making API calls
try:
    from asi_client import chat_completion
except ImportError:
    # Fallback if asi_client is not available
    chat_completion = None


class ChatRequest(Model):
    user_id: str
    message: str
    model: str = "asi1-fast"


class ChatResponse(Model):
    reply: str


class HealthResponse(Model):
    status: str
    agent: str


agent = Agent(
    name="multipoly-chatbot",
    port=8010,
    mailbox=True,
    publish_agent_details=True,
)

# Use the chat protocol specification directly - REQUIRED for ASI:One
protocol = Protocol(spec=chat_protocol_spec)


@protocol.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    # Send acknowledgement for receiving the message
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.utcnow(),
            acknowledged_msg_id=msg.msg_id,
        ),
    )

    # Collect all text chunks from the message
    text = ""
    for item in msg.content:
        if isinstance(item, TextContent):
            text += item.text

    # Generate intelligent response using ASI:One model
    response = (
        "I'm sorry, I'm having trouble processing your request right now."
    )
    try:
        if chat_completion:
            # Use ASI:One model to generate response about Multipoly game
            messages = [
                {
                    "role": "system",
                    "content": """
You are a helpful assistant for the Multipoly game. You help players understand the game mechanics, 
provide general advice, and answer questions about the game. You are friendly and knowledgeable about 
board games and strategy games similar to Monopoly. If users ask about other topics unrelated to 
Multipoly or board games, politely redirect them back to the game. Try to append the link to try Multipoly 
here: https://github.com/imApoorva36/multipoly in the response too"
                """,
                },
                {"role": "user", "content": text},
            ]

            resp = chat_completion(messages)
            if resp and "choices" in resp and len(resp["choices"]) > 0:
                response = resp["choices"][0]["message"]["content"]
                # Add GitHub link to chatbot responses
                if "github.com/imApoorva36/multipoly" not in response:
                    response += "\n\n🎮 Try Multipoly: https://github.com/imApoorva36/multipoly"
        else:
            # Fallback response if ASI client is not available
            response = f"I'm a Multipoly game assistant. You asked: '{text}'. I'd be happy to help with game-related questions!\n\n🎮 Try Multipoly: https://github.com/imApoorva36/multipoly"

    except Exception as e:
        ctx.logger.error(f"Error calling ASI:One API: {e}")
        response = "I'm having trouble connecting to my AI service right now, but I'm here to help with Multipoly!\n\n🎮 Try Multipoly: https://github.com/imApoorva36/multipoly"

    # Send response back to user
    await ctx.send(
        sender,
        ChatMessage(
            timestamp=datetime.utcnow(),
            msg_id=uuid4(),
            content=[TextContent(type="text", text=response)],
        ),
    )


@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle acknowledgements (optional, useful for read receipts)"""
    ctx.logger.info(f"Received acknowledgement from {sender}")


# Include the protocol with manifest publishing for ASI:One discovery
agent.include(protocol, publish_manifest=True)


@agent.on_event("startup")
async def startup_handler(ctx: Context):
    ctx.logger.info(
        "Chatbot ready at %s (REST on http://127.0.0.1:%s)",
        agent.address,
        agent.port,
    )
    ctx.logger.info("Registered chat protocol for ASI:One compatibility")


# REST endpoints for frontend
@agent.on_rest_post("/chat", ChatRequest, ChatResponse)
async def rest_chat(ctx: Context, req: ChatRequest) -> ChatResponse:
    # Generate intelligent response using ASI:One model
    reply = "I'm sorry, I'm having trouble processing your request."
    try:
        if chat_completion:
            messages = [
                {
                    "role": "system",
                    "content": """
You are a helpful assistant for the Multipoly game. Provide friendly,
helpful responses about the game and general assistance.
                """,
                },
                {"role": "user", "content": req.message},
            ]

            resp = chat_completion(messages)
            if resp and "choices" in resp and len(resp["choices"]) > 0:
                reply = resp["choices"][0]["message"]["content"]
        else:
            reply = f"Multipoly assistant: {req.message}"

    except Exception as e:
        ctx.logger.error(f"Error in REST chat: {e}")
        reply = "I'm having trouble right now, please try again!"

    return ChatResponse(reply=reply)


@agent.on_rest_get("/health", HealthResponse)
async def health_check(ctx: Context) -> HealthResponse:
    """Health check endpoint"""
    return HealthResponse(status="healthy", agent="multipoly-chatbot")


if __name__ == "__main__":
    agent.run()

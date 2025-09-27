"""
Minimal ASI:One Chat Completions client using OpenAI-compatible schema.
Reads API key from environment ASI_ONE_API_KEY and optional BASE_URL.
"""

from __future__ import annotations
import os
import requests
from typing import Any, Dict, List, Optional

ASI_API_KEY_ENV = "ASI_ONE_API_KEY"
ASI_BASE_URL = os.environ.get("ASI_ONE_BASE_URL", "https://api.asi1.ai/v1")


def chat_completion(
    messages: List[Dict[str, str]],
    model: str = "asi1-fast",
    temperature: float = 0.7,
    tools: Optional[List[Dict[str, Any]]] = None,
    tool_choice: Optional[str | Dict[str, Any]] = None,
    parallel_tool_calls: Optional[bool] = None,
) -> Dict[str, Any]:
    api_key = os.environ.get(ASI_API_KEY_ENV)
    if not api_key:
        raise RuntimeError(
            f"Missing {ASI_API_KEY_ENV}. Set your ASI:One API key in "
            f"environment."
        )
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }
    if tools is not None:
        payload["tools"] = tools
    if tool_choice is not None:
        payload["tool_choice"] = tool_choice
    if parallel_tool_calls is not None:
        payload["parallel_tool_calls"] = parallel_tool_calls
    resp = requests.post(
        f"{ASI_BASE_URL}/chat/completions", json=payload, headers=headers
    )
    resp.raise_for_status()
    return resp.json()

"""
Thin wrapper around MeTTa (hyperon) for a local, evolving knowledge base.
Falls back to an in-memory store if hyperon is not available.
"""

from __future__ import annotations
from typing import Any, Dict, List, Optional
import hashlib
import json


def fingerprint_game_state(state: Dict[str, Any]) -> str:
    """Create a stable hash of the game state for KB lookup/storage."""
    # Sort and convert to string for stable hashing
    state_str = json.dumps(state, sort_keys=True)
    return hashlib.md5(state_str.encode()).hexdigest()


try:
    from hyperon import MeTTa, E, S, V, Atom

    HYPERON_AVAILABLE = True
except Exception:
    MeTTa = None  # type: ignore
    E = S = V = Atom = None  # type: ignore
    HYPERON_AVAILABLE = False


class MeTTaStore:
    def __init__(self) -> None:
        if HYPERON_AVAILABLE:
            self._metta = MeTTa()
        else:
            self._metta = None
            self._triples = []
            self._advice = {}

    def add_fact(self, subject: str, predicate: str, obj: str) -> None:
        if HYPERON_AVAILABLE:
            self._metta.run(f"({predicate} {subject} {obj})")
        else:
            self._triples.append((subject, predicate, obj))

    def load_program(self, program: str) -> None:
        if HYPERON_AVAILABLE:
            self._metta.run(program)
            return
        import re

        for line in program.splitlines():
            line = line.strip()
            if not line or line.startswith(";") or line.startswith("//"):
                continue
            m = re.match(r"^\((\S+)\s+(\S+)\s+(\S+)\)$", line)
            if m:
                p, s, o = m.group(1), m.group(2), m.group(3)
                self._triples.append((s, p, o))

    def upsert_advice(self, state_fp: str, advice: str) -> None:
        if HYPERON_AVAILABLE:
            self._metta.run(f'(hasAdvice {state_fp} "{advice}")')
        else:
            self._advice[state_fp] = advice

    def get_advice(self, state_fp: str) -> Optional[str]:
        if HYPERON_AVAILABLE:
            res = self._metta.run(
                f"! (match &self (hasAdvice {state_fp} $a) $a)"
            )
            if res and res[0]:
                return str(res[0][0])
            return None
        else:
            return self._advice.get(state_fp)

    def query(
        self,
        subject: Optional[str],
        predicate: Optional[str],
        obj: Optional[str],
    ) -> List[Dict[str, str]]:
        if HYPERON_AVAILABLE:

            def part(x: Optional[str]) -> str:
                if x is None:
                    return "$x"
                return x

            pattern = f"({part(predicate)} {part(subject)} {part(obj)})"
            res = self._metta.run(f"! (match &self {pattern} $b)")
            bindings = []
            if res and res[0]:
                for b in res[0]:
                    if hasattr(b, "get_children"):
                        children = b.get_children()
                        d = {}
                        for i, c in enumerate(children):
                            if hasattr(c, "get_name"):
                                d[f"${chr(120+i)}"] = c.get_name()
                            else:
                                d[f"${chr(120+i)}"] = str(c)
                        bindings.append(d)
            return bindings
        else:
            results = []
            for s, p, o in self._triples:
                match = True
                d = {}
                if subject and not (subject.startswith("$") or s == subject):
                    match = False
                if predicate and not (
                    predicate.startswith("$") or p == predicate
                ):
                    match = False
                if obj and not (obj.startswith("$") or o == obj):
                    match = False
                if match:
                    if subject and subject.startswith("$"):
                        d[subject] = s
                    if predicate and predicate.startswith("$"):
                        d[predicate] = p
                    if obj and obj.startswith("$"):
                        d[obj] = o
                    results.append(d)
            return results

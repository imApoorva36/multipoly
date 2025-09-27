"""
MeTTa Knowledge Graph Store for Multipoly Game
Based on SingularityNET MeTTa framework for structured knowledge representation
"""

from __future__ import annotations
from typing import Any, Dict, List, Optional
import hashlib
import json


def fingerprint_game_state(state: Dict[str, Any]) -> str:
    """Create a stable hash of the game state for KB lookup/storage."""
    state_str = json.dumps(state, sort_keys=True)
    return hashlib.md5(state_str.encode()).hexdigest()


try:
    from hyperon import MeTTa, E, S, ValueAtom

    HYPERON_AVAILABLE = True
except Exception:
    MeTTa = None  # type: ignore
    E = S = ValueAtom = None  # type: ignore
    HYPERON_AVAILABLE = False


class MultipolyKnowledgeGraph:
    """MeTTa-based knowledge graph for Multipoly game rules and strategies"""

    def __init__(self) -> None:
        if HYPERON_AVAILABLE:
            self._metta = MeTTa()
            self._initialize_game_knowledge()
        else:
            self._metta = None
            self._fallback_facts = []

    def _initialize_game_knowledge(self):
        """Initialize the MeTTa knowledge graph with Multipoly game rules"""
        if not HYPERON_AVAILABLE:
            return

        # ===== DELHI-THEMED PROPERTY GROUPS AND TOKEN RELATIONSHIPS =====
        # Group A (Historical Monuments & Heritage) - RED tokens
        group_a_places = [
            "Red_Fort",
            "Qutub_Minar",
            "Humayuns_Tomb",
            "India_Gate",
            "Lotus_Temple",
            "Akshardham_Temple",
        ]
        for place in group_a_places:
            self._metta.space().add_atom(
                E(S("hasToken"), S(place), S("token_red"))
            )
            self._metta.space().add_atom(
                E(S("belongsToGroup"), S(place), S("Group_A_Heritage"))
            )

        # Group B (Modern Business & Tech Hubs) - BLUE tokens
        group_b_places = [
            "Connaught_Place",
            "Cyber_City_Gurgaon",
            "Nehru_Place",
            "Karol_Bagh",
            "Lajpat_Nagar",
            "Khan_Market",
        ]
        for place in group_b_places:
            self._metta.space().add_atom(
                E(S("hasToken"), S(place), S("token_blue"))
            )
            self._metta.space().add_atom(
                E(S("belongsToGroup"), S(place), S("Group_B_Business"))
            )

        # Group C (Educational & Cultural Centers) - GREEN tokens
        group_c_places = [
            "Delhi_University",
            "JNU",
            "IIT_Delhi",
            "National_Museum",
            "Pragati_Maidan",
            "Raj_Ghat",
        ]
        for place in group_c_places:
            self._metta.space().add_atom(
                E(S("hasToken"), S(place), S("token_green"))
            )
            self._metta.space().add_atom(
                E(S("belongsToGroup"), S(place), S("Group_C_Education"))
            )

        # Group D (Markets & Entertainment) - YELLOW tokens
        group_d_places = [
            "Chandni_Chowk",
            "Sarojini_Nagar",
            "Dilli_Haat",
            "Select_City_Walk",
            "Hauz_Khas_Village",
            "CP_Metro_Station",
        ]
        for place in group_d_places:
            self._metta.space().add_atom(
                E(S("hasToken"), S(place), S("token_yellow"))
            )
            self._metta.space().add_atom(
                E(S("belongsToGroup"), S(place), S("Group_D_Markets"))
            )

        # ===== TOKEN PROPERTIES =====
        # Each group has 6 properties, each color has 6 tokens (24 total)
        self._metta.space().add_atom(
            E(S("tokenCount"), S("token_red"), ValueAtom("6"))
        )
        self._metta.space().add_atom(
            E(S("tokenCount"), S("token_blue"), ValueAtom("6"))
        )
        self._metta.space().add_atom(
            E(S("tokenCount"), S("token_green"), ValueAtom("6"))
        )
        self._metta.space().add_atom(
            E(S("tokenCount"), S("token_yellow"), ValueAtom("6"))
        )

        # Token yields based on regional economic strength
        self._metta.space().add_atom(
            E(S("yields"), S("token_red"), S("high"))
        )  # Western markets
        self._metta.space().add_atom(
            E(S("yields"), S("token_blue"), S("high"))
        )  # Asian growth
        self._metta.space().add_atom(
            E(S("yields"), S("token_green"), S("medium"))
        )  # Emerging markets
        self._metta.space().add_atom(
            E(S("yields"), S("token_yellow"), S("medium"))
        )  # Mixed regions

        # ===== GAME MECHANICS RULES =====
        # Starting position and movement
        self._metta.space().add_atom(
            E(S("startingPosition"), S("game"), S("start"))
        )
        self._metta.space().add_atom(
            E(S("diceRange"), S("game"), ValueAtom("1-6_VRF_roll"))
        )

        # Token distribution at game start
        self._metta.space().add_atom(
            E(
                S("initialTokens"),
                S("player"),
                ValueAtom("equal_distribution_of_4_token_types"),
            )
        )

        # Property purchase rules
        self._metta.space().add_atom(
            E(
                S("purchaseRule"),
                S("unowned_property"),
                ValueAtom("can_buy_if_landed_on"),
            )
        )
        self._metta.space().add_atom(
            E(
                S("tokenMatching"),
                S("purchase"),
                ValueAtom("same_color_tokens_as_property_color"),
            )
        )
        self._metta.space().add_atom(
            E(
                S("tokenSwapping"),
                S("insufficient_tokens"),
                ValueAtom("can_swap_with_other_token_types"),
            )
        )

        # Staking and rent system
        self._metta.space().add_atom(
            E(
                S("stakingRule"),
                S("owned_property"),
                ValueAtom("can_stake_money_for_rent_income"),
            )
        )
        self._metta.space().add_atom(
            E(
                S("rentSystem"),
                S("property"),
                ValueAtom("generates_income_at_certain_rate"),
            )
        )

        # Special game elements
        self._metta.space().add_atom(
            E(
                S("communityChest"),
                S("mechanism"),
                ValueAtom("DAO_voting_system"),
            )
        )
        self._metta.space().add_atom(
            E(
                S("airdropRule"),
                S("passing_start"),
                ValueAtom("receive_airdrop_every_round"),
            )
        )
        self._metta.space().add_atom(
            E(S("fineSystem"), S("game"), ValueAtom("fines_exist_as_penalty"))
        )

        # AI and chat system
        self._metta.space().add_atom(
            E(
                S("aiTutor"),
                S("feature"),
                ValueAtom("analyzes_and_suggests_moves_via_MeTTa"),
            )
        )
        self._metta.space().add_atom(
            E(
                S("chatRoom"),
                S("feature"),
                ValueAtom("AI_agent_chatbot_available"),
            )
        )

        # ===== STRATEGIC INVESTMENT ADVICE =====
        # Game Phase Strategies (Delhi-themed)
        self._metta.space().add_atom(
            E(
                S("strategy"),
                S("early_game"),
                ValueAtom(
                    "Focus on Heritage sites and Business hubs for stable returns"
                ),
            )
        )
        self._metta.space().add_atom(
            E(
                S("strategy"),
                S("mid_game"),
                ValueAtom(
                    "Balance portfolio across heritage, business, education, and markets"
                ),
            )
        )
        self._metta.space().add_atom(
            E(
                S("strategy"),
                S("late_game"),
                ValueAtom(
                    "Maximize rent from high-traffic locations like CP and India Gate"
                ),
            )
        )

        # Delhi location-specific investment advice based on real factors
        # Group A - Heritage & Monument sites (High tourism value, stable)
        heritage_places = {
            "Red_Fort": "UNESCO World Heritage site - premium tourism investment",
            "Qutub_Minar": "Ancient monument - consistent visitor revenue",
            "Humayuns_Tomb": "Mughal architecture masterpiece - cultural value",
            "India_Gate": "National memorial - high footfall area",
            "Lotus_Temple": "Modern spiritual hub - diverse visitor base",
            "Akshardham_Temple": "World's largest Hindu temple - major attraction",
        }

        for place, advice in heritage_places.items():
            self._metta.space().add_atom(
                E(S("investmentValue"), S(place), ValueAtom(advice))
            )
            self._metta.space().add_atom(
                E(S("riskLevel"), S(place), ValueAtom("low"))
            )

        # Group B - Business & Tech hubs (High commercial value)
        business_places = {
            "Connaught_Place": "Delhi's business heart - premium commercial location",
            "Cyber_City_Gurgaon": "India's tech hub - high growth potential",
            "Nehru_Place": "Electronics market center - steady tech demand",
            "Karol_Bagh": "Commercial shopping district - consistent revenue",
            "Lajpat_Nagar": "Central market area - strong local economy",
            "Khan_Market": "Upscale shopping destination - premium clientele",
        }

        for place, advice in business_places.items():
            self._metta.space().add_atom(
                E(S("investmentValue"), S(place), ValueAtom(advice))
            )
            self._metta.space().add_atom(
                E(S("riskLevel"), S(place), ValueAtom("medium"))
            )

        # Group C - Educational & Cultural centers (Medium yield, stable growth)
        education_places = {
            "Delhi_University": "Premier education hub - stable academic ecosystem",
            "JNU": "Top research university - intellectual property potential",
            "IIT_Delhi": "Engineering excellence - tech innovation center",
            "National_Museum": "Cultural repository - heritage tourism value",
            "Pragati_Maidan": "Exhibition center - event-driven revenue",
            "Raj_Ghat": "Gandhi memorial - historical significance",
        }

        for place, advice in education_places.items():
            self._metta.space().add_atom(
                E(S("investmentValue"), S(place), ValueAtom(advice))
            )
            self._metta.space().add_atom(
                E(S("riskLevel"), S(place), ValueAtom("low-medium"))
            )

        # Group D - Markets & Entertainment (Variable opportunities)
        market_places = {
            "Chandni_Chowk": "Historic bazaar - traditional commerce hub",
            "Sarojini_Nagar": "Fashion market - young demographic appeal",
            "Dilli_Haat": "Cultural market - artisan crafts center",
            "Select_City_Walk": "Modern mall - premium retail destination",
            "Hauz_Khas_Village": "Trendy nightlife - millennial hotspot",
            "CP_Metro_Station": "Transport hub - high passenger volume",
        }

        for place, advice in market_places.items():
            self._metta.space().add_atom(
                E(S("investmentValue"), S(place), ValueAtom(advice))
            )
            self._metta.space().add_atom(
                E(S("riskLevel"), S(place), ValueAtom("medium"))
            )

        # Fine Types and Strategies
        self._metta.space().add_atom(
            E(S("fineType"), S("fine1"), S("one_time"))
        )
        self._metta.space().add_atom(
            E(S("fineType"), S("fine2"), S("recurring"))
        )
        self._metta.space().add_atom(
            E(
                S("avoidance"),
                S("one_time"),
                ValueAtom("pay immediately to avoid penalties"),
            )
        )
        self._metta.space().add_atom(
            E(
                S("avoidance"),
                S("recurring"),
                ValueAtom("negotiate or find alternative route"),
            )
        )

    def query_property_token(self, property_name: str) -> List[str]:
        """Find what token a property has"""
        if not HYPERON_AVAILABLE:
            return []

        property_name = property_name.strip('"')
        query_str = f"!(match &self (hasToken {property_name} $token) $token)"
        results = self._metta.run(query_str)
        print(f"Token query results: {results} for query: {query_str}")

        return (
            [str(r[0]) for r in results if r and len(r) > 0] if results else []
        )

    def query_token_yield(self, token: str) -> List[str]:
        """Find the yield level of a token"""
        if not HYPERON_AVAILABLE:
            return []

        token = token.strip('"')
        query_str = f"!(match &self (yields {token} $yield) $yield)"
        results = self._metta.run(query_str)
        print(f"Yield query results: {results} for query: {query_str}")

        return (
            [str(r[0]) for r in results if r and len(r) > 0] if results else []
        )

    def query_investment_value(self, property_name: str) -> List[str]:
        """Get investment advice for a property"""
        if not HYPERON_AVAILABLE:
            return []

        property_name = property_name.strip('"')
        query_str = (
            f"!(match &self (investmentValue {property_name} $value) $value)"
        )
        results = self._metta.run(query_str)
        print(f"Investment value results: {results} for query: {query_str}")

        return (
            [r[0].get_object().value for r in results if r and len(r) > 0]
            if results
            else []
        )

    def query_strategy(self, game_phase: str) -> List[str]:
        """Get strategy advice for different game phases"""
        if not HYPERON_AVAILABLE:
            return []

        game_phase = game_phase.strip('"')
        query_str = (
            f"!(match &self (strategy {game_phase} $strategy) $strategy)"
        )
        results = self._metta.run(query_str)
        print(f"Strategy query results: {results} for query: {query_str}")

        return (
            [r[0].get_object().value for r in results if r and len(r) > 0]
            if results
            else []
        )

    def query_risk_level(self, property_name: str) -> List[str]:
        """Get risk assessment for a property"""
        if not HYPERON_AVAILABLE:
            return []

        property_name = property_name.strip('"')
        query_str = f"!(match &self (riskLevel {property_name} $risk) $risk)"
        results = self._metta.run(query_str)
        print(f"Risk level results: {results} for query: {query_str}")

        return (
            [r[0].get_object().value for r in results if r and len(r) > 0]
            if results
            else []
        )

    def query_group_cities(self, group_name: str) -> List[str]:
        """Get all cities in a specific group"""
        if not HYPERON_AVAILABLE:
            return []

        group_name = group_name.strip('"')
        query_str = f"!(match &self (belongsToGroup $city {group_name}) $city)"
        results = self._metta.run(query_str)
        print(f"Group cities results: {results} for query: {query_str}")

        return (
            [str(r[0]) for r in results if r and len(r) > 0] if results else []
        )

    def query_token_count(self, token_type: str) -> List[str]:
        """Get available token count for a token type"""
        if not HYPERON_AVAILABLE:
            return []

        token_type = token_type.strip('"')
        query_str = f"!(match &self (tokenCount {token_type} $count) $count)"
        results = self._metta.run(query_str)
        print(f"Token count results: {results} for query: {query_str}")

        return (
            [r[0].get_object().value for r in results if r and len(r) > 0]
            if results
            else []
        )

    def query_game_mechanic(self, mechanic: str) -> List[str]:
        """Query specific game mechanics and rules"""
        if not HYPERON_AVAILABLE:
            return []

        # Define mechanic query mappings
        mechanic_queries = {
            "starting": "!(match &self (startingPosition $game $pos) $pos)",
            "dice": "!(match &self (diceRange $game $range) $range)",
            "tokens": "!(match &self (initialTokens $player $rule) $rule)",
            "purchase": "!(match &self (purchaseRule $type $rule) $rule)",
            "staking": "!(match &self (stakingRule $property $rule) $rule)",
            "airdrop": "!(match &self (airdropRule $trigger $reward) $reward)",
            "community": "!(match &self (communityChest $mech $desc) $desc)",
            "tutor": "!(match &self (aiTutor $feat $desc) $desc)",
        }

        query_str = mechanic_queries.get(mechanic.lower())
        if not query_str:
            return []

        results = self._metta.run(query_str)
        print(f"Game mechanic '{mechanic}' results: {results}")

        # Handle different result types
        output = []
        if results:
            for r in results:
                if r and len(r) > 0:
                    if hasattr(r[0], "get_object"):
                        output.append(r[0].get_object().value)
                    else:
                        output.append(str(r[0]))
        return output

    def analyze_purchase_opportunity(
        self, city: str, player_tokens: Dict[str, int]
    ) -> str:
        """Analyze if a city purchase is viable given player's token portfolio"""
        if not HYPERON_AVAILABLE:
            return "MeTTa not available - basic analysis only"

        # Get city's required token
        required_tokens = self.query_property_token(city)
        if not required_tokens:
            return f"Unknown city: {city}"

        required_token = required_tokens[0]

        # Check if player has required tokens
        available_tokens = player_tokens.get(required_token, 0)

        # Get investment advice
        investment_advice = self.query_investment_value(city)
        risk_level = self.query_risk_level(city)

        advice_text = (
            investment_advice[0] if investment_advice else "no specific advice"
        )
        risk_text = risk_level[0] if risk_level else "unknown risk"

        if available_tokens > 0:
            recommendation = f"✅ CAN PURCHASE: You have {available_tokens} {required_token} tokens"
        else:
            recommendation = f"❌ CANNOT PURCHASE: Need {required_token} tokens (consider token swapping)"

        return (
            f"{city} Analysis:\n"
            f"{recommendation}\n"
            f"Investment Value: {advice_text}\n"
            f"Risk Level: {risk_text}\n"
            f"Required Token: {required_token}"
        )

    def get_strategic_recommendations(self, game_state: Dict[str, Any]) -> str:
        """Get comprehensive strategic recommendations based on current game state"""
        if not HYPERON_AVAILABLE:
            return "MeTTa not available - basic recommendations"

        current_phase = game_state.get("phase", "early_game")
        player_position = game_state.get("position", "start")
        owned_properties = game_state.get("owned_properties", [])

        # Get phase strategy
        phase_strategy = self.query_strategy(current_phase)
        strategy_text = (
            phase_strategy[0] if phase_strategy else "no specific strategy"
        )

        # Analyze current position if not at start
        position_analysis = ""
        if player_position != "start":
            position_analysis = self.get_best_move_advice(player_position)

        # Portfolio analysis
        portfolio_text = (
            f"Owned Properties: {len(owned_properties)} properties"
        )
        if owned_properties:
            # Analyze portfolio diversity
            groups = set()
            for prop in owned_properties:
                prop_tokens = self.query_property_token(prop)
                if prop_tokens:
                    # Map tokens to groups
                    token = prop_tokens[0]
                    if token == "token_red":
                        groups.add("Group_A")
                    elif token == "token_blue":
                        groups.add("Group_B")
                    elif token == "token_green":
                        groups.add("Group_C")
                    elif token == "token_yellow":
                        groups.add("Group_D")

            portfolio_text += f" across {len(groups)} different groups"

        return (
            f"🎯 Strategic Analysis:\n\n"
            f"Phase Strategy ({current_phase}): {strategy_text}\n\n"
            f"Portfolio: {portfolio_text}\n\n"
            f"Current Position Analysis:\n{position_analysis}"
        )

    def get_best_move_advice(self, current_position: str) -> str:
        """Get comprehensive move advice based on current position"""
        if not HYPERON_AVAILABLE:
            return "MeTTa not available - using basic advice"

        # Get token for current position
        tokens = self.query_property_token(current_position)
        if not tokens:
            return f"No information available for position {current_position}"

        token = tokens[0]

        # Get yield information
        yields = self.query_token_yield(token)
        if not yields:
            return f"Position {current_position} has token {token} but yield unknown"

        yield_level = yields[0]

        # Get investment value
        investment_advice = self.query_investment_value(current_position)
        investment_text = (
            investment_advice[0] if investment_advice else "no specific advice"
        )

        # Get risk level
        risk_info = self.query_risk_level(current_position)
        risk_text = risk_info[0] if risk_info else "unknown risk"

        return (
            f"Position {current_position}: Token {token} yields {yield_level} returns. "
            f"Investment analysis: {investment_text}. Risk level: {risk_text}. "
            f"Recommendation: {'Strong buy' if yield_level == 'high' else 'Consider carefully'}."
        )

    def add_dynamic_knowledge(
        self, relation: str, subject: str, obj_value: str
    ):
        """Add new knowledge to the graph dynamically"""
        if not HYPERON_AVAILABLE:
            self._fallback_facts.append((relation, subject, obj_value))
            return f"Added to fallback: {relation}({subject}, {obj_value})"

        if isinstance(obj_value, str) and not obj_value.startswith('"'):
            # For string values, use ValueAtom
            atom_value = ValueAtom(obj_value)
        else:
            # For symbolic values, use S
            atom_value = S(obj_value)

        self._metta.space().add_atom(E(S(relation), S(subject), atom_value))
        return f"Added to MeTTa: {relation}({subject}, {obj_value})"

    def load_program(self, program: str) -> None:
        """Load MeTTa program from string"""
        if HYPERON_AVAILABLE:
            self._metta.run(program)


# For backward compatibility
class MeTTaStore(MultipolyKnowledgeGraph):
    """Backward compatible alias"""

    def add_fact(self, subject: str, predicate: str, obj: str) -> None:
        """Backward compatibility method"""
        self.add_dynamic_knowledge(predicate, subject, obj)

    def query(
        self,
        subject: Optional[str],
        predicate: Optional[str],
        obj: Optional[str],
    ) -> List[Dict[str, str]]:
        """Backward compatibility query method"""
        if not HYPERON_AVAILABLE:
            return []

        # Convert to MeTTa query format
        if predicate == "hasToken" and obj is None:
            return [
                {"$t": token}
                for token in self.query_property_token(subject or "")
            ]
        elif predicate == "yields" and obj is None:
            return [
                {"$y": yield_val}
                for yield_val in self.query_token_yield(subject or "")
            ]

        return []

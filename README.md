# 🎯 Multipoly - Delhi Edition

> A blockchain-powered multiplayer board game set in Delhi, featuring AI agents, NFT properties, and real-time strategy gameplay.

## 🚀 **Live Demo**

**🌐 Main Application**: [https://multipoly.onrender.com](https://multipoly.onrender.com)

## 📋 **Table of Contents**

- [🎮 Game Overview](#-game-overview)
- [🔗 API Endpoints](#-api-endpoints)
- [🏛️ Game Rules](#-game-rules)
- [🏗️ Project Architecture](#-project-architecture)
- [🛠️ Development Setup](#-development-setup)
- [🤖 AI Agents](#-ai-agents)
- [⛓️ Blockchain Integration](#-blockchain-integration)
- [📱 Frontend](#-frontend)

## 🎮 **Game Overview**

Multipoly is a modern take on the classic board game, set in the vibrant city of Delhi. Players navigate through 24 iconic Delhi locations, collect themed tokens, and build their property empire using blockchain technology and AI-powered assistance.

### **🌟 Key Features**

- **24 Delhi Locations**: From Red Fort to Cyber City Gurgaon
- **4 Token Types**: Red (Heritage), Blue (Business), Green (Education), Yellow (Entertainment)
- **AI Agents**: Smart chatbot and game tutor
- **Blockchain Integration**: NFT properties and token economics
- **Real-time Multiplayer**: WebRTC-powered gameplay

---

## 🔗 **API Endpoints**

### **🏥 Health & Info**

```bash
# Check application health
GET https://multipoly.onrender.com/health

# Get agent information
GET https://multipoly.onrender.com/agents/info

# Check individual agents
GET https://multipoly.onrender.com/agents/chatbot/health
GET https://multipoly.onrender.com/agents/tutor/health
```

### **🤖 Chat Agent**

**Purpose**: General assistance, game help, and casual conversation

```bash
# Simple chat (via API proxy)
POST https://multipoly.onrender.com/api/chat
Content-Type: application/json

{
  "user_id": "player123",
  "message": "How do I play Multipoly?",
  "model": "asi1-fast"
}

# Direct agent access (advanced)
POST https://multipoly.onrender.com/agents/chatbot/chat
```

**Response Example**:

```json
{
  "reply": "Welcome to Multipoly! You'll move around Delhi's 24 locations, collect tokens, and build your property empire. Would you like me to explain the token system?"
}
```

### **🧠 Tutor Agent**

**Purpose**: Strategic game advice, move recommendations, and knowledge queries

```bash
# Get game advice (via API proxy)
POST https://multipoly.onrender.com/api/advise
Content-Type: application/json

{
  "user_id": "player123",
  "state": {
    "position": 5,
    "tokens": {"red": 3, "blue": 2, "green": 1},
    "properties": ["Red_Fort", "Connaught_Place"],
    "cash": 1500
  },
  "question": "Should I buy this property?",
  "force_refresh": false
}

# Direct agent access
POST https://multipoly.onrender.com/agents/tutor/advise
```

**Response Example**:

```json
{
  "advice": "Based on your current position at India Gate and having 3 red tokens, I recommend purchasing this property. It complements your Red Fort investment and creates a strong heritage portfolio.",
  "confidence": 0.85,
  "reasoning": "Strategic token synergy analysis",
  "source": "metta"
}
```

### **📚 Knowledge Management**

```bash
# Update game knowledge
POST https://multipoly.onrender.com/agents/tutor/update_knowledge
Content-Type: application/json

{
  "relation": "owns",
  "subject": "player123",
  "value": "Red_Fort"
}

# Query knowledge
POST https://multipoly.onrender.com/agents/tutor/query_knowledge
Content-Type: application/json

{
  "relation": "owns",
  "subject": "player123"
}
```

---

## 🏛️ **Game Rules**

### **🎯 Game Board - 24 Delhi Locations**

#### **🔴 Group A - Historical Monuments & Heritage (Red Tokens)**

_High tourism value, stable returns_

1. **Red Fort** 🏰 - UNESCO World Heritage site
2. **Qutub Minar** 🗼 - Ancient monument
3. **Humayun's Tomb** 🕌 - Mughal architecture masterpiece
4. **India Gate** 🏛️ - National memorial
5. **Lotus Temple** 🪷 - Modern spiritual hub
6. **Akshardham Temple** 🛕 - World's largest Hindu temple

#### **🔵 Group B - Modern Business & Tech Hubs (Blue Tokens)**

_High commercial value, growth potential_

1. **Connaught Place (CP)** 🏢 - Delhi's business heart
2. **Cyber City Gurgaon** 💻 - India's tech hub
3. **Nehru Place** 🔌 - Electronics market center
4. **Karol Bagh** 🏪 - Commercial shopping district
5. **Lajpat Nagar** 🛍️ - Central market area
6. **Khan Market** 🥘 - Upscale shopping destination

#### **🟢 Group C - Educational & Cultural Centers (Green Tokens)**

_Medium yield, stable academic ecosystem_

1. **Delhi University** 📚 - Premier education hub
2. **JNU** 🎓 - Top research university
3. **IIT Delhi** ⚙️ - Engineering excellence center
4. **National Museum** 🏛️ - Cultural repository
5. **Pragati Maidan** 🏗️ - Exhibition center
6. **Raj Ghat** 🕯️ - Gandhi memorial

#### **🟡 Group D - Markets & Entertainment (Yellow Tokens)**

_Variable opportunities, trendy locations_

1. **Chandni Chowk** 🛒 - Historic bazaar
2. **Sarojini Nagar** 👕 - Fashion market
3. **Dilli Haat** 🎨 - Cultural market
4. **Select City Walk** 🏬 - Modern mall
5. **Hauz Khas Village** 🍻 - Trendy nightlife
6. **CP Metro Station** 🚇 - Transport hub

### **⚙️ Core Game Mechanics**

#### **🎯 Victory Conditions**

- **Token Master**: Collect 15+ tokens of any combination
- **Property Mogul**: Own 8+ properties across different groups
- **Delhi Emperor**: Achieve 10,000+ cash + property value

#### **🎲 Turn Structure**

1. **Roll Dice**: Move 1-6 spaces around the board
2. **Location Action**: Buy property, collect tokens, or pay rent
3. **Token Collection**: Earn themed tokens based on location
4. **Strategic Decisions**: Use AI tutor for optimal moves

#### **💰 Economic System**

- **Starting Cash**: ₹2,000
- **Property Prices**: ₹100-800 (varies by location)
- **Rent System**: Increases with token ownership
- **Token Bonuses**: Multipliers for complete sets

#### **🎴 Special Cards**

- **Delhi Metro**: Fast travel across the city
- **Traffic Jam**: Skip turn, but collect ₹200
- **Monsoon**: All players collect rain bonus
- **Festival**: Visit any heritage site for free

---

## 🏗️ **Project Architecture**

```
multipoly/
├── agents/                 # AI Agents & Backend
│   ├── agents_flat/       # Agent implementations
│   │   ├── agent_chatbot.py
│   │   ├── agent_tutor.py
│   │   └── metta_store.py
│   ├── frontend/          # Flask templates
│   ├── start.py          # Main application entry
│   └── requirements.txt
├── frontend/              # Next.js Frontend
│   ├── src/app/          # Pages and components
│   ├── components/       # UI components
│   └── package.json
├── multipoly_contract/    # Smart Contracts
│   ├── contracts/        # Solidity contracts
│   └── ignition/        # Deployment scripts
├── vrf/                  # VRF for randomness
└── flow_schedular/       # Cadence contracts
```

### **🔗 Service Communication**

```
Frontend (Next.js) ←→ Flask API ←→ AI Agents
       ↓                    ↓
 Blockchain (Ethereum)  Knowledge Graph
```

---

## 🛠️ **Development Setup**

### **📋 Prerequisites**

- Node.js 18+
- Python 3.9-3.12
- Git

### **🚀 Quick Start**

```bash
# Clone repository
git clone https://github.com/imApoorva36/multipoly.git
cd multipoly

# Setup AI Agents
cd agents
pip install -r requirements.txt
cp example.env .env  # Add your API keys
python start.py

# Setup Frontend (separate terminal)
cd ../frontend
npm install
npm run dev

# Setup Smart Contracts (separate terminal)
cd ../multipoly_contract
npm install
npx hardhat compile
```

### **🔧 Environment Variables**

**agents/.env**:

```env
ASI_ONE_API_KEY=your_asi_one_api_key_here
CHAT_URL=http://127.0.0.1:8010/chat
TUTOR_URL=http://127.0.0.1:8011/advise
```

**frontend/.env.local**:

```env
NEXT_PUBLIC_HUDDLE_PROJECT_ID=your_huddle_project_id
NEXT_PUBLIC_HUDDLE_API_KEY=your_huddle_api_key
```

---

## 🤖 **AI Agents**

### **🗣️ Chatbot Agent (Port 8010)**

- **Purpose**: General assistance and casual conversation
- **Model**: ASI:One integration
- **Features**: Game rules explanation, friendly conversation
- **Endpoint**: `/agents/chatbot/chat`

### **🧠 Tutor Agent (Port 8011)**

- **Purpose**: Strategic game advice and knowledge management
- **Features**: MeTTa knowledge graph, move analysis, property recommendations
- **Endpoints**: `/agents/tutor/advise`, `/agents/tutor/update_knowledge`

### **📊 Knowledge Graph**

- **Framework**: MeTTa (optional, falls back to basic logic)
- **Purpose**: Store game state, player relationships, strategic patterns
- **Data**: Player properties, token ownership, optimal strategies

---

## ⛓️ **Blockchain Integration**

### **🏠 Property NFTs**

- **Standard**: ERC-721
- **Network**: Ethereum (testnet)
- **Features**: Unique Delhi location NFTs, ownership verification

### **🪙 Game Tokens**

- **Standard**: ERC-20
- **Types**: Red, Blue, Green, Yellow tokens
- **Utility**: Property discounts, special abilities

### **🎲 Verifiable Randomness**

- **Service**: Chainlink VRF
- **Purpose**: Fair dice rolls, card draws
- **Contract**: `DiceRoll.sol`

---

## 📱 **Frontend**

### **⚡ Tech Stack**

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Real-time**: WebRTC (Huddle SDK)
- **State**: React Query

### **🎮 Features**

- **Room Creation**: Private game lobbies
- **Video Chat**: Built-in communication
- **Real-time Sync**: Live game state updates
- **Mobile Responsive**: Play on any device

---

## 🧪 **Testing the API**

### **Quick Health Check**

```bash
curl https://multipoly.onrender.com/health
```

### **Chat with AI**

```bash
curl -X POST https://multipoly.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain the red token strategy"}'
```

### **Get Game Advice**

```bash
curl -X POST https://multipoly.onrender.com/api/advise \
  -H "Content-Type: application/json" \
  -d '{
    "state": {"position": 3, "tokens": {"red": 2}},
    "question": "Should I buy Red Fort?"
  }'
```

---

## 🎯 **Game Strategy Tips**

1. **🔴 Heritage Strategy**: Focus on red tokens for stable, high-value properties
2. **🔵 Tech Growth**: Blue tokens offer highest growth potential
3. **🌈 Diversification**: Mix token types to reduce risk
4. **🚇 Transport**: Use Delhi Metro cards strategically
5. **🤝 Negotiation**: Trade properties to complete token sets

---

## 📝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

---

## 📄 **License**

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 **Authors**

- ......... [@imApoorva36](https://github.com/imApoorva36)

---

**🎮 Ready to play? Visit [https://multipoly.onrender.com](https://multipoly.onrender.com) and start your Delhi property empire!**

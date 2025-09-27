# 🎯 Multipoly

> A submission for **ETHGlobal New Delhi 2025** by **Team Multipoly**

## 🌟 Overview

Multipoly is a blockchain-powered multiplayer board game set in Delhi, combining **AI agents**, **NFT properties**, and **real-time strategy gameplay**. Players explore 24 iconic Delhi locations, collect themed tokens, and build their property empires with **Web3** mechanics and **AI-powered assistance**.

**🌐 Live Demo**: [https://multipoly.onrender.com](https://multipoly.onrender.com)

---

## 🎯 Sponsor Tracks (ETHGlobal New Delhi 2025)

* **Flow Blockchain** → Cadence smart contracts for game mechanics
* **ASI Alliance** → AI agents for strategy assistance
* **ENS** → Decentralized identity integration

---

## ⚡ Key Features

* **24 Delhi Locations**: Heritage sites, business hubs, education centers, entertainment districts
* **4 Token Categories**: 🔴 Heritage | 🔵 Business | 🟢 Education | 🟡 Entertainment
* **AI Agents**: Gameplay assistant & strategic tutor
* **NFT Properties**: ERC-721 landmarks
* **Real-Time Multiplayer**: WebRTC-powered sync and chat
* **Verifiable Randomness**: Chainlink VRF for dice rolls

---

## 📊 Architecture

<div align="center">

![Architecture Diagram](./arch_diag.jpg)

*Multipoly combines Web3, AI, and real-time communication in a distributed architecture.*

</div>  

---

## 🛠️ Tech Stack

### AI & Agents (ASI Alliance)

* **Chatbot Agent**: General help with ASI:One models
* **Tutor Agent**: Move analysis & strategic advice
* **Knowledge Graph**: MeTTa-powered game state

### Blockchain

* **Flow**: Game state persistence, yield tokens, decentralized room management
* **Ethereum**: ERC-721 NFTs, Hardhat contracts
* **Chainlink VRF**: Fair dice rolls

### Core

* **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
* **Backend**: Python Flask API, CORS-enabled
* **Real-time**: WebRTC (video + gameplay sync)

---

## 🚀 Installation & Setup

### Prerequisites

* Node.js 18+
* Python 3.9–3.12
* Git

### Quick Start

```bash
# Clone repository
git clone https://github.com/imApoorva36/multipoly.git
cd multipoly

# Setup AI Agents
cd agents
pip install -r requirements.txt
cp example.env .env   # add API keys
python start.py

# Setup Frontend (new terminal)
cd ../frontend
npm install
npm run dev

# Setup Smart Contracts (new terminal)
cd ../multipoly_contract
npm install
npx hardhat compile
npx hardhat deploy
```

### Environment Variables

**agents/.env**

```env
ASI_ONE_API_KEY=your_asi_one_api_key_here
CHAT_URL=http://127.0.0.1:8010/chat
TUTOR_URL=http://127.0.0.1:8011/advise
```

**frontend/.env.local**

```env
NEXT_PUBLIC_HUDDLE_PROJECT_ID=your_huddle_project_id
NEXT_PUBLIC_HUDDLE_API_KEY=your_huddle_api_key
```

---

## 🔗 API Endpoints

### Health & Status

```bash
GET https://multipoly.onrender.com/health
GET https://multipoly.onrender.com/agents/info
```

### AI Chat Agent

```bash
POST https://multipoly.onrender.com/api/chat
{
  "user_id": "player123",
  "message": "How do I win at Multipoly?"
}
```

### Tutor Agent (Strategic Advice)

```bash
POST https://multipoly.onrender.com/api/advise
{
  "user_id": "player123",
  "state": {"position": 5, "tokens": {"red": 3}},
  "question": "Should I buy Red Fort?"
}
```

---

## 🎯 Game Rules

### Victory Conditions

* **Token Master**: Collect 15+ tokens
* **Property Mogul**: Own 8+ properties across groups
* **Delhi Emperor**: ₹10,000+ net worth

### Locations & Tokens

* 🔴 **Heritage**: Red Fort, Qutub Minar, Humayun's Tomb, India Gate, Lotus Temple, Akshardham
* 🔵 **Business**: Connaught Place, Cyber City Gurgaon, Nehru Place, Karol Bagh, Lajpat Nagar, Khan Market
* 🟢 **Education**: Delhi University, JNU, IIT Delhi, National Museum, Pragati Maidan, Raj Ghat
* 🟡 **Entertainment**: Chandni Chowk, Sarojini Nagar, Dilli Haat, Select City Walk, Hauz Khas, CP Metro Station

### Core Mechanics

* **Starting Cash**: ₹2,000
* **Property Prices**: ₹100–₹800
* **Turn**: Roll dice → Move → Buy/Pay → Collect tokens
* **Special Cards**: Delhi Metro (travel), Traffic Jam, Monsoon, Festival Bonus

---

## 🏗️ Project Structure

```
multipoly/
├── agents/              # AI backend (Flask + agents)
├── frontend/            # Next.js frontend
├── multipoly_contract/  # Ethereum smart contracts
├── vrf/                 # Chainlink VRF contracts
├── flow_schedular/      # Flow blockchain integration
├── arch_diag.jpg        # Architecture diagram
└── README.md            # Project guide
```

---

## 👥 Team

| Name                | GitHub                                           | Role                         |
| ------------------- | ------------------------------------------------ | ---------------------------- |
| **Fahim Ahmed**     | [@ahmedfahim21](https://github.com/ahmedfahim21) | Smart Contracts & Full-Stack |
| **Apoorva Agrawal** | [@imApoorva36](https://github.com/imApoorva36)   | AI Agents & Backend          |
| **Vedant Tarale**   | [@VedantTarale](https://github.com/VedantTarale) | Frontend & UI/UX             |
| **J Hariharan**     | [@j-hariharan](https://github.com/j-hariharan)   | Blockchain & VRF             |

---

## 📝 Contributing

We welcome community contributions!

* Fork the repo
* Create a branch (`git checkout -b feature-name`)
* Commit (`git commit -m "Add feature"`)
* Push & open a PR

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

### 🎮 Experience the future of board games with Web3 & AI

[![Play Now](https://img.shields.io/badge/🎯_PLAY_NOW-multipoly.onrender.com-success?style=for-the-badge\&logo=gamepad)](https://multipoly.onrender.com)

**Built with ❤️ at ETHGlobal New Delhi 2025**

</div>
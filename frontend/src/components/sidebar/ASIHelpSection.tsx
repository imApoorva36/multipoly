import { useState } from "react";
import { Button } from "../ui/button";
import ReactMarkdown from "react-markdown"
import { BotMessageSquare } from "lucide-react"

interface ASIHelpSectionProps {
  getGameState: () => unknown;
}

export default function ASIHelpSection({  }: ASIHelpSectionProps) {
  const [chatInput, setChatInput] = useState("");
  const [response, setResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);

  async function handleChat() {
    setChatLoading(true);
    setResponse("...");
    try {
      const res = await fetch("https://multipoly.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput, user_id:"u1",model:"asi1-fast" })
      });
      const data = await res.json();
      setResponse(data.reply || "No response");
    } catch {
      setResponse("Error contacting AI");
    }
    setChatLoading(false);
  }

  function getExampleGameState () {
    return {
        "state": {
            "landed_at": { name: "Red Fort", color: "Red", price: 200 },
            "balances": { "Amethyst": 3, "Emerald": 1, "Golden": 0, "Ruby": 250 },
            holdings: [
                { name: "Taj Mahal", color: "Blue", price: 300 },
                { name: "Canaught Place", color: "Green", price: 220 },
                { name: "Qutub Minar", color: "Yellow", price: 180 },
            ]
        },
        question: "What should be my next moove?"
    }
  }

  async function handleGetHelp() {
    setHelpLoading(true);
    setResponse("...");
    try {
      const gameState = getExampleGameState();
      
      const res = await fetch("https://multipoly.onrender.com/api/advise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameState)
      });
      const data = await res.json();
      setResponse(data.advice || "No response");
    } catch {
      setResponse("Error contacting AI");
    }
    setHelpLoading(false);
  }

  return (
    <div className="p-4 border rounded bg-muted/30 mt-4">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 border-2 border-myellow bg-gradient-to-br from-myellow/20 to-myellow/30 rounded-none flex items-center justify-center">
                <BotMessageSquare className="h-5 w-5 text-mred" />
            </div>
            <div>
                <h2 className="text-2xl text-slate-800 font-bold">ASI Help</h2>
            </div>
        </div>
        <div className="mb-4 space-y-2 pb-7 border-b-2 border-dashed border-black">
            <textarea
                placeholder="Type your message here..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 border-2 p-2 border-black rounded-none bg-white/80 focus:bg-white focus:border-mgreen outline-none transition-all duration-300 text-base w-full"
                rows={4}
            />
            <Button
                onClick={handleChat}
                className={`border-2 border-black rounded-none font-bold px-6 transition-all duration-300 ${chatLoading? "bg-mgreen/70" : "bg-mgreen"} hover:bg-mgreen/80 text-white hover:shadow-lg w-full`}
                disabled={chatLoading}
            >
                {chatLoading ? "Asking..." : "Ask AI"}
            </Button>
        </div>
        <div className="pt-2">
            <Button
                onClick={handleGetHelp}
                className={`border-2 border-black rounded-none font-bold px-6 transition-all duration-300 ${helpLoading? "bg-mgreen/70" : "bg-mgreen"} hover:bg-mgreen/80 text-white hover:shadow-lg w-full`}
                disabled={helpLoading}
            >
                {helpLoading ? "Requesting..." : "Request Game Advice"}
            </Button>
        </div>
        <div className="mt-10 border-2 border-black p-3">
            <h3 className="text-base font-semibold mb-2">AI Response:</h3>
            <ReactMarkdown>{response}</ReactMarkdown>
        </div>
    </div>
  );
}

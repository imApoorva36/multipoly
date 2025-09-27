"use client";

import { Badge } from "@/components/ui/badge";

interface ConnectionStatusProps {
  status: string;
  playerCount: number;
}

export function ConnectionStatus({ status, playerCount }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          color: "mgreen",
          icon: "🟢",
          pulse: true,
          text: "Connected"
        };
      case "connecting":
        return {
          color: "myellow",
          icon: "🟡",
          pulse: false,
          text: "Connecting..."
        };
      case "disconnected":
        return {
          color: "mred",
          icon: "🔴",
          pulse: false,
          text: "Disconnected"
        };
      default:
        return {
          color: "mgray",
          icon: "⚫",
          pulse: false,
          text: "Unknown"
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div 
          className={`w-3 h-3 border-2 border-black rounded-none transition-colors ${
            config.pulse ? 'animate-pulse' : ''
          } bg-${config.color}`} 
        />
        <Badge 
          variant={status === "connected" ? "default" : "secondary"}
          className={`rounded-none border-2 font-bold transition-colors bg-${config.color}/20 text-${config.color} border-${config.color}`}
        >
          {config.icon} {config.text}
        </Badge>
      </div>
      
      <div className="h-8 w-px bg-slate-300" />
      
      <Badge 
        variant="secondary" 
        className="bg-mblue/20 text-mblue border-2 border-mblue rounded-none font-bold"
      >
        👥 {playerCount} {playerCount === 1 ? 'player' : 'players'}
      </Badge>
    </div>
  );
}
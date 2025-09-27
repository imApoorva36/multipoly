"use client";

import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoomHeaderProps {
  roomId: string;
  connectionState: string;
  onLeaveRoom: () => void;
  onLogout: () => void;
}

export function RoomHeader({ roomId, connectionState, onLeaveRoom, onLogout }: RoomHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-none p-6 shadow-xl">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">ETHGlobal New Delhi room</h1>
        <p className="text-slate-600 text-sm">Room ID: <span className="font-mono font-semibold">{roomId}</span></p>
      </div>
      
      <div className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-none p-4 shadow-xl flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 border-2 border-black rounded-none transition-colors ${
              connectionState === "connected" ? "bg-mgreen animate-pulse" : "bg-myellow"
            }`} 
          />
          <Badge 
            variant={connectionState === "connected" ? "default" : "secondary"}
            className={`rounded-none border-2 font-bold transition-colors ${
              connectionState === "connected" 
                ? "bg-mgreen/20 text-mgreen border-mgreen" 
                : "bg-myellow/20 text-myellow border-myellow"
            }`}
          >
            {connectionState || "disconnected"}
          </Badge>
        </div>
        
        <div className="h-8 w-px bg-slate-300" />
        
        <div className="flex gap-2">
          <Button 
            onClick={onLeaveRoom} 
            variant="outline" 
            size="sm"
            className="gap-2 bg-white hover:bg-mred hover:text-white border-2 border-black rounded-none hover:border-mred transition-all duration-300 font-semibold"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Leave
          </Button>
          <Button 
            onClick={onLogout} 
            variant="secondary"
            size="sm"
            className="bg-white hover:bg-slate-100 border-2 border-black rounded-none transition-all duration-300 font-semibold"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
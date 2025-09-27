"use client";

import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface RoomHeaderProps {
  roomId: string;
  connectionState: string;
  onLeaveRoom: () => void;
  onLogout: () => void;
}

export function RoomHeader({ roomId, connectionState, onLeaveRoom, onLogout }: RoomHeaderProps) {
  return (
    <div className="mb-8 w-full">
      <div className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-none p-6 shadow-xl">
        <div className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Image src="/eth-delhi.png" alt="ETH Logo" width={50} height={50} />
              <h1 className="text-3xl font-bold text-slate-800">ETHGlobal New Delhi room</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <p className="text-slate-600 text-sm">Room ID: <span className="font-mono font-semibold">{roomId}</span></p>
              
              <div className="flex items-center gap-2">
                <div 
                  className={`w-3 h-3 border-2 border-black rounded-none transition-colors ${
                    connectionState === "connected" ? "bg-mgreen animate-pulse" : "bg-myellow"
                  }`} 
                />
                <Badge 
                  variant="outline"
                  className={`rounded-none border-2 font-bold transition-colors ${
                    connectionState === "connected" 
                      ? "text-mgreen" 
                      : "text-myellow"
                  }`}
                >
                  {connectionState || "disconnected"}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Button 
              onClick={onLeaveRoom} 
              variant="outline" 
              size="sm"
              className="gap-2 bg-white hover:bg-mred hover:text-white border-2 border-black rounded-none hover:border-mred transition-all duration-300 font-semibold w-full"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Leave Room
            </Button>
            <Button 
              onClick={onLogout} 
              variant="secondary"
              size="sm"
              className="bg-white hover:bg-slate-100 border-2 border-black rounded-none transition-all duration-300 font-semibold w-full"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
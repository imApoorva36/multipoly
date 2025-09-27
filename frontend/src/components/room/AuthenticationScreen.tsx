"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";

interface AuthenticationScreenProps {
  roomId: string;
  onLogin: () => void;
}

export function AuthenticationScreen({ roomId, onLogin }: AuthenticationScreenProps) {
  const handleLogin = () => {
    onLogin();
    // Focus email input after a short delay
    setTimeout(() => {
      (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
    }, 150);
  };

  return (
    <div className="w-full flex flex-row justify-center items-center h-screen relative overflow-hidden">
      <Image
        src="/delhi.png"
        alt="Background"
        fill
        style={{ objectFit: "cover", zIndex: 0 }}
        priority
        className="opacity-80"
      />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-slate-900/20" />
      
      <div className="z-10 flex flex-col items-center justify-center w-full h-full px-4">
        <div className="bg-white/95 backdrop-blur-md border-2 border-black rounded-none p-8 shadow-2xl max-w-2xl mx-auto transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex h-14 items-center justify-center border-2 border-mred bg-gradient-to-r from-mred/10 to-mred/20 rounded-none px-6 text-xl text-mred font-bold mb-8 animate-pulse">
            🔐 Room Access Required
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-slate-800 text-5xl font-bold mb-4 tracking-tight">
              Join Room <span className="text-mblue">{roomId}</span>
            </h1>
            <p className="text-slate-600 text-xl leading-relaxed">
              Connect with other players in this multiplayer room
            </p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-mgreen/10 border-2 border-mgreen/30 rounded-none">
              <div className="w-12 h-12 bg-mgreen/20 border-2 border-mgreen rounded-none flex items-center justify-center">
                <Users className="w-6 h-6 text-mgreen" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Real-time Multiplayer</p>
                <p className="text-sm text-slate-600">Play with friends across the globe</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-mblue/10 border-2 border-mblue/30 rounded-none">
              <div className="w-12 h-12 bg-mblue/20 border-2 border-mblue rounded-none flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-mblue" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Live Chat</p>
                <p className="text-sm text-slate-600">Communicate with other players</p>
              </div>
            </div>
          </div>
          
          <Button
            size="lg"
            onClick={handleLogin}
            className="bg-gradient-to-r from-mgreen to-mgreen/80 hover:from-mgreen/80 hover:to-mgreen text-white border-2 border-black rounded-none w-full py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            Authenticate & Join Room
          </Button>
        </div>
        
      </div>
    </div>
  );
}
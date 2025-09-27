"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface ShareRoomCardProps {
  roomId: string;
  shareUrl: string;
  hasCopied: boolean;
  onCopy: () => void;
  onEnterRoom: () => void;
  onCreateAnother: () => void;
}

export function ShareRoomCard({
  roomId,
  shareUrl,
  hasCopied,
  onCopy,
  onEnterRoom,
  onCreateAnother,
}: ShareRoomCardProps) {
  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-mgreen bg-mgreen/20 rounded-none flex items-center justify-center">
            <span className="text-mgreen text-sm font-bold">✓</span>
          </div>
          Share this room
        </CardTitle>
        <CardDescription className="text-slate-600 text-xs">
          Send this link to teammates so they can jump straight into the lobby.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">Room ID</p>
          <div className="p-3 bg-mgray border-2 border-black rounded-none text-sm font-mono break-all text-slate-800">
            {roomId}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">Shareable link</p>
          <div className="flex gap-2">
            <Input 
              value={shareUrl} 
              readOnly 
              className="font-mono text-xs border-2 border-black rounded-none bg-white/80"
            />
            <Button 
              onClick={onCopy} 
              variant="secondary" 
              disabled={!shareUrl}
              className={`border-2 border-black rounded-none font-bold transition-all duration-300 ${
                hasCopied 
                  ? 'bg-mgreen text-white hover:bg-mgreen/80' 
                  : 'bg-myellow text-black hover:bg-myellow/80'
              }`}
            >
              {hasCopied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        <Separator className="bg-black/20" />

        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-mpurple hover:bg-mpurple/80 text-white border-2 border-black rounded-none font-bold py-5 text-lg shadow-lg hover:shadow-xl transition-all duration-300" 
            onClick={onEnterRoom}
          >
            Enter Room
          </Button>
          <Button 
            className="flex-1 bg-white hover:bg-mgray text-black border-2 border-black rounded-none font-bold py-5 transition-all duration-300" 
            variant="ghost" 
            onClick={onCreateAnother}
          >
            Create Another
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

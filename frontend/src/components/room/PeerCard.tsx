"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRemotePeer } from "@huddle01/react";

interface Metadata {
  name: string;
  image: string;
}

interface PeerCardProps {
  peerId?: string;
  metadata?: Metadata;
  isLocal?: boolean;
}

export function PeerCard({ peerId, metadata: externalMetadata, isLocal = false }: PeerCardProps) {
  const { metadata: remotePeerMetadata } = useRemotePeer<Metadata>({ 
    peerId: peerId || "" 
  });
  
  const metadata = externalMetadata || remotePeerMetadata || {
    name: isLocal ? "You" : "User",
    image: `https://api.dicebear.com/9.x/identicon/svg?seed=${peerId || (isLocal ? "local" : "user")}`
  };

  const imageUrl = metadata.image && metadata.image.trim() !== "" 
    ? metadata.image 
    : `https://api.dicebear.com/9.x/identicon/svg?seed=${peerId || (isLocal ? "local" : "user")}`;

  return (
    <Card className="transition-all hover:shadow-lg hover:scale-[1.02] border-2 border-black rounded-none bg-white/95 backdrop-blur-sm group">
      <CardContent className="flex items-center space-x-4 p-4">
        <div className="relative">
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-mgreen/20 to-mblue/20 border-2 border-black rounded-none group-hover:shadow-md transition-all">
            <Image 
              className="w-10 h-10 transition-transform group-hover:scale-110" 
              src={imageUrl} 
              alt={`${metadata.name} avatar`} 
              width={40} 
              height={40}
              unoptimized
            />
          </div>
          <div 
            className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
              isLocal ? "bg-mblue" : "bg-mgreen"
            }`} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-slate-800 truncate">{metadata.name}</p>
          <p className="text-xs text-slate-600 font-mono uppercase tracking-wider">
            {isLocal ? "You" : "Player"}
          </p>
        </div>
        
        <Badge 
          variant="secondary" 
          className={`rounded-none border-2 font-bold transition-all ${
            isLocal
              ? "bg-mblue/20 text-mblue border-mblue hover:bg-mblue/30" 
              : "bg-mgreen/20 text-mgreen border-mgreen hover:bg-mgreen/30"
          }`}
        >
          {isLocal ? "You" : "Online"}
        </Badge>
      </CardContent>
    </Card>
  );
}
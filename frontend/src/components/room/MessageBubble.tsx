"use client";

import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "@/hooks/useHuddleRoom";
import { useRemotePeer } from "@huddle01/react";

interface Metadata {
  name: string;
  image: string;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  // Get the remote peer's metadata to show their wallet address
  const { metadata } = useRemotePeer<Metadata>({ 
    peerId: isOwn ? "" : message.from 
  });

  // Determine the display name - use metadata name (wallet address) if available
  const getDisplayName = () => {
    if (isOwn) return "You";
    
    // If we have metadata with the wallet address, use it
    if (metadata?.name) {
      return metadata.name;
    }
    
    // Fallback to shortened peer ID
    return message.from.slice(0, 6) + "...";
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center gap-2 mb-1">
          <Badge 
            variant="outline" 
            className={`text-xs rounded-none border-2 font-bold transition-all ${
              isOwn 
                ? "bg-mblue/20 text-mblue border-mblue" 
                : "bg-mgreen/20 text-mgreen border-mgreen"
            }`}
          >
            {getDisplayName()}
          </Badge>
          
          {message.label && (
            <Badge 
              variant="secondary" 
              className="text-xs rounded-none border border-myellow/40 bg-myellow/20 text-slate-700"
            >
              {message.label}
            </Badge>
          )}
          
          <span className="text-xs text-slate-500 font-mono ml-auto">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        <div 
          className={`p-4 border-2 border-black rounded-none shadow-sm transition-all group-hover:shadow-md ${
            isOwn 
              ? "bg-mblue/10 text-slate-800 ml-4" 
              : "bg-white text-slate-800 mr-4"
          }`}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.payload}
          </p>
        </div>
      </div>
    </div>
  );
}
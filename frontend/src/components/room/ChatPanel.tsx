"use client";

import { ChatBubbleLeftIcon } from "@heroicons/react/16/solid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/hooks/useHuddleRoom";
import { MessageBubble } from "./MessageBubble";

interface ChatPanelProps {
  messages: ChatMessage[];
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  connectionState: string;
  isSendingMessage: boolean;
  isFetchingToken: boolean;
  isJoiningRoom: boolean;
  tokenError?: Error | null;
  joinError?: Error | null;
  peerId?: string;
}

export function ChatPanel({
  messages,
  newMessage,
  onMessageChange,
  onSendMessage,
  connectionState,
  isSendingMessage,
  isFetchingToken,
  isJoiningRoom,
  tokenError,
  joinError,
  peerId
}: ChatPanelProps) {
  const getStatusMessage = () => {
    if (isFetchingToken) return "🔄 Connecting to chat...";
    if (isJoiningRoom) return "🚀 Joining room...";
    if (connectionState === "connected") return "💬 Chat with other players in real-time";
    return "⚠️ Reconnecting to chat...";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Card className="border-2 border-black rounded-none bg-white/90 backdrop-blur-sm shadow-xl h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-mblue bg-gradient-to-br from-mblue/20 to-mblue/30 rounded-none flex items-center justify-center">
              <ChatBubbleLeftIcon className="h-5 w-5 text-mblue" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-800">Game Chat</CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                {getStatusMessage()}
              </CardDescription>
            </div>
          </div>
          
          <Badge 
            variant={connectionState === "connected" ? "default" : "secondary"}
            className={`rounded-none border-2 font-bold transition-all ${
              connectionState === "connected" 
                ? "bg-mgreen/20 text-mgreen border-mgreen animate-pulse" 
                : "bg-myellow/20 text-myellow border-myellow"
            }`}
          >
            {connectionState === "connected" ? "🟢 Live" : "⚡ Connecting"}
          </Badge>
        </div>
        
        {(tokenError || joinError) && (
          <div className="bg-mred/20 border-2 border-mred rounded-none p-3 mt-2">
            <p className="text-sm text-mred font-bold">
              ❌ {(tokenError ?? joinError)?.message}
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Messages Container */}
        <div className="flex-1 min-h-0 overflow-hidden border-2 border-black rounded-none bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="h-full overflow-y-auto p-4 scroll-smooth">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id} 
                    message={message} 
                    isOwn={message.from === peerId}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center p-8">
                  <div className="w-16 h-16 border-2 border-mblue bg-mblue/10 rounded-none flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftIcon className="h-8 w-8 text-mblue" />
                  </div>
                  <p className="text-xl font-bold text-slate-700 mb-2">No messages yet</p>
                  <p className="text-sm text-slate-500">
                    🎮 Be the first to start the conversation!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Input */}
        <div className="flex gap-3">
          <Input
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={connectionState !== "connected"}
            className="flex-1 border-2 border-black rounded-none bg-white/80 focus:bg-white focus:border-mblue transition-all duration-300 text-base"
          />
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim() || connectionState !== "connected" || isSendingMessage}
            className={`border-2 border-black rounded-none font-bold px-6 transition-all duration-300 ${
              connectionState === "connected"
                ? "bg-mgreen hover:bg-mgreen/80 text-white hover:shadow-lg"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isSendingMessage ? "📤 Sending..." : "📤 Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
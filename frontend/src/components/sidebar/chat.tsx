import { ChatMessage, useHuddleRoom } from "@/hooks/useHuddleRoom"
import { Button } from "../ui/button"
import { useParams } from "next/navigation"
import { Metadata } from "@/app/room/[id]/page"
import { useLocalPeer, useRemotePeer } from "@huddle01/react"
import { Badge } from "../ui/badge"
import { ChatBubbleLeftIcon } from "@heroicons/react/16/solid"
import { Input } from "../ui/input"
import { useEffect, useState } from "react"
import { useWallets } from "@privy-io/react-auth"
import { Separator } from "../ui/separator"



// Tab content components
export default function ChatSection () {

    const params = useParams<{ id: string }>();
    const roomId = params.id
    const {
        state,
        messages,
        peerIds,
        leaveRoom,
        joinRoom,
        isJoiningRoom,
        joinError,
        sendMessage,
        isSendingMessage,
        isFetchingToken,
        tokenError,
      } = useHuddleRoom(roomId);
    const { updateMetadata, metadata, peerId } = useLocalPeer<Metadata>()
    const [newMessage, setNewMessage] = useState("");

    const {wallets} = useWallets()
    const wallet = wallets[0]

      useEffect(() => {
        if (!roomId) {
          return;
        }
    
        if (state === "connected") {
          if (metadata?.name) return
          updateMetadata({
            name: wallet.address.slice(0, 6) + "..." + wallet.address.slice(-4),
            image: "https://api.dicebear.com/9.x/identicon/svg?seed=" + wallet.address
          })
          return
        }
    
        if (isFetchingToken || isJoiningRoom) {
          return;
        }
    
        joinRoom().catch((error) => {
          console.error("Failed to join room", error);
        });
      }, [roomId, state, isJoiningRoom, isFetchingToken, joinRoom]);

    function useResolveMetadata (peerId: string) {
        let m: Metadata = {name: "", image: "https://api.dicebear.com/9.x/identicon/svg?seed=0"}
        if (peerId) {
        const remotePeer = useRemotePeer<Metadata>({peerId})
        m = remotePeer.metadata || m
        }
        else {
        const localPeer = useLocalPeer<Metadata>()
        m = localPeer.metadata || m
        }

        if (!m.name) {
        m = {...m, name: "User"}
        }

        return m
    }

    function MessageBubble ({ message }: { message: ChatMessage }) {
      const metadata = useResolveMetadata(message.from == peerId ? "" : message.from)
      const isOwn = message.from === peerId;
      
      return (
        <div 
          className={`flex flex-col space-y-1 ${isOwn ? "items-end" : "items-start"}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {message.timestamp.toLocaleTimeString()}
            </span>
            <Badge 
              variant="outline" 
              className={`rounded-none border text-xs font-medium ${
                isOwn ? "border-mred text-mred bg-mred/10" : "border-slate-400 text-slate-600 bg-slate-100"
              }`}
            >
              {isOwn ? "You" : metadata.name}
            </Badge>
          </div>
          <div 
            className={`max-w-[80%] rounded-none p-3 border-2 ${
              isOwn 
                ? "bg-mred/10 border-mred text-slate-800" 
                : "bg-slate-100 border-slate-300 text-slate-800"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.payload}
            </p>
          </div>
        </div>
      )
    }

    const handleSendMessage = async () => {
        try {
        await sendMessage(newMessage);
        setNewMessage("");
        } catch (error) {
        alert((error as Error).message);
        }
    };


    return (
        <div className="h-[90vh] flex flex-col">
          <hr className="border-black border-1 m-3"/>
            <div className="p-4 pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-mred bg-gradient-to-br from-mred/20 to-mred/30 rounded-none flex items-center justify-center">
                            <ChatBubbleLeftIcon className="h-5 w-5 text-mred" />
                        </div>
                        <div>
                            <h2 className="text-2xl text-slate-800 font-bold">Game Chat</h2>
                        </div>
                    </div>
                    
                    <Badge 
                        variant={state === "connected" ? "default" : "secondary"}
                        className={`rounded-none border-2 font-bold transition-all ${
                        state === "connected" 
                            ? "bg-mgreen/20 text-mgreen border-mgreen animate-pulse" 
                            : "bg-myellow/20 text-myellow border-myellow"
                        }`}
                    >
                        {state === "connected" ? "Live" : "Connecting"}
                    </Badge>
                </div>
                
                {(tokenError || joinError) && (
                    <div className="bg-mred/20 border-2 border-mred rounded-none p-3 mt-2">
                        <p className="text-sm text-mred font-bold">
                            ❌ {(tokenError ?? joinError)?.message}
                        </p>
                    </div>
                )}
            </div>
            
            <div className="flex-1 flex flex-col space-y-4 p-4 pt-0 h-full overflow-hidden">
              {/* Messages Container */}
              <div className="flex-1 overflow-hidden border-2 border-black rounded-none bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="h-full overflow-y-auto p-4 scroll-smooth" id="messages-container">
                  {messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      <div className="text-center p-8">
                        <div className="w-16 h-16 border-2 border-mred bg-mred/10 rounded-none flex items-center justify-center mx-auto mb-4">
                          <ChatBubbleLeftIcon className="h-8 w-8 text-mred" />
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
              <div className="flex gap-3 mt-auto">
                <Input
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={state !== "connected"}
                  className="flex-1 border-2 border-black rounded-none bg-white/80 focus:bg-white focus:border-mred transition-all duration-300 text-base"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || state !== "connected" || isSendingMessage}
                  className={`border-2 border-black rounded-none font-bold px-6 transition-all duration-300 ${
                    state === "connected"
                      ? "bg-mgreen hover:bg-mgreen/80 text-white hover:shadow-lg"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {isSendingMessage ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
        </div>
    )
}
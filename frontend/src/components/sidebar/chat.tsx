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



// Tab content components
export default function ChatSection () {

    const params = useParams<{ id: string }>();
    let roomId = params.id
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
    let { updateMetadata, metadata, peerId } = useLocalPeer<Metadata>()
    const [newMessage, setNewMessage] = useState("");

    let {wallets} = useWallets()
    let wallet = wallets[0]

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

    function resolveMetadata (peerId: string) {
        let m: Metadata = {name: "", image: "https://api.dicebear.com/9.x/identicon/svg?seed=0"}
        if (peerId) {
        let remotePeer = useRemotePeer<Metadata>({peerId})
        m = remotePeer.metadata || m
        }
        else {
        let localPeer = useLocalPeer<Metadata>()
        m = localPeer.metadata || m
        }

        if (!m.name) {
        m = {...m, name: "User"}
        }

        return m
    }

    function MessageBubble ({ message }: { message: ChatMessage }) {
      let metadata = resolveMetadata(message.from == peerId ? "" : message.from)
      return (
        <div key={message.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {message.from == peerId ? "You" : metadata.name}
              </Badge>
              {message.label && (
                <Badge variant="secondary" className="text-xs">
                  {message.label}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm bg-background p-2 rounded border">
            {message.payload}
          </p>
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
        <div className="p-4 space-y-4">
            <Badge variant="outline" className="inline-flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${state === "connected" ? "bg-green-500" : "bg-yellow-500"}`} />
                {state ?? "disconnected"}
            </Badge>
            <div className="h-64 overflow-y-auto border rounded-md p-4 bg-muted/20">
            {messages.length > 0 ? (
                <div className="space-y-3">
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                    <ChatBubbleLeftIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Start a conversation!</p>
                </div>
                </div>
            )}
            </div>


            <div className="flex gap-2">
            <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                }
                }}
                className="flex-1"
            />
            <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || state !== "connected" || isSendingMessage}
            >
                {isSendingMessage ? "Sending..." : "Send"}
            </Button>
            </div>
        </div>
    )
}
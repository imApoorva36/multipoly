import { Metadata } from "@/app/room/[id]/page"
import { useHuddleRoom } from "@/hooks/useHuddleRoom"
import { useLocalPeer, useRemotePeer } from "@huddle01/react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { UserIcon } from "@heroicons/react/16/solid"
import { useWallets } from "@privy-io/react-auth"
import { getPfp } from "@/lib/utils"

export default function PlayersSection ({ participants }: { participants: string[] }) {
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

    function useResolveMetadata (peerId?: string) {
        let name = ""
        if (peerId) {
            const remotePeer = useRemotePeer<Metadata>({peerId})
            name = remotePeer?.metadata?.name || ""
        }
        else {
            const localPeer = useLocalPeer<Metadata>()
            name = localPeer?.metadata?.name || ""
        }

        return name
    }

    function PeerCard ({ id, isLocal = false }: { id?: string, isLocal?: boolean }) {
        // Default image in case metadata.image is empty
        let name = useResolveMetadata(isLocal ? "" : id)
        const imageSrc = getPfp(name)

        if (name == "") return <></>
        
        return (
            <Card className="border-2 border-black rounded-none bg-white/90 backdrop-blur-sm hover:shadow-md transition-all">
                <CardContent className="flex items-center space-x-4 p-4">
                    <div className="w-12 h-12 border-2 rounded-none overflow-hidden">
                        <img 
                            className="w-12 h-12 object-cover" 
                            src={imageSrc} 
                            alt={name || "Player"} 
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-slate-800">
                            {name}
                            {isLocal && <span className="text-mblue ml-1">(You)</span>}
                        </p>
                        <p className="text-xs text-slate-500">
                            {isLocal ? 'You are currently active in this room' : 'Active player'}
                        </p>
                    </div>
                    <Badge 
                        variant={isLocal ? "default" : "secondary"}
                        className={`rounded-none border-2 ${isLocal ? 'bg-mblue/20 text-mblue border-mblue' : 'bg-mgreen/20 text-mgreen border-mgreen'}`}
                    >
                        {isLocal ? 'You' : 'Online'}
                    </Badge>
                </CardContent>
            </Card>
        );
    }
    
    const totalPlayers = peerIds.length + 1;

    return (
        <div className="h-[90vh] flex flex-col">
            <hr className="border-black border-1 m-3"/>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-mgreen bg-gradient-to-br from-mgreen/20 to-mgreen/30 rounded-none flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-mgreen" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-slate-800">Players</CardTitle>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <Badge 
                            variant="secondary" 
                            className="bg-myellow/20 text-myellow border-2 border-myellow rounded-none font-bold text-base px-3 py-1"
                        >
                            {totalPlayers} online
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-3">
                    {/* Remote players */}
                    {participants.length > 0 ? (
                        participants.map((id, i) => (
                            <PeerCard 
                                key={id} 
                                id={id}
                                isLocal={i==0}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <div className="w-16 h-16 border-2 border-slate-300 bg-slate-100 rounded-none flex items-center justify-center mx-auto mb-4">
                                <UserIcon className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-lg font-semibold text-slate-600 mb-1">Waiting for players</p>
                            <p className="text-sm text-slate-500">Other players will appear here when they join</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </div>
    )
}
import { Metadata } from "@/app/room/[id]/page"
import { useHuddleRoom } from "@/hooks/useHuddleRoom"
import { useLocalPeer, useRemotePeer } from "@huddle01/react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { UserIcon } from "@heroicons/react/16/solid"
import { useWallets } from "@privy-io/react-auth"
import Image from "next/image"

export default function PlayersSection () {
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

    function PeerCard ({ peerId, isLocal = false }: { peerId?: string, isLocal?: boolean }) {
        const metadata = useResolveMetadata(peerId || '')
        // Default image in case metadata.image is empty
        const imageSrc = metadata.image || "/world-map.png"

        return (
            <Card className="border-2 border-black rounded-none bg-white/90 backdrop-blur-sm hover:shadow-md transition-all">
                <CardContent className="flex items-center space-x-4 p-4">
                    <div className="w-12 h-12 border-2 rounded-none overflow-hidden">
                        <Image 
                            className="w-full h-full object-cover" 
                            src={imageSrc} 
                            alt={metadata.name || "Player"} 
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-slate-800">
                            {metadata.name}
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
                        {isLocal ? '👤 You' : '🎮 Online'}
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
                    {/* Local player always first */}
                    <div className="relative">
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-mblue rounded-full" />
                        <PeerCard isLocal={true} />
                    </div>
                    
                    {/* Remote players */}
                    {peerIds.length > 0 ? (
                        peerIds.map((id) => (
                            <PeerCard 
                                key={id} 
                                peerId={id}
                                isLocal={false}
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
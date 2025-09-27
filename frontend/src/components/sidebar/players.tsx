import { Metadata } from "@/app/room/[id]/page"
import { useHuddleRoom } from "@/hooks/useHuddleRoom"
import { useLocalPeer, useRemotePeer } from "@huddle01/react"
import { useParams } from "next/navigation"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { UserIcon } from "@heroicons/react/16/solid"
import Image from "next/image"
import { getPfp } from "@/lib/utils"

// Component for a single peer card
function LocalPeerCard() {
    const { metadata } = useLocalPeer<Metadata>()
    const name = metadata?.name || ""
    const imageSrc = getPfp(name)
    
    if (!name) return null // Don't render if no name
    
    return (
        <Card className="border-2 border-black rounded-none bg-white/90 backdrop-blur-sm hover:shadow-md transition-all">
            <CardContent className="flex items-center space-x-4 p-4">
                <div className="w-12 h-12 border-2 rounded-none overflow-hidden">
                    <Image 
                        className="w-12 h-12 object-cover" 
                        src={imageSrc} 
                        alt={name || "Player"} 
                        width={48}
                        height={48}
                        unoptimized
                    />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-slate-800">
                        {name}
                        <span className="text-mblue ml-1">(You)</span>
                    </p>
                    <p className="text-xs text-slate-500">
                        You are currently active in this room
                    </p>
                </div>
                <Badge 
                    variant="default"
                    className="rounded-none border-2 bg-mblue/20 text-mblue border-mblue"
                >
                    You
                </Badge>
            </CardContent>
        </Card>
    );
}

// Component for a remote peer card
function RemotePeerCard({ peerId }: { peerId: string }) {
    const remotePeer = useRemotePeer<Metadata>({ peerId })
    const name = remotePeer?.metadata?.name || ""
    const imageSrc = getPfp(name)
    
    if (!name) return null // Don't render if no name
    
    return (
        <Card className="border-2 border-black rounded-none bg-white/90 backdrop-blur-sm hover:shadow-md transition-all">
            <CardContent className="flex items-center space-x-4 p-4">
                <div className="w-12 h-12 border-2 rounded-none overflow-hidden">
                    <Image 
                        className="w-12 h-12 object-cover" 
                        src={imageSrc} 
                        alt={name || "Player"} 
                        width={48}
                        height={48}
                        unoptimized
                    />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-slate-800">
                        {name}
                    </p>
                    <p className="text-xs text-slate-500">
                        Active player
                    </p>
                </div>
                <Badge 
                    variant="secondary"
                    className="rounded-none border-2 bg-mgreen/20 text-mgreen border-mgreen"
                >
                    Online
                </Badge>
            </CardContent>
        </Card>
    );
}

export default function PlayersSection ({ participants }: { participants: string[] }) {
    const params = useParams<{ id: string }>();
    const roomId = params.id
    const {
        peerIds
    } = useHuddleRoom(roomId);
    const { peerId } = useLocalPeer<Metadata>()
    
    // Calculate total players (remote + local)
    const totalPlayers = peerIds.length + 1;
    
    // Empty state if no players
    const noPlayersView = (
        <div className="text-center py-8 text-slate-500">
            <div className="w-16 h-16 border-2 border-slate-300 bg-slate-100 rounded-none flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-600 mb-1">Waiting for players</p>
            <p className="text-sm text-slate-500">Other players will appear here when they join</p>
        </div>
    );

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
                    {/* Always show local player first */}
                    <LocalPeerCard />
                    
                    {/* Then show remote players */}
                    {participants && participants.length > 0 ? (
                        participants
                            .filter(id => id !== peerId && id) // Filter out local peer and any falsy values
                            .map(id => (
                                <RemotePeerCard key={id} peerId={id} />
                            ))
                    ) : noPlayersView}
                </div>
            </CardContent>
        </div>
    )
}
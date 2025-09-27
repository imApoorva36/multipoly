import { Metadata } from "@/app/room/[id]/page"
import { useHuddleRoom } from "@/hooks/useHuddleRoom"
import { useLocalPeer, useRemotePeer } from "@huddle01/react"
import { useWallets } from "@privy-io/react-auth"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"

export default function PlayersSection () {
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

    function RemotePeerCard ({ peerId }: { peerId: string }) {
        let metadata = resolveMetadata(peerId)

        return (
            <Card className="transition-all hover:shadow-md">
                <CardContent className="flex items-center space-x-3 p-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                    <img className="w-10 h-10 p-2" src={metadata.image} alt="" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{metadata.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">Participant</p>
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    {peerId ? "Online" : "You"}
                </Badge>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Players</h3>
            <Badge variant="secondary">{peerIds.length + 1} connected</Badge>
            <div className="space-y-3">
                <RemotePeerCard peerId=""/>
                {peerIds.length > 0 ? (
                peerIds.map((peerId) => (
                    <RemotePeerCard key={peerId} peerId={peerId} />
                ))
                ): null}
            </div>
        </div>
    )
}
import { Metadata } from "@/components/sidebar/play"
import { useRemotePeer } from "@huddle01/react"
import { useEnsAvatar, useEnsName } from "wagmi"

export default function wagmiHelper (externalMetadata: Metadata, peerId: string, isLocal: boolean) {
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

    const { data: name } = useEnsName({ address: metadata.name  as Hex || "", chainId: 545 })
    const { data: avatar } = useEnsAvatar({ name: name || "", chainId: 545 })

    return { name: name || metadata.name, image: avatar || imageUrl }
}
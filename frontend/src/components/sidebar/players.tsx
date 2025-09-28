// Define metadata interface locally to include walletAddress
interface Metadata {
  name: string;
  image: string;
  walletAddress?: string; // Optional wallet address
}
import { useLocalPeer, useRemotePeer } from "@huddle01/react"
import { useWallets } from "@privy-io/react-auth"
import { tokens } from "@/app/room/[id]/page"
import { createWalletClient, custom, Hex } from "viem"
import { testnet } from "@/providers/WalletProvider"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { UserIcon } from "@heroicons/react/16/solid"
import { getPfp } from "@/lib/utils"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Check, Plus } from "lucide-react"

// Component for a single peer card
function LocalPeerCard() {
    const { metadata } = useLocalPeer<Metadata>()
    const { wallets } = useWallets()
    const wallet = wallets?.[0]
    
    const name = metadata?.name || ""
    const imageSrc = getPfp(name)
    const walletAddress = wallet?.address || ""
    
    // Format wallet address for display (0x1234...5678)
    const formatAddress = (address: string) => {
        if (!address) return "";
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };
    
    return (
        <Card className="border-2 border-black rounded-none bg-white/90 backdrop-blur-sm hover:shadow-md transition-all">
            <CardContent className="flex items-center space-x-4 p-4">
                <div className="relative">
                    <div className="w-12 h-12 border-2 rounded-none overflow-hidden bg-gradient-to-br from-mblue/20 to-mblue/30">
                        <Image 
                            className="w-12 h-12 object-cover" 
                            src={imageSrc} 
                            alt={name || "Player"} 
                            width={48}
                            height={48}
                            unoptimized
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border border-white rounded-full bg-mblue"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">
                        {name || "You"}
                    </p>
                    {walletAddress && (
                        <p className="text-xs font-mono text-slate-500 truncate">
                            {formatAddress(walletAddress)}
                        </p>
                    )}
                </div>
                <Badge 
                    variant="default"
                    className="rounded-none border-2 bg-mblue/20 text-mblue border-mblue whitespace-nowrap"
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
    const name = remotePeer?.metadata?.name || `Player-${peerId.substring(0, 4)}`
    const imageSrc = getPfp(name)
    
    // Format wallet address for display (0x1234...5678)
    const formatAddress = (address: string) => {
        if (!address) return "";
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };
    
    return (
        <Card className="border-2 border-black rounded-none bg-white/90 backdrop-blur-sm hover:shadow-md transition-all">
            <CardContent className="flex items-center space-x-4 p-4">
                <div className="relative">
                    <div className="w-12 h-12 border-2 rounded-none overflow-hidden bg-gradient-to-br from-mgreen/20 to-mgreen/30">
                        <Image 
                            className="w-12 h-12 object-cover" 
                            src={imageSrc} 
                            alt={name || "Player"} 
                            width={48}
                            height={48}
                            unoptimized
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border border-white rounded-full bg-mgreen"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">
                        {remotePeer?.metadata?.walletAddress ? 
                            formatAddress(remotePeer.metadata.walletAddress) : 
                            "Wallet connecting..."}
                    </p>
                </div>
                <Badge 
                    variant="secondary"
                    className="rounded-none border-2 bg-mgreen/20 text-mgreen border-mgreen whitespace-nowrap"
                >
                    Online
                </Badge>
            </CardContent>
        </Card>
    );
}

export default function PlayersSection ({ participants }: { participants: string[] }) {
    const { peerId, updateMetadata, metadata } = useLocalPeer<Metadata>()
    const { wallets } = useWallets()
    const wallet = wallets?.[0]
    
    const [tokensAdded, setTokensAdded] = useState(false)
    
    // Update metadata with wallet address when connected
    useEffect(() => {
        if (wallet?.address && metadata) {
            updateMetadata({
                ...metadata,
                walletAddress: wallet.address
            });
        }
    }, [wallet?.address, metadata, updateMetadata]);
    
    // Calculate total players (remote + local)
    const totalPlayers = participants.length + 1; // +1 for local peer
    
    // Function to add tokens to wallet
    async function addTokens() {
        if (tokensAdded || !wallet) return;
        
        try {
            const provider = await wallet.getEthereumProvider();
            const walletClient = createWalletClient({
                account: wallet.address as Hex,
                chain: testnet,
                transport: custom(provider)
            });
            
            await Promise.all(tokens.map(token => walletClient.watchAsset(token)));
            setTokensAdded(true);
        } catch (error) {
            console.error("Error adding tokens:", error);
        }
    }
    
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
                <div className="space-y-4">
                    {/* Always show local player first */}
                    <div className="relative">
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-mblue rounded-full" />
                        <LocalPeerCard />
                    </div>
                    
                    {/* Then show remote players */}
                    {participants && participants.length > 0 ? (
                        <div className="space-y-3">
                            {participants.map(id => {
                                // Skip rendering self in the remote peers list
                                if (id === peerId || !id) return null;
                                return <RemotePeerCard key={id} peerId={id} />;
                            })}
                        </div>
                    ) : (
                        <div>{noPlayersView}</div>
                    )}
                    
                    {/* Add tokens button */}
                    <div className="pt-4 border-t border-slate-200">
                        <Button
                            onClick={addTokens}
                            disabled={!wallet || tokensAdded} 
                            variant="default" 
                            className="w-full border-2 border-black rounded-none font-bold bg-mgreen hover:bg-mgreen/80 disabled:opacity-60 disabled:bg-gray-300 flex items-center justify-center gap-2"
                        >
                            {tokensAdded ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Tokens Added
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Add Game Tokens
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </div>
    )
}
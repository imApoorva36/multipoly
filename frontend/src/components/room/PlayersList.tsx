"use client";

import { UserIcon } from "@heroicons/react/16/solid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PeerCard } from "./PeerCard";
import { Button } from "../ui/button";
import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { createWalletClient, custom, Hex } from "viem";
import { testnet } from "@/providers/WalletProvider";
import { tokens } from "@/app/page";
import { Check, Plus } from "lucide-react";

interface Metadata {
  name: string;
  image: string;
}

interface PlayersListProps {
  peerIds: string[];
  localPeerMetadata?: Metadata;
  connectionState: string;
}

export function PlayersList({ peerIds, localPeerMetadata }: PlayersListProps) {
  const totalPlayers = peerIds.length + 1;

    const [ tokensAdded, setTokensAdded ] = useState(false)
    const {wallets} = useWallets()
    const wallet = wallets[0]

    async function addTokens () {
      if (tokensAdded) return
  
      const p = await wallet.getEthereumProvider()
      const wc = createWalletClient({
        account: wallet.address as Hex,
        chain: testnet,
        transport: custom(p)
      })
  
      try {
        await Promise.all(tokens.map(token => wc.watchAsset(token)))
      } catch {}
      finally {
        setTokensAdded(true)
      }
    }
  
  return (
    <Card className="border-2 border-black rounded-none bg-white/90 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-mgreen bg-gradient-to-br from-mgreen/20 to-mgreen/30 rounded-none flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-mgreen" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-800">Players</CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Active participants in this room
              </CardDescription>
            </div>
          </div>
          
          <div className="text-right gap-2 flex flex-row items-center">
            <Button onClick={addTokens} variant="bordered" className="cursor-pointer bg-mgreen text-white border-2 border-mgreen rounded-none font-bold text-base px-3 py-1 mr-2 hover:bg-mgreen/80 transition-all disabled:cursor-not-allowed flex items-center gap-2">
                {tokensAdded ?
                  <>
                    <Check className="h-4 w-4" />
                    Tokens Added
                  </>
                  :
                  <>
                    <Plus className="h-4 w-4" />
                    Add Tokens
                  </>
                }
              </Button>
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
            <PeerCard 
              metadata={localPeerMetadata}
              isLocal={true}
            />
          </div>
          
          {/* Remote players */}
          {peerIds.length > 0 ? (
            peerIds.map((peerId) => (
              <PeerCard 
                key={peerId} 
                peerId={peerId}
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
    </Card>
  );
}
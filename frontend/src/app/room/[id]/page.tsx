"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { useHuddleRoom } from "@/hooks/useHuddleRoom";
import { useLocalPeer } from "@huddle01/react";

// Room Components
import { RoomHeader } from "@/components/room/RoomHeader";
import { ChatPanel } from "@/components/room/ChatPanel";
import { PlayersList } from "@/components/room/PlayersList";
import { AuthenticationScreen } from "@/components/room/AuthenticationScreen";
import { useViem } from "@/providers/ViemProvider"

import MultipolyAbi from "@/abi/Multipoly.json"
import { testnet } from "@/providers/WalletProvider"
import { Hex, WatchAssetParams } from "viem"
import { string_to_num } from "@/lib/utils"

export interface Metadata {
  name: string
  image: string
}

interface PlayerPos {
  user_account: string;
  game_id: number;
  position: number
}

interface PlayerProperty {
  nft_id: number
  stake_amount: number,
  address: string,
  exists: boolean
}

export const tokens = [
  {
    type: "ERC20",
    options: {
      address: process.env.NEXT_PUBLIC_AMETHYST,
      decimals: 18,
      symbol: 'AMTY',
    },
  },
  {
    type: "ERC20",
    options: {
      address: process.env.NEXT_PUBLIC_EMRALD,
      decimals: 18,
      symbol: 'EMRD',
    },
  },
  {
    type: "ERC20",
    options: {
      address: process.env.NEXT_PUBLIC_GOLDEN,
      decimals: 18,
      symbol: 'GLDN',
    },
  },
  {
    type: "ERC20",
    options: {
      address: process.env.NEXT_PUBLIC_RUBY,
      decimals: 18,
      symbol: 'RUBY',
    },
  },
] as WatchAssetParams[]

function getRoomIdParam(param: string | string[] | undefined): string | null {
  if (!param) return null;
  if (Array.isArray(param)) return param[0] ?? null;
  return param;
}

export default function RoomPage() {
  const { ready, authenticated, logout, login } = usePrivy();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  const { wallets } = useWallets();
  const wallet = wallets[0];
  const { updateMetadata, metadata, peerId } = useLocalPeer<Metadata>();
  const roomId = useMemo(() => getRoomIdParam(params?.id), [params?.id]);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

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
    sendData
  } = useHuddleRoom(roomId);

  const { walletClient, publicClient } = useViem()

  useEffect(() => {
    
    async function getGameState () {
      if (!publicClient || !wallet) return;

      console.log([string_to_num(roomId || ""), wallet.address as Hex])
      
      const data = await publicClient.readContract({
        address: process.env.NEXT_PUBLIC_MULTIPOLY as Hex,
        abi: MultipolyAbi,
        functionName: "getGameState",
        args: [string_to_num(roomId || ""), wallet.address]
      }) as [PlayerPos[], PlayerProperty[]]

      const [ positions, properties ] = data
      if (positions.length == 0 || !positions.find(p => p.user_account.toLowerCase() === (wallet.address || "").toLowerCase())) {
        if (!walletClient) return
        
        console.log(string_to_num(roomId || ""), wallet.address as Hex)
        const tx = await walletClient.writeContract({
          chain: testnet,
          account: wallet.address as Hex,
          address: process.env.NEXT_PUBLIC_MULTIPOLY as Hex,
          abi: MultipolyAbi,
          functionName: "mintAllTokens",
          args: [wallet.address as Hex, process.env.NEXT_PUBLIC_AMETHYST as Hex, process.env.NEXT_PUBLIC_EMRALD as Hex, process.env.NEXT_PUBLIC_GOLDEN as Hex, process.env.NEXT_PUBLIC_RUBY as Hex],
          gasPrice: BigInt(200_000_000_000),
        })
        console.log(tx)
      }
    }

    getGameState()
    
  }, [ walletClient])

  // Auto-join room and set metadata
  useEffect(() => {
    if (!roomId || !wallet) return;

    if (state === "connected") {
      if (metadata?.name) return;
      updateMetadata({
        name: wallet.address.slice(0, 6) + "..." + wallet.address.slice(-4),
        image: "https://api.dicebear.com/9.x/identicon/svg?seed=" + wallet.address
      });
      return;
    }

    if (isFetchingToken || isJoiningRoom) return;

    joinRoom().catch((error) => {
      console.error("Failed to join room", error);
    });
  }, [roomId, state, isJoiningRoom, isFetchingToken, joinRoom, metadata?.name, updateMetadata, wallet]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  // Handlers
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await sendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push("/");
  };

  function startGame () {
    sendData({
      to: "*",
      payload: "<lets start>",
      label: "start"
    })
  }

  // Loading state
  if (!ready || !mounted) {
    return <FullScreenLoader />;
  }

  // Authentication required
  if (!authenticated) {
    return (
      <AuthenticationScreen 
        roomId={roomId || "Unknown"} 
        onLogin={login} 
      />
    );
  }

  // Main room interface
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <main className="min-h-screen bg-[url('/delhi.png')] bg-cover bg-center bg-fixed relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 via-transparent to-slate-900/20" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto p-6">
          <RoomHeader
            roomId={roomId || "Unknown"}
            connectionState={state || "disconnected"}
            onLeaveRoom={handleLeaveRoom}
            onLogout={logout}
          />

          <div className="grid grid-cols-2 gap-6 min-h-[600px]">
            {/* Chat Panel - Left Column */}
            <div>
              <ChatPanel
                messages={messages}
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
                connectionState={state || "disconnected"}
                isSendingMessage={isSendingMessage}
                isFetchingToken={isFetchingToken}
                isJoiningRoom={isJoiningRoom}
                tokenError={tokenError}
                joinError={joinError}
                peerId={peerId || undefined}
              />
            </div>

            {/* Right Sidebar - Right Column */}
            <div className="space-y-6">
              {/* Players List */}
              <PlayersList
                peerIds={peerIds}
                localPeerMetadata={metadata || undefined}
                connectionState={state || "disconnected"}
                startGame={startGame}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/ui/button";
import { createRoom } from "@/utils/createRoom";
import { RoomControlsCard } from "@/components/lobby/RoomControlsCard";
import { ShareRoomCard } from "@/components/lobby/ShareRoomCard";
import { NextStepsCard } from "@/components/lobby/NextStepsCard";


function Home() {
  const { ready, authenticated, logout, login } = usePrivy();
  const router = useRouter();
  const [manualRoomId, setManualRoomId] = useState<string>("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const {wallets} = useWallets()
  const wallet = wallets[0]

  useEffect(() => {
    if (!wallet) return

    wallet.switchChain(545)
  }, [wallet])
  
  const {
    mutateAsync: createRoomMutation,
    isPending: isCreatingRoom,
  } = useMutation({
    mutationKey: ["huddle", "create-room"],
    mutationFn: (templateId: string) => createRoom(templateId),
  });

  const handleCreateRoom = useCallback(async (templateId: string) => {
    try {
      const newRoomId = await createRoomMutation(templateId);
      setCreatedRoomId(newRoomId);
      setManualRoomId(newRoomId);
      setHasCopied(false);
    } catch (error) {
      console.error("Error creating room:", error);
      alert((error as Error).message);
    }
  }, [createRoomMutation]);

  const handleJoinRoom = useCallback(() => {
    const trimmedRoomId = manualRoomId.trim();

    if (!trimmedRoomId) {
      alert("Please enter a room ID");
      return;
    }

    router.push(`/room/${trimmedRoomId}`);
  }, [manualRoomId, router]);

  const shareUrl = createdRoomId && typeof window !== "undefined"
    ? `${window.location.origin}/room/${createdRoomId}`
    : "";

  const handleCopyShareUrl = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy", error);
      alert("Unable to copy the room link. Please copy it manually.");
    }
  }, [shareUrl]);

  if (!ready) {
    return <FullScreenLoader />;
  }

  return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex flex-row">
        {authenticated ? (
          <>
            <main className="flex-1 bg-[url('/world-map.png')] flex flex-col items-center justify-center p-6 relative">
              <div className="w-full max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-slate-100 mb-2">Multipoly</h1>
                    <p className="text-slate-600 text-lg"></p>

                  <Button 
                    onClick={logout} 
                    variant="outline" 
                    className="gap-2 bg-white/80 backdrop-blur-sm border-2 border-black rounded-none hover:bg-mred hover:text-white hover:border-mred transition-all duration-300"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Logout
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {!createdRoomId ? (
                    <div className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-none shadow-lg">
                      <RoomControlsCard
                        manualRoomId={manualRoomId}
                        onManualRoomIdChange={(e) => setManualRoomId(e.target.value)}
                        onCreateRoom={handleCreateRoom}
                        onJoinRoom={handleJoinRoom}
                        isCreatingRoom={isCreatingRoom}
                      />
                    </div>
                  ) : (
                    <div className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-none shadow-lg">
                      <ShareRoomCard
                        roomId={createdRoomId}
                        shareUrl={shareUrl}
                        hasCopied={hasCopied}
                        onCopy={handleCopyShareUrl}
                        onEnterRoom={() => router.push(`/room/${createdRoomId}`)}
                        onCreateAnother={() => {
                          setCreatedRoomId(null);
                          setManualRoomId("");
                          setHasCopied(false);
                        }}
                      />
                    </div>
                  )}

                  <div className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-none shadow-lg">
                    <NextStepsCard />
                  </div>
                </div>
              </div>
            </main>
          </>
        ) : (
          <div className="w-full flex flex-row justify-center items-center h-screen relative">
            <Image
              src="/world-map.png"
              alt="Background"
              fill
              style={{ objectFit: "cover", zIndex: 0 }}
              priority
            />
            <div className="z-10 flex flex-col items-center justify-center w-full h-full">
              <div className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-none p-8 shadow-lg max-w-2xl mx-4">
                <div className="text-center text-slate-800 text-6xl font-bold mb-4">
                  Welcome to Multipoly
                </div>
                <div className="text-center text-slate-600 text-xl leading-relaxed mb-8">
                  A web3 educational game to learn about blockchain and crypto
                </div>
                <Button
                  size="lg"
                  className="bg-mgreen hover:bg-mgreen/80 text-white border-2 border-black rounded-none w-full py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    login();
                    setTimeout(() => {
                      (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
                    }, 150);
                  }}
                >
                  Get Started
                </Button>
              </div>
              
            </div>
          </div>
        )}
      </div>
  );
}

export default Home;
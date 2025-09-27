"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import UserObject from "@/components/ui/user-object";
import { Button } from "@/components/ui/button";
import { createRoom } from "@/utils/createRoom";
import { RoomControlsCard } from "@/components/lobby/RoomControlsCard";
import { ShareRoomCard } from "@/components/lobby/ShareRoomCard";
import { NextStepsCard } from "@/components/lobby/NextStepsCard";
import { useLocalPeer } from "@huddle01/react"


function Home() {
  const { ready, authenticated, logout, login } = usePrivy();
  const router = useRouter();
  const [manualRoomId, setManualRoomId] = useState<string>("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  let {wallets} = useWallets()
  let wallet = wallets[0]

  useEffect(() => {
    if (!wallet) return

    wallet.switchChain(545)
  }, [wallet])
  
  const {
    mutateAsync: createRoomMutation,
    isPending: isCreatingRoom,
  } = useMutation({
    mutationKey: ["huddle", "create-room"],
    mutationFn: createRoom,
  });

  const handleCreateRoom = useCallback(async () => {
    try {
      const newRoomId = await createRoomMutation();
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

  // Modern RemotePeerCard component with shadcn
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {authenticated ? (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Multipoly Room</h1>
              <p className="text-muted-foreground">Connect and chat with other players</p>
            </div>
            <Button onClick={logout} variant="outline" className="gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-3xl">
            <RoomControlsCard
              manualRoomId={manualRoomId}
              onManualRoomIdChange={(e) => setManualRoomId(e.target.value)}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              isCreatingRoom={isCreatingRoom}
            />

            {createdRoomId && (
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
            )}

            <NextStepsCard />
          </div>

          <div className="mt-8">
            <UserObject />
          </div>
        </section>
      ) : (
        <section className="w-full flex flex-row justify-center items-center h-[calc(100vh-60px)] relative">
          <Image
            src="./BG.svg"
            alt="Background"
            fill
            style={{ objectFit: "cover", zIndex: 0 }}
            priority
          />
          <div className="z-10 flex flex-col items-center justify-center w-full h-full">
            <div className="flex h-10 items-center justify-center rounded-[20px] border border-white px-6 text-lg text-white font-abc-favorit">
              Next.js Demo
            </div>
            <div className="text-center mt-4 text-white text-7xl font-medium font-abc-favorit leading-[81.60px]">
              Starter repo
            </div>
            <div className="text-center text-white text-xl font-normal leading-loose mt-8">
              Get started developing with Privy using our Next.js starter repo
            </div>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 mt-8 w-full max-w-md rounded-full px-8 py-6 text-xl"
              onClick={() => {
                login();
                setTimeout(() => {
                  (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
                }, 150);
              }}
            >
              Get started
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
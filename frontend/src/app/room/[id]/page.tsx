"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  UserIcon,
} from "@heroicons/react/16/solid";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import UserObject from "@/components/ui/user-object";
import { ChatMessage, useHuddleRoom } from "@/hooks/useHuddleRoom";
import { useLocalPeer, useRemotePeer } from "@huddle01/react"

export interface Metadata {
  name: string
  image: string
}

function getRoomIdParam(param: string | string[] | undefined): string | null {
  if (!param) {
    return null;
  }

  if (Array.isArray(param)) {
    return param[0] ?? null;
  }

  return param;
}

export default function RoomPage() {
  const { ready, authenticated, logout, login } = usePrivy();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");

  let {wallets} = useWallets()
  let wallet = wallets[0]
  let { updateMetadata, metadata, peerId } = useLocalPeer<Metadata>()
  console.log(metadata)
  const roomId = useMemo(() => getRoomIdParam(params?.id), [params?.id]);

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


  useEffect(() => {
    if (!roomId) {
      return;
    }

    if (state === "connected") {
      if (metadata?.name) return
      updateMetadata({
        name: wallet.address.slice(0, 6) + "..." + wallet.address.slice(-4),
        image: "https://api.dicebear.com/9.x/identicon/svg?seed=" + wallet.address
      })
      return
    }

    if (isFetchingToken || isJoiningRoom) {
      return;
    }

    joinRoom().catch((error) => {
      console.error("Failed to join room", error);
    });
  }, [roomId, state, isJoiningRoom, isFetchingToken, joinRoom]);

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  const handleSendMessage = async () => {
    try {
      await sendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      alert((error as Error).message);
    }
  };

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

  const handleLeaveRoom = () => {
    leaveRoom();
    router.push("/");
  };

  if (!ready) {
    return <FullScreenLoader />;
  }

  if (!authenticated) {
    return (
      <section className="w-full flex flex-row justify-center items-center h-[calc(100vh-60px)] relative">
        <Image
          src="/BG.svg"
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
    );
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

    function MessageBubble ({ message }: { message: ChatMessage }) {
      let metadata = resolveMetadata(message.from == peerId ? "" : message.from)
      return (
        <div key={message.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {message.from == peerId ? "You" : metadata.name}
              </Badge>
              {message.label && (
                <Badge variant="secondary" className="text-xs">
                  {message.label}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm bg-background p-2 rounded border">
            {message.payload}
          </p>
        </div>
      )
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Room {roomId ?? ""}</h1>
            <p className="text-muted-foreground">Manage participants and chat in real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${state === "connected" ? "bg-green-500" : "bg-yellow-500"}`} />
            <Badge variant={state === "connected" ? "default" : "secondary"}>
              {state ?? "disconnected"}
            </Badge>
            <Button onClick={handleLeaveRoom} variant="outline" className="gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Leave Room
            </Button>
            <Button onClick={logout} variant="secondary">
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 xl:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChatBubbleLeftIcon className="h-5 w-5 text-primary" />
                  <CardTitle>Chat</CardTitle>
                </div>
                <Badge variant={state === "connected" ? "default" : "secondary"}>
                  {state === "connected" ? "Connected" : state ?? "connecting"}
                </Badge>
              </div>
              <CardDescription>
                {isFetchingToken
                  ? "Fetching access token..."
                  : isJoiningRoom
                  ? "Joining room..."
                  : "Chat with participants using real-time data messages."}
              </CardDescription>
              {(tokenError || joinError) && (
                <p className="text-sm text-destructive mt-2">
                  {(tokenError ?? joinError)?.message}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64 overflow-y-auto border rounded-md p-4 bg-muted/20">
                {messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <ChatBubbleLeftIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs">Start a conversation!</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || state !== "connected" || isSendingMessage}
                >
                  {isSendingMessage ? "Sending..." : "Send"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  <CardTitle>Participants</CardTitle>
                </div>
                <Badge variant="secondary">{peerIds.length + 1} connected</Badge>
              </div>
              <CardDescription>Users currently in the room</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                  <RemotePeerCard peerId=""/>
                  {peerIds.length > 0 ? (
                    peerIds.map((peerId) => (
                      <RemotePeerCard key={peerId} peerId={peerId} />
                    ))
                  ): null}
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <UserObject />
        </div>
      </section>
    </div>
  );
}

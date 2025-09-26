"use client";

import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { useState } from "react";
import { useRoom, usePeerIds, useDataMessage } from "@huddle01/react/hooks";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { ArrowLeftIcon, UserIcon, ChatBubbleLeftIcon, SignalIcon } from "@heroicons/react/16/solid";
import UserObject from "@/components/ui/user-object";
import { createRoom } from "@/utils/createRoom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";


function Home() {
  const { ready, authenticated, logout, login } = usePrivy();
  const [roomId, setRoomId] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isGettingToken, setIsGettingToken] = useState(false);
  const [manualRoomId, setManualRoomId] = useState<string>("");
  const [messages, setMessages] = useState<Array<{id: string, payload: string, from: string, label?: string, timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  const { joinRoom, leaveRoom, state } = useRoom({
    onJoin: (data) => {
      console.log('Joined the room');
      console.log(data)
    },
    onLeave: () => {
      console.log('Left the room');
    },
  });

  const { peerIds } = usePeerIds();

  const { sendData } = useDataMessage({
    onMessage(payload: string, from: string, label?: string) {
      console.log("Received a message!");
      console.log("Message: ", payload);
      console.log("Sender: ", from);
      if(label) console.log("Label: ", label);
      
      // Add message to the messages array
      const newMsg = {
        id: Date.now().toString(),
        payload,
        from,
        label,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMsg]);
    }
  });

  console.log({ roomId, accessToken, peerIds });

  const handleCreateRoom = async () => {
    try {
      setIsCreatingRoom(true);
      const newRoomId = await createRoom();
      setRoomId(newRoomId);
      console.log('Room created:', newRoomId);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleGetAccessToken = async (targetRoomId?: string) => {
    const roomIdToUse = targetRoomId || roomId || manualRoomId;
    if (!roomIdToUse) {
      alert('Please create a room or enter a room ID first');
      return;
    }

    try {
      setIsGettingToken(true);
      const response = await fetch(`/api/token?roomId=${roomIdToUse}`);
      const token = await response.text();
      setAccessToken(token);
      // Set the roomId if we're using a manual one
      if (targetRoomId || manualRoomId) {
        setRoomId(roomIdToUse);
      }
      console.log('Access token retrieved');
    } catch (error) {
      console.error('Error getting access token:', error);
    } finally {
      setIsGettingToken(false);
    }
  };

  const handleJoinRoom = async (targetRoomId?: string) => {
    const roomIdToUse = targetRoomId || roomId || manualRoomId;
    if (!roomIdToUse) {
      alert('Please enter a room ID');
      return;
    }

    // If we don't have an access token, get one first
    if (!accessToken) {
      await handleGetAccessToken(roomIdToUse);
      // Wait a bit for the token to be set
      setTimeout(() => {
        joinRoom({
          roomId: roomIdToUse,
          token: accessToken
        });
      }, 100);
    } else {
      joinRoom({
        roomId: roomIdToUse,
        token: accessToken
      });
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Check if we're connected to the room
    if (state !== 'connected') {
      alert('You must be connected to the room to send messages. Please join the room first.');
      return;
    }
    
    try {
      sendData({
        to: '*',
        payload: newMessage,
        label: 'chat'
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Make sure you have joined the room and have proper permissions.');
    }
  };

  if (!ready) {
    return <FullScreenLoader />;
  }

  // Modern RemotePeerCard component with shadcn
  const RemotePeerCard = ({ peerId }: { peerId: string }) => (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="flex items-center space-x-3 p-4">
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
          <UserIcon className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Connected User</p>
          <p className="text-xs text-muted-foreground font-mono">{peerId}</p>
        </div>
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          Online
        </Badge>
      </CardContent>
    </Card>
  );

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

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Room Controls */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <SignalIcon className="h-5 w-5 text-primary" />
                  <CardTitle>Room Controls</CardTitle>
                </div>
                <CardDescription>
                  Create or join a Huddle01 room to start collaborating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button
                    onClick={handleCreateRoom}
                    disabled={isCreatingRoom}
                    className="w-full"
                    size="lg"
                  >
                    {isCreatingRoom ? 'Creating Room...' : 'Create New Room'}
                  </Button>
                  {roomId && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium text-muted-foreground">Room ID</p>
                      <p className="text-sm font-mono">{roomId}</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Join Existing Room</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter Room ID"
                      value={manualRoomId}
                      onChange={(e) => setManualRoomId(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGetAccessToken()}
                        disabled={isGettingToken || (!roomId && !manualRoomId)}
                        variant="secondary"
                        className="flex-1"
                      >
                        {isGettingToken ? 'Getting Token...' : 'Get Token'}
                      </Button>
                    </div>
                    {accessToken && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Access token ready
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleJoinRoom()}
                    disabled={!roomId && !manualRoomId}
                    className="flex-1"
                  >
                    Join Room
                  </Button>
                  <Button
                    onClick={leaveRoom}
                    variant="destructive"
                    className="flex-1"
                  >
                    Leave Room
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Room Participants */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <CardTitle>Participants</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {peerIds.length} connected
                  </Badge>
                </div>
                <CardDescription>
                  Users currently in the room
                </CardDescription>
              </CardHeader>
              <CardContent>
                {peerIds.length > 0 ? (
                  <div className="space-y-3">
                    {peerIds.map((peerId) => (
                      <RemotePeerCard key={peerId} peerId={peerId} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No participants yet</p>
                    <p className="text-xs">Join a room to see connected users</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Section */}
            <Card className="lg:col-span-2 xl:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-primary" />
                    <CardTitle>Chat</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${state === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <Badge variant={state === 'connected' ? 'default' : 'secondary'}>
                      {state === 'connected' ? 'Connected' : state || 'disconnected'}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Real-time chat with room participants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages Display */}
                <div className="h-64 overflow-y-auto border rounded-md p-4 bg-muted/20">
                  {messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div key={message.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {message.from}
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

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || state !== 'connected'}
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
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
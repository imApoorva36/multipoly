"use client";

import { ChangeEventHandler } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignalIcon } from "@heroicons/react/16/solid";

interface RoomControlsCardProps {
  manualRoomId: string;
  onManualRoomIdChange: ChangeEventHandler<HTMLInputElement>;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  isCreatingRoom?: boolean;
}

export function RoomControlsCard({
  manualRoomId,
  onManualRoomIdChange,
  onCreateRoom,
  onJoinRoom,
  isCreatingRoom = false,
}: RoomControlsCardProps) {
  const trimmedRoomId = manualRoomId.trim();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <SignalIcon className="h-5 w-5 text-primary" />
          <CardTitle>Room Controls</CardTitle>
        </div>
        <CardDescription>
          Create a new Huddle01 room or join an existing one to start collaborating.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button
            onClick={onCreateRoom}
            disabled={isCreatingRoom}
            className="w-full"
            size="lg"
          >
            {isCreatingRoom ? "Creating Room..." : "Create New Room"}
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Join Existing Room</h4>
          <div className="space-y-2">
            <Input
              placeholder="Enter Room ID"
              value={manualRoomId}
              onChange={onManualRoomIdChange}
            />
            <div className="flex gap-2">
              <Button onClick={onJoinRoom} className="flex-1" disabled={!trimmedRoomId}>
                Join Room
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Tip: room IDs are case sensitive.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

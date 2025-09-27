"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface ShareRoomCardProps {
  roomId: string;
  shareUrl: string;
  hasCopied: boolean;
  onCopy: () => void;
  onEnterRoom: () => void;
  onCreateAnother: () => void;
}

export function ShareRoomCard({
  roomId,
  shareUrl,
  hasCopied,
  onCopy,
  onEnterRoom,
  onCreateAnother,
}: ShareRoomCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Share this room</CardTitle>
        <CardDescription>
          Send this link to teammates so they can jump straight into the lobby.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Room ID</p>
          <div className="p-3 bg-muted rounded-md border text-sm font-mono break-all">{roomId}</div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Shareable link</p>
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="font-mono text-xs" />
            <Button onClick={onCopy} variant="secondary" disabled={!shareUrl}>
              {hasCopied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button className="flex-1" onClick={onEnterRoom}>
            Enter Room
          </Button>
          <Button className="flex-1" variant="ghost" onClick={onCreateAnother}>
            Create Another
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

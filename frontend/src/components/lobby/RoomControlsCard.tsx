"use client";

import { ChangeEventHandler, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignalIcon, CheckIcon } from "@heroicons/react/16/solid";

interface RoomControlsCardProps {
  manualRoomId: string;
  onManualRoomIdChange: ChangeEventHandler<HTMLInputElement>;
  onCreateRoom: (templateId: string) => void;
  onJoinRoom: () => void;
  isCreatingRoom?: boolean;
}

export type RoomTemplate = {
  id: string;
  name: string;
  description: string;
  disabled?: boolean;
};

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: "new-delhi",
    name: "ETHGlobal New Delhi",
    description: "New Delhi-themed Monopoly with local landmarks and culture",
    disabled: false,
  },
  {
    id: "world",
    name: "ETH Online 2025",
    description: "Global-themed Monopoly with international landmarks and culture",
    disabled: true,
  },
];

export function RoomControlsCard({
  manualRoomId,
  onManualRoomIdChange,
  onCreateRoom,
  onJoinRoom,
  isCreatingRoom = false,
}: RoomControlsCardProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("new-delhi");
  const trimmedRoomId = manualRoomId.trim();

  const handleCreateRoom = () => {
    onCreateRoom(selectedTemplate);
  };

  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-mblue bg-mblue/20 rounded-none flex items-center justify-center">
            <SignalIcon className="h-3 w-3 text-mblue" />
          </div>
          <CardTitle className="text-slate-800 text-xl">Room Controls</CardTitle>
        </div>
        <CardDescription className="text-slate-600 text-xs">
          Choose a game template and create a new Huddle01 room or join an existing one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {ROOM_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={`relative p-4 border-2 rounded-none cursor-pointer transition-all duration-300 ${
                  template.disabled
                    ? "border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed"
                    : selectedTemplate === template.id
                    ? "border-mblue bg-mblue/10"
                    : "border-gray-300 bg-white hover:border-mblue/50"
                }`}
                onClick={() => !template.disabled && setSelectedTemplate(template.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm text-slate-800">{template.name}</h5>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{template.description}</p>
                  </div>
                  {selectedTemplate === template.id && !template.disabled && (
                    <div className="w-5 h-5 bg-mblue rounded-full flex items-center justify-center">
                      <CheckIcon className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleCreateRoom}
            disabled={isCreatingRoom || ROOM_TEMPLATES.find(t => t.id === selectedTemplate)?.disabled}
            className="w-full bg-mgreen hover:bg-mgreen/80 text-white border-2 border-black rounded-none font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isCreatingRoom 
              ? "Creating Room..." 
              : `Create ${ROOM_TEMPLATES.find(t => t.id === selectedTemplate)?.name || "Game"} Room`}
          </Button>
        </div>

        <Separator className="bg-black/20" />

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Join Existing Room</h4>
          <div className="space-y-2">
            <Input
              placeholder="Enter Room ID"
              value={manualRoomId}
              onChange={onManualRoomIdChange}
              className="border-2 border-black rounded-none bg-white/80 focus:bg-white focus:border-mblue transition-all duration-300"
            />
            <div className="flex gap-2">
              <Button 
                onClick={onJoinRoom} 
                className="flex-1 bg-mblue hover:bg-mblue/80 text-white border-2 border-black rounded-none font-bold transition-all duration-300" 
                disabled={!trimmedRoomId}
              >
                Join Room
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

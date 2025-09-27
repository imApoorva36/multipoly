"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDataMessage, usePeerIds, useRoom } from "@huddle01/react/hooks";

export type ChatMessage = {
  id: string;
  payload: string;
  from: string;
  label?: string;
  timestamp: Date;
};

async function requestAccessToken(roomId: string): Promise<{ roomId: string; token: string }> {
  const response = await fetch(`/api/token?roomId=${roomId}`);

  if (!response.ok) {
    throw new Error("Failed to retrieve access token");
  }

  const token = await response.text();
  return { roomId, token };
}

export function useHuddleRoom(roomId?: string | null) {
  const normalizedRoomId = useMemo(() => roomId ?? "", [roomId]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { peerIds } = usePeerIds();
  const { joinRoom: huddleJoinRoom, leaveRoom, state } = useRoom({
    onJoin(data) {
      console.log("Joined the room", data);
    },
    onLeave() {
      console.log("Left the room");
    },
  });

  const { sendData } = useDataMessage({
    onMessage(payload, from, label) {
      const message: ChatMessage = {
        id: crypto.randomUUID(),
        payload,
        from,
        label,
        timestamp: new Date(),
      };

      setMessages((previous) => [...previous, message]);
    },
  });

  useEffect(() => {
    setMessages([]);
  }, [normalizedRoomId]);

  const tokenQuery = useQuery({
    queryKey: ["huddle", "access-token", normalizedRoomId],
    queryFn: async () => {
      if (!normalizedRoomId) {
        throw new Error("Room ID is required to request an access token");
      }

      return requestAccessToken(normalizedRoomId);
    },
    enabled: Boolean(normalizedRoomId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const ensureToken = useCallback(async () => {
    if (!normalizedRoomId) {
      throw new Error("Room ID is required to join");
    }

    if (tokenQuery.data?.token) {
      return tokenQuery.data.token;
    }

    const result = await tokenQuery.refetch();

    if (result.data?.token) {
      return result.data.token;
    }

    throw result.error ?? new Error("Unable to obtain access token");
  }, [normalizedRoomId, tokenQuery]);

  const joinRoomMutation = useMutation({
    mutationKey: ["huddle", "join-room", normalizedRoomId],
    mutationFn: async () => {
      const token = await ensureToken();

      await huddleJoinRoom({
        roomId: normalizedRoomId,
        token,
      });

      return { roomId: normalizedRoomId, token };
    },
  });

  const sendMessageMutation = useMutation({
    mutationKey: ["huddle", "send-message", normalizedRoomId],
    mutationFn: async (payload: string) => {
      const trimmed = payload.trim();

      if (!trimmed) {
        throw new Error("Cannot send an empty message");
      }

      if (state !== "connected") {
        throw new Error("You must join the room before sending messages");
      }

      sendData({
        to: "*",
        payload: trimmed,
        label: "chat",
      });

      setMessages((previous) => [...previous]);
    },
  });

  const joinRoom = useCallback(() => joinRoomMutation.mutateAsync(), [joinRoomMutation]);

  const sendMessage = useCallback(
    (payload: string) => sendMessageMutation.mutateAsync(payload),
    [sendMessageMutation]
  );

  const tokenError = tokenQuery.error as Error | null;
  const joinError = joinRoomMutation.error as Error | null;

  return {
    roomId: normalizedRoomId,
    peerIds,
    state,
    messages,
    leaveRoom,
    joinRoom,
    isJoiningRoom: joinRoomMutation.isPending,
    joinError,
    sendMessage,
    isSendingMessage: sendMessageMutation.isPending,
    token: tokenQuery.data?.token ?? null,
    isFetchingToken: tokenQuery.isPending,
    tokenError,
    refetchToken: tokenQuery.refetch,
  };
}

"use client";

import { HuddleClient, HuddleProvider } from "@huddle01/react";

const huddleClient = new HuddleClient({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
});


export default function HuddleProviders({ children }: { children: React.ReactNode }) {
  return (
    <HuddleProvider client={huddleClient}>
        {children}
    </HuddleProvider>
  );
}
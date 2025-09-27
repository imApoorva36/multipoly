"use client";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NextStepsCard() {
  return (
    <Card className="border-0 bg-transparent shadow-none rounded-none">
      <CardHeader>
        <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-mred bg-mred/20 rounded-none flex items-center justify-center">
            <span className="text-mred text-sm font-bold">?</span>
          </div>
          What happens next?
        </CardTitle>
        <CardDescription className="text-slate-600 text-xs leading-relaxed">
          After creating or joining a room, you&apos;ll be redirected to the dedicated room space where you can:
        </CardDescription>
        <div className="mt-2 space-y-2 text-sm">
          <div className="flex items-center gap-3 p-3 bg-mgreen/10 border border-mgreen/30 rounded-none">
            <div className="w-7 h-7 bg-mgreen border-2 border-black rounded-none flex items-center justify-center">
              <span className="text-white text-sm font-bold">🎮</span>
            </div>
            <span className="text-slate-700 font-medium">Start playing Multipoly with friends and learn web3 in a fun way</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-mblue/10 border border-mblue/30 rounded-none">
            <div className="w-7 h-7 bg-mblue border-2 border-black rounded-none flex items-center justify-center">
              <span className="text-white text-sm font-bold">💬</span>
            </div>
            <span className="text-slate-700 font-medium">Meet and interact with other players</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-mpurple/10 border border-mpurple/30 rounded-none">
            <div className="w-7 h-7 bg-mpurple border-2 border-black rounded-none flex items-center justify-center">
              <span className="text-white text-sm font-bold">🎯</span>
            </div>
            <span className="text-slate-700 font-medium">Buy NFTs, do onchain transactions and manage your tokens</span>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

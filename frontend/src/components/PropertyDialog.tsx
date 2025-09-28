import React from 'react';
import { Property } from '@/utils/multipoly';
import { Button } from '@/components/ui/button';
import { ShieldIcon, HelpCircleIcon, Dice1Icon, HomeIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PropertyDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onMint: () => Promise<void>;
  isMinting: boolean;
  tokenSymbol: string;
}

export default function PropertyDialog({
  property,
  isOpen,
  onClose,
  onMint,
  isMinting,
  tokenSymbol = 'AMTY'
}: PropertyDialogProps) {
  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-2 border-black rounded-none bg-white max-w-md mx-auto">
        <DialogHeader>
          {property.special ? (
            <div className="flex items-center space-x-2">
              {property.name === "DAO" ? (
                <ShieldIcon className="text-mblue h-6 w-6" />
              ) : property.name === "CHANCE" ? (
                <HelpCircleIcon className="text-myellow h-6 w-6" />
              ) : (
                <Dice1Icon className="text-mblue h-6 w-6" />
              )}
              <DialogTitle className="text-xl font-bold">{property.name}</DialogTitle>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <HomeIcon className={`h-6 w-6 ${property.color.replace('bg-', 'text-')}`} />
              <DialogTitle className="text-xl font-bold">{property.name}</DialogTitle>
            </div>
          )}
        </DialogHeader>
        
        {property.special ? (
          <div className="py-4">
            <div className="mb-4 p-4 bg-slate-100 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Coming Soon!</h3>
              {property.name === "DAO" && (
                <div className="space-y-2">
                  <p>The DAO (Decentralized Autonomous Organization) feature will allow players to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Propose and vote on changes to game mechanics</li>
                    <li>Participate in community governance</li>
                    <li>Earn special rewards for active participation</li>
                    <li>Create and manage shared assets</li>
                  </ul>
                  <p className="text-sm text-mblue italic mt-2">Stay tuned for this exciting feature!</p>
                </div>
              )}
              {property.name === "CHANCE" && (
                <div className="space-y-2">
                  <p>The CHANCE feature will introduce random events that can:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Award you bonus tokens or NFTs</li>
                    <li>Move your position forward or backward</li>
                    <li>Trigger special gameplay mechanics</li>
                    <li>Create unexpected challenges or opportunities</li>
                  </ul>
                  <p className="text-sm text-myellow italic mt-2">The luck of the draw awaits!</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={onClose}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 border-2 border-black rounded-none"
              >
                Continue Playing
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="py-4">
            <div className="mb-4">
              <div className={`h-24 w-full mb-4 ${property.color} rounded-lg border-2 border-black flex items-center justify-center`}>
                <span className="text-white text-xl font-bold drop-shadow-md">{property.name}</span>
              </div>
              <DialogDescription className="text-center mb-2">
                You landed on <span className="font-bold">{property.name}</span>! 
                Would you like to mint this property as an NFT?
              </DialogDescription>
              <p className="text-sm text-slate-600 text-center">
                Minting this property will cost 10 {tokenSymbol} tokens.
              </p>
            </div>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <Button 
                onClick={onClose}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 border-2 border-black rounded-none"
              >
                Skip
              </Button>
              <Button 
                onClick={onMint}
                disabled={isMinting}
                className="flex-1 bg-mgreen hover:bg-mgreen/80 text-white border-2 border-black rounded-none"
              >
                {isMinting ? "Minting..." : "Mint Property"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
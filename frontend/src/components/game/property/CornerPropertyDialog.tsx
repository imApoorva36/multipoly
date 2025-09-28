import React from 'react';
import { Property } from '@/utils/multipoly';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircle, Flame, CoinsIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CornerPropertyDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: () => Promise<void>;
  isProcessing: boolean;
}

export default function CornerPropertyDialog({
  property,
  isOpen,
  onClose,
  onAction,
  isProcessing
}: CornerPropertyDialogProps) {
  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-2 border-black rounded-none bg-white max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {property.name === "START" ? (
              <ArrowLeftCircle className="text-mblue h-6 w-6" />
            ) : property.name === "BURN" ? (
              <FireIcon className="text-mred h-6 w-6" />
            ) : property.name === "FREE MINT" ? (
              <CoinsIcon className="text-myellow h-6 w-6" />
            ) : (
              <div className="h-6 w-6" />
            )}
            <DialogTitle className="text-xl font-bold">{property.name}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 p-4 bg-slate-100 rounded-lg">
            {property.name === "START" && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold mb-2">Welcome to Multipoly!</h3>
                <p>You've landed on the START position.</p>
                <div className="p-3 bg-white rounded-lg border border-mgreen text-center">
                  <span className="text-2xl font-bold text-mgreen">+50 AMTY</span>
                  <p className="text-sm text-slate-500 mt-1">Tokens have been added to your account</p>
                </div>
              </div>
            )}
            {property.name === "BURN" && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold mb-2">Token Burn!</h3>
                <p>You've landed on a BURN position!</p>
                <div className="p-3 bg-white rounded-lg border border-mred text-center">
                  <span className="text-2xl font-bold text-mred">-25 AMTY</span>
                  <p className="text-sm text-slate-500 mt-1">Tokens have been burned from your account</p>
                </div>
              </div>
            )}
            {property.name === "FREE MINT" && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold mb-2">Free NFT Mint!</h3>
                <p>Congratulations! You've won a free NFT mint!</p>
                <div className="p-3 bg-white rounded-lg border border-myellow text-center">
                  <span className="text-2xl font-bold text-myellow">+1 NFT</span>
                  <p className="text-sm text-slate-500 mt-1">A special Multipoly NFT has been minted to your account</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              onClick={onAction}
              disabled={isProcessing}
              className="w-full bg-mblue hover:bg-mblue/80 text-white border-2 border-black rounded-none"
            >
              {isProcessing ? "Processing..." : "Continue Playing"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
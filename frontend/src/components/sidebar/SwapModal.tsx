import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "../ui/sheet";
import { Button } from "../ui/button";

interface SwapModalProps {
  open: boolean;
  onClose: () => void;
  tokens: string[];
  onSwap: (from: number, to: number, amount: number) => void;
}

export default function SwapModal({ open, onClose, tokens, onSwap }: SwapModalProps) {
  const [fromToken, setFromToken] = useState(0);
  const [toToken, setToToken] = useState(1);
  const [amount, setAmount] = useState(0);

  const handleSwap = () => {
    onSwap(fromToken, toToken, amount);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Swap Tokens</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1">From</label>
            <select
              className="w-full border rounded p-2"
              value={fromToken}
              onChange={e => setFromToken(Number(e.target.value))}
            >
              {tokens.map((t, i) => (
                <option key={t} value={i}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">To</label>
            <select
              className="w-full border rounded p-2"
              value={toToken}
              onChange={e => setToToken(Number(e.target.value))}
            >
              {tokens.map((t, i) => (
                <option key={t} value={i}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Amount</label>
            <input
              type="number"
              className="w-full border rounded p-2"
              value={amount}
              min={0}
              onChange={e => setAmount(Number(e.target.value))}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSwap} disabled={fromToken === toToken || amount <= 0}>
            Swap
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

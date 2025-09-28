import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ArrowsRightLeftIcon } from "@heroicons/react/16/solid";
import { CoinsIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Define token colors for styling - matching play.tsx
const tokenColors = [
    "border-mred text-mred bg-mred/10",   // AMTY - Amethyst
    "border-mgreen text-mgreen bg-mgreen/10", // EMRD - Emerald
    "border-myellow text-myellow bg-myellow/10", // GLDN - Golden
    "border-mblue text-mblue bg-mblue/10"  // RUBY - Ruby
];

interface SwapModalProps {
  open: boolean;
  onClose: () => void;
  tokens: string[];
  onSwap: (from: number, to: number, amount: number) => void;
}

export default function SwapModal({ open, onClose, tokens, onSwap }: SwapModalProps) {
  const [fromToken, setFromToken] = useState<number>(0);
  const [toToken, setToToken] = useState<number>(1);
  const [amount, setAmount] = useState<string>("0");
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  
  // Safely get tokens array or use default if tokens is undefined
  const tokenOptions = tokens || ["AMTY", "EMRD", "GLDN", "RUBY"];

  const handleSwap = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    
    setIsSwapping(true);
    
    // Simulate swap delay for better UX
    setTimeout(() => {
      onSwap(fromToken, toToken, amountNum);
      setIsSwapping(false);
      setAmount("0");
      onClose();
    }, 1000);
  };

  const handleSwitchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-2 border-black rounded-none bg-gradient-to-br from-slate-50 to-slate-100 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ArrowsRightLeftIcon className="h-5 w-5 text-slate-700" />
            <DialogTitle className="text-lg font-bold">Swap Tokens</DialogTitle>
          </div>
          <DialogDescription className="text-slate-600">
            Exchange one token type for another
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* From Token Selection */}
          <div className="grid gap-2">
            <Label htmlFor="from-token" className="text-sm font-medium text-slate-700">From Token</Label>
            <div className="flex gap-2">
              <Select value={fromToken.toString()} onValueChange={(value: string) => setFromToken(parseInt(value))}>
                <SelectTrigger id="from-token" className={`flex-1 rounded-none border-2 ${tokenColors[fromToken]}`}>
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-2 border-black">
                  {tokenOptions.map((token, index) => (
                    <SelectItem 
                      key={index} 
                      value={index.toString()} 
                      className={`font-bold ${tokenColors[index]}`}
                      disabled={index === toToken}
                    >
                      <div className="flex items-center gap-2">
                        <CoinsIcon className="h-4 w-4" />
                        {token}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-none border-2 border-black"
              />
            </div>
            <Badge 
              variant="outline" 
              className={`self-start rounded-none border-2 p-1 text-sm font-bold ${tokenColors[fromToken]}`}
            >
              {tokenOptions[fromToken]}
              <CoinsIcon className="inline-block h-4 w-4 ml-2" />
            </Badge>
          </div>

          {/* Switch Direction Button */}
          <div className="flex justify-center">
            <Button 
              type="button" 
              variant="outline" 
              className="rounded-full p-2 border-2 border-black" 
              onClick={handleSwitchTokens}
            >
              <ArrowsRightLeftIcon className="h-5 w-5 text-slate-700" />
            </Button>
          </div>

          {/* To Token Selection */}
          <div className="grid gap-2">
            <Label htmlFor="to-token" className="text-sm font-medium text-slate-700">To Token</Label>
            <Select value={toToken.toString()} onValueChange={(value: string) => setToToken(parseInt(value))}>
              <SelectTrigger id="to-token" className={`rounded-none border-2 ${tokenColors[toToken]}`}>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-black">
                {tokenOptions.map((token, index) => (
                  <SelectItem 
                    key={index} 
                    value={index.toString()} 
                    className={`font-bold ${tokenColors[index]}`}
                    disabled={index === fromToken}
                  >
                    <div className="flex items-center gap-2">
                      <CoinsIcon className="h-4 w-4" />
                      {token}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge 
              variant="outline" 
              className={`self-start rounded-none border-2 p-1 text-sm font-bold ${tokenColors[toToken]}`}
            >
              {tokenOptions[toToken]}
              <CoinsIcon className="inline-block h-4 w-4 ml-2" />
            </Badge>
          </div>

          <div className="p-4 bg-slate-100 border border-slate-200 rounded-sm">
            <p className="text-sm text-slate-600">
              Swapping <span className={`font-bold ${tokenColors[fromToken].split(' ')[1]}`}>{amount} {tokenOptions[fromToken]}</span> to <span className={`font-bold ${tokenColors[toToken].split(' ')[1]}`}>{tokenOptions[toToken]}</span>
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="rounded-none border-2 border-black"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-mgreen hover:bg-mgreen/80 text-white border-2 border-black rounded-none font-bold shadow-md hover:shadow-lg transition-all duration-300"
            onClick={handleSwap}
            disabled={isSwapping || parseFloat(amount) <= 0 || fromToken === toToken}
          >
            {isSwapping ? 'Swapping...' : 'Swap Tokens'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

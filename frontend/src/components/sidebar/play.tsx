
import { tokenSymbols } from "@/lib/utils"
import { useViem } from "@/providers/ViemProvider"
import { useEffect, useState } from "react"
import TokenAbi from "@/abi/Token.json"
import DiceRollAbi from "@/abi/DiceRoll.json"
import { useWallets } from "@privy-io/react-auth"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { CubeIcon, CurrencyDollarIcon } from "@heroicons/react/16/solid"
import { CoinsIcon } from "lucide-react"
import { useParams } from "next/navigation"
import { useHuddleRoom } from "@/hooks/useHuddleRoom"
import { useDataMessage, useLocalPeer } from "@huddle01/react/hooks"
import { MULTIPOLY_PROPERTIES } from "@/utils/multipoly"
import SwapModal from "./SwapModal"

// Define the type for metadata
export interface Metadata {
  name: string;
}

// Dice Display Component
function DiceDisplay({ value }: { value: number }) {
    // Dice dot configurations for values 1-6
    const dotPositions = {
        1: ['middle'],
        2: ['top-left', 'bottom-right'],
        3: ['top-left', 'middle', 'bottom-right'],
        4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        5: ['top-left', 'top-right', 'middle', 'bottom-left', 'bottom-right'],
        6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };

    const getPositionClass = (position: string): string => {
        switch(position) {
            case 'top-left': return 'top-3 left-3';
            case 'top-right': return 'top-3 right-3';
            case 'middle-left': return 'top-1/2 -translate-y-1/2 left-3';
            case 'middle': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
            case 'middle-right': return 'top-1/2 -translate-y-1/2 right-3';
            case 'bottom-left': return 'bottom-3 left-3';
            case 'bottom-right': return 'bottom-3 right-3';
            default: return '';
        }
    };

    // Ensure value is within valid dice range
    const safeValue = Math.min(Math.max(1, value), 6) as 1 | 2 | 3 | 4 | 5 | 6;
    const positions = dotPositions[safeValue] || dotPositions[1];

    return (
        <div className="relative w-20 h-20 bg-white rounded-lg border-2 border-black">
            {positions.map((position, index) => (
                <div 
                    key={index} 
                    className={`absolute w-3 h-3 bg-black rounded-full ${getPositionClass(position)}`}
                ></div>
            ))}
        </div>
    );
}

export default function PlaySection () {

    const [ balances, setBalances ] = useState<number[]>([0, 0, 0, 0])
    const { publicClient } = useViem()
    const [ roll, setRoll ] = useState<number|null>(null)
    const [swapOpen, setSwapOpen] = useState(false)
    const [ isRolling, setIsRolling ] = useState(false)
    const [ turnNotification, setTurnNotification ] = useState<string|null>(null)
    const params = useParams<{ id: string }>()
    const roomId = params.id
    
    const { wallets } = useWallets()
    const wallet = wallets[0]
    const { sendData } = useDataMessage()
    const { peerId } = useLocalPeer()

    async function rollDice () {
        if (!publicClient) return
        
        try {
            const roll = await publicClient.readContract({
                address: process.env.NEXT_PUBLIC_DICEROLL as `0x${string}`,
                abi: DiceRollAbi,
                functionName: "revertibleRandom"
            }) as any
            
            const rollValue = parseInt(roll)
            setRoll(rollValue)
            
            
            // Notify other players about your roll (optional)
            if (sendData && roomId && peerId) {
                sendData({
                    to: '*', // broadcast to all peers
                    payload: JSON.stringify({
                        type: 'DICE_ROLL',
                        roll: rollValue,
                        player: peerId
                    })
                })
            }
            
            // Display a temporary notification (optional)
            setTurnNotification(`You rolled a ${rollValue}!`)
            setTimeout(() => setTurnNotification(null), 3000)
            
            return rollValue
        } catch (error) {
            console.error("Error rolling dice:", error)
            return null
        }
    }

    useEffect(() => {
        async function getBalances () {
            if (publicClient == null || wallet == null) return

            const tokenAddresses = [process.env.NEXT_PUBLIC_AMETHYST, process.env.NEXT_PUBLIC_EMRALD, process.env.NEXT_PUBLIC_GOLDEN, process.env.NEXT_PUBLIC_RUBY]

            const datas = await Promise.all(tokenAddresses.map(token => 
                publicClient.readContract({
                    address: token as `0x${string}`,
                    abi: TokenAbi,
                    functionName: "balanceOf",
                    args: [wallet.address]
                })
            )) as bigint[]

            setBalances(datas.map(d => Number(d)))
        }
        getBalances()
    }, [publicClient, wallet])

    function handleSwap(from: number, to: number, amount: number) {
        if (from === to || amount <= 0) return;
        // For demo: just update balances locally, since tokens are equal in value
        setBalances(prev => {
            if (prev[from] < amount) return prev;
            const next = [...prev];
            next[from] -= amount;
            next[to] += amount;
            return next;
        });
    }

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Play</h3>
            <div className="flex flex-col">
                <div>
                    <h4 className="text-base font-semibold">Balances</h4>
                    <div className="grid grid-cols-2">
                        {balances.map((b,i) => (
                            <span key={i}>{b} {tokenSymbols[i]}</span>
                        ))}
                    </div>
                    <Button className="mt-2 w-full" variant="outline" onClick={() => setSwapOpen(true)}>
                        Swap Tokens
                    </Button>
                    <SwapModal
                        open={swapOpen}
                        onClose={() => setSwapOpen(false)}
                        tokens={tokenSymbols}
                        onSwap={handleSwap}
                    />
                </div>

                {/* Dice Roll Section */}
                <div className="border-1 border-black rounded-none bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex-1 mt-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <CubeIcon className="h-5 w-5 text-slate-700" />
                            <h3 className="text-sm font-bold text-slate-800">Dice Roll</h3>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6 mt-4">
                        {/* Dice display area */}
                        <div className="flex justify-center items-center min-h-32">
                            {roll !== null ? (
                                <div className={`transition-all duration-500 ${isRolling ? 'animate-bounce' : ''}`}>
                                    <DiceDisplay value={roll} />
                                </div>
                            ) : (
                                <div className="text-slate-500 italic">Roll the dice to play</div>
                            )}
                        </div>
                        
                        {/* Result display */}
                        {roll !== null && !isRolling && (
                            <div className="text-center">
                                <p className="text-2xl font-bold">You rolled a <span className="text-mgreen">{roll}</span>!</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Move your token {roll} spaces on the board
                                </p>
                            </div>
                        )}
                        
                        {/* Roll button */}
                        <Button
                            size="lg"
                            disabled={isRolling}
                            className="bg-mgreen hover:bg-mgreen/80 text-white border-2 border-black rounded-none w-full py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => {
                                setIsRolling(true);
                                
                                // Animate dice rolling with multiple values before settling
                                const rollInterval = setInterval(() => {
                                    setRoll(Math.floor(Math.random() * 6) + 1);
                                }, 100);
                                
                                // After animation, call the actual rollDice function
                                setTimeout(() => {
                                    clearInterval(rollInterval);
                                    rollDice();
                                    setIsRolling(false);
                                }, 1500);
                            }}
                        >
                            {isRolling ? 'Rolling...' : 'Roll The Dice'}
                        </Button>
                    </div>
                </div>
                </div>
        </div>
    )
}
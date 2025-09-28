
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
import { useDataMessage, useLocalPeer } from "@huddle01/react/hooks"
import { tokenSymbols } from "@/lib/utils"
import { MULTIPOLY_PROPERTIES, Property } from "@/utils/multipoly"
import PropertyDialog from "../PropertyDialog"

// Fallback in case import fails
const localTokenSymbols = ["AMTY", "EMRD", "GLDN", "RUBY"]

// Define token colors for styling
const tokenColors = [
    "border-mred text-mred bg-mred/10",   // AMTY - Amethyst
    "border-mgreen text-mgreen bg-mgreen/10", // EMRD - Emerald
    "border-myellow text-myellow bg-myellow/10", // GLDN - Golden
    "border-mblue text-mblue bg-mblue/10"  // RUBY - Ruby
]

// GameState interface to match the one in game/[id]/page.tsx
interface GameState {
  currentTurn: string;
  players: Array<{
    peerId: string;
    walletAddress: string;
    position: number;
    playerNumber: number;
  }>;
  turnOrder: string[];
}
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

export default function PlaySection() {
    const [ balances, setBalances ] = useState<number[]>([0, 0, 0, 0])
    const { publicClient } = useViem()
    const [ roll, setRoll ] = useState<number|null>(null)
    const [swapOpen, setSwapOpen] = useState(false)
    const [ isRolling, setIsRolling ] = useState(false)
    const [ turnNotification, setTurnNotification ] = useState<string|null>(null)
    const [ playerPosition, setPlayerPosition ] = useState<number>(0)
    const [ playerNumber, setPlayerNumber ] = useState<number>(1)
    const [ gameState, setGameState ] = useState<GameState | null>(null)
    const [ showPropertyDialog, setShowPropertyDialog ] = useState<boolean>(false)
    const [ currentProperty, setCurrentProperty ] = useState<Property | null>(null)
    const [ isMinting, setIsMinting ] = useState<boolean>(false)
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
            })
            
            const rollValue = Number(roll)
            setRoll(rollValue)
            
            // Update player position with board wrap-around (40 positions total)
            const totalPositions = 40 // Total positions on the board
            const newPosition = ((playerPosition + rollValue - 1) % totalPositions) + 1
            setPlayerPosition(newPosition)
            
            // Check if player landed on a property and show dialog
            // The position is 1-based, and array is 0-based, so we need to -1
            const propertyIndex = (newPosition - 1) % MULTIPOLY_PROPERTIES.length
            const landedProperty = MULTIPOLY_PROPERTIES[propertyIndex]
            
            // Show property dialog after a short delay (to let the animation finish)
            setTimeout(() => {
                // Update position for corner properties with special actions
                if (landedProperty.name === "START") {
                    setTurnNotification(`<span class="text-mblue font-bold">${landedProperty.name}:</span> You received 50 AMTY tokens!`)
                } else if (landedProperty.name === "BURN") {
                    setTurnNotification(`<span class="text-mred font-bold">${landedProperty.name}:</span> 25 AMTY tokens were burned!`)
                } else if (landedProperty.name === "FREE MINT") {
                    setTurnNotification(`<span class="text-myellow font-bold">${landedProperty.name}:</span> You got a special Multipoly NFT!`)
                } else {
                    // For regular properties, show the property color in the notification
                    const colorClass = landedProperty.color.replace('bg-', 'text-')
                    setTurnNotification(`You landed on <span class="${colorClass} font-bold">${landedProperty.name}</span>!`)
                }
                
                // Only show dialog for non-corner properties
                if (!landedProperty.corner) {
                    setCurrentProperty(landedProperty)
                    setShowPropertyDialog(true)
                }
            }, 1000)
            
            // Notify other players about your roll using the player-move message format
            // that the game board component expects
            if (sendData && roomId && peerId && wallet?.address) {
                sendData({
                    to: '*',
                    payload: JSON.stringify({
                        roll: rollValue,
                        player: wallet.address, // Use wallet address for player ID as expected by game board
                        newPosition
                    }),
                    label: 'player-move' // Use the correct label that game board listens for
                })
            }
            
            // Display a temporary notification with player info
            const playerColorName = playerNumber === 1 ? 'Red' : 
                                   playerNumber === 2 ? 'Blue' : 
                                   playerNumber === 3 ? 'Green' : 'Yellow';
                                   
            setTurnNotification(`Player ${playerNumber} (${playerColorName}) rolled a ${rollValue}!`)
            // Clear the initial notification after 2 seconds so property notification can display
            setTimeout(() => setTurnNotification(null), 2000)
            
            return rollValue
        } catch (error) {
            console.error("Error rolling dice:", error)
            return null
        }
    }

    // Listen for game state updates
    useDataMessage({
        onMessage: (payload, from, label) => {
            if (label === 'game-state') {
                try {
                    const newState = JSON.parse(payload) as GameState
                    setGameState(newState)
                    
                    // Find our player in the game state
                    if (wallet?.address) {
                        const myPlayer = newState.players.find(p => p.walletAddress === wallet.address)
                        if (myPlayer) {
                            setPlayerPosition(myPlayer.position)
                            setPlayerNumber(myPlayer.playerNumber)
                        }
                    }
                } catch (err) {
                    console.error("Error parsing game state:", err)
                }
            } 
            else if (label === 'player-move') {
                try {
                    const moveData = JSON.parse(payload) as {
                        player: string, 
                        roll: number,
                        newPosition: number
                    }
                    
                    // If this is our move, update our position
                    if (wallet?.address === moveData.player) {
                        setPlayerPosition(moveData.newPosition)
                    }
                } catch (err) {
                    console.error("Error parsing move data:", err)
                }
            }
        }
    })

    // Send player initialization message when component mounts
    useEffect(() => {
        // If we have a wallet and sendData, send a player-join message
        if (wallet?.address && sendData && peerId && roomId) {
            sendData({
                to: '*',
                payload: JSON.stringify({
                    peerId: peerId,
                    walletAddress: wallet.address,
                }),
                label: 'player-join'
            });
        }
    }, [wallet, sendData, peerId, roomId]);

    useEffect(() => {
        async function getBalances() {
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

    // Handle NFT minting for properties
    async function mintProperty() {
        if (!currentProperty) return
        
        setIsMinting(true)
        try {
            // Simulate mint transaction
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Send a notification about the mint or action
            if (sendData && roomId && peerId && wallet?.address) {
                sendData({
                    to: '*',
                    payload: JSON.stringify({
                        action: currentProperty.special ? 'special' : 'mint',
                        player: wallet.address,
                        propertyId: currentProperty.id,
                        propertyName: currentProperty.name
                    }),
                    label: 'property-action'
                })
            }
            
            // Show success notification with property color
            const colorClass = currentProperty.color.replace('bg-', 'text-')
            setTurnNotification(`Successfully minted <span class="${colorClass} font-bold">${currentProperty.name}</span>!`)
            
            // Success - close dialog
            setIsMinting(false)
            setShowPropertyDialog(false)
        } catch (error) {
            console.error('Error minting property:', error)
            setIsMinting(false)
            setTurnNotification("Failed to mint property. Please try again.")
        }
    }
    
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
        <div className="h-[90vh] flex flex-col relative">
            {/* Turn notification overlay */}
            {turnNotification && (
                <div className="absolute top-0 left-0 w-full py-2 bg-black bg-opacity-80 text-white text-center font-bold z-50"
                     style={{
                         animation: 'fadeInOut 3s ease-in-out',
                     }}>
                    <style jsx>{`
                        @keyframes fadeInOut {
                            0% { opacity: 0; transform: translateY(-20px); }
                            15% { opacity: 1; transform: translateY(0); }
                            85% { opacity: 1; transform: translateY(0); }
                            100% { opacity: 0; transform: translateY(-20px); }
                        }
                    `}</style>
                    <div dangerouslySetInnerHTML={{ __html: turnNotification }} />
                </div>
            )}
            <hr className="border-black border-1 m-3"/>
            
            <div className="flex-1 flex flex-col space-y-6 p-4 pt-0 h-full">
                {/* Game Status Section */}
                <div className="border-1 border-black rounded-none bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <CubeIcon className="h-5 w-5 text-slate-700" />
                        <h3 className="text-sm font-bold text-slate-800">Game Status</h3>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Your position:</span>
                            <Badge className="bg-mblue text-white border-none">
                                {playerPosition || '-'}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Player number:</span>
                            <Badge className={
                                `${playerNumber === 1 ? 'bg-mred' : 
                                  playerNumber === 2 ? 'bg-mblue' : 
                                  playerNumber === 3 ? 'bg-mgreen' : 
                                  'bg-myellow'} text-white border-none`
                            }>
                                {playerNumber || '-'}
                            </Badge>
                        </div>
                        {gameState && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Current turn:</span>
                                <Badge className={
                                    `${wallet?.address === gameState.currentTurn ? 'bg-mgreen' : 'bg-slate-500'} text-white border-none`
                                }>
                                    {wallet?.address === gameState.currentTurn ? 'Your turn' : 'Waiting'}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>

                {/* Balances Section */}
                <div className="border-1 border-black rounded-none bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <CurrencyDollarIcon className="h-5 w-5 text-slate-700" />
                        <h3 className="text-sm font-bold text-slate-800">My Balances</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {balances.map((balance, i) => (
                            <Badge 
                                key={i}
                                variant="outline" 
                                className={`rounded-none border-2 p-1 text-sm font-bold ${tokenColors[i]}`}
                            >
                                {balance} {(tokenSymbols || localTokenSymbols)[i]}
                                <CoinsIcon className={`inline-block h-4 w-4 ml-2 text-current ${tokenColors[i].split(' ')[2]}`} />
                            </Badge>
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
                                setTimeout(async () => {
                                    clearInterval(rollInterval);
                                    await rollDice();
                                    
                                    // Small delay to ensure animations complete properly
                                    setTimeout(() => {
                                        setIsRolling(false);
                                    }, 300);
                                }, 1500);
                            }}
                        >
                            {isRolling ? 'Rolling...' : 'Roll The Dice'}
                        </Button>
                    </div>
                </div>
                </div>
            
            {/* Property Dialog */}
            <PropertyDialog
                property={currentProperty}
                isOpen={showPropertyDialog}
                onClose={() => setShowPropertyDialog(false)}
                onMint={mintProperty}
                isMinting={isMinting}
                tokenSymbol={(tokenSymbols || localTokenSymbols)[0]} // Use the first token symbol (AMTY)
            />
        </div>
    )
}
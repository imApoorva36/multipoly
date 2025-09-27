
import { tokenSymbols } from "@/lib/utils"
import { useViem } from "@/providers/ViemProvider"
import { useEffect, useState } from "react"
import TokenAbi from "@/abi/Token.json"
import DiceRollAbi from "@/abi/DiceRoll.json"
import { useWallets } from "@privy-io/react-auth"
import { Button } from "../ui/button"
import SwapModal from "./SwapModal"

export default function PlaySection () {

    const [ balances, setBalances ] = useState<number[]>([0, 0, 0, 0])
    const { publicClient } = useViem()
    const [ roll, setRoll ] = useState<number|null>(null)
    const [swapOpen, setSwapOpen] = useState(false)
    const { wallets } = useWallets()
    const wallet = wallets[0]

    async function rollDice () {
        if (!publicClient) return
        let roll = await publicClient.readContract({
            address: process.env.NEXT_PUBLIC_DICEROLL as any,
            abi: DiceRollAbi,
            functionName: "revertibleRandom"
        }) as any
        setRoll(parseInt(roll))
    }

    useEffect(() => {
        async function getBalances () {
            if (publicClient == null || wallet == null) return
            let tokenAdresses = [process.env.NEXT_PUBLIC_AMETHYST, process.env.NEXT_PUBLIC_EMRALD, process.env.NEXT_PUBLIC_GOLDEN, process.env.NEXT_PUBLIC_RUBY]
            const datas = await Promise.all(tokenAdresses.map(token => 
                publicClient.readContract({
                    address: token as any,
                    abi: TokenAbi,
                    functionName: "balanceOf",
                    args: [wallet.address]
                })
            )) as any[]
            setBalances(datas.map(d => parseInt(d)))
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
                <div className="grow"></div>
                <div>
                    <h4 className="text-base font-semibold">Dice Roll</h4>
                    <p>Dice Roll: { roll }</p>
                    <Button
                        size="lg"
                        className="bg-mgreen hover:bg-mgreen/80 text-white border-2 border-black rounded-none w-full py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={rollDice}
                    >
                        Roll The Dice
                    </Button>
                </div>
            </div>
        </div>
    )
}
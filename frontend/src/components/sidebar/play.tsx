import { useEffect, useState } from "react"
import { WalletClient } from "viem"

export default function PlaySection ({ walletClient } : { walletClient: WalletClient | null}) {
    let [ balances, setBalances ] = useState<number[]>([0, 0, 0, 0])

    useEffect(() => {
        if (walletClient == null) return
        
        async function watchTokens () {
            if (walletClient == null) return

        }

        watchTokens()
    }, [walletClient])
    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Play</h3>
        </div>
    )
}
"use client";

import { useEffect, useState } from "react";
import { MONOPOLY_PROPERTIES, getPropertyPosition, getAccentPositionClasses, isRailroadProperty, type MonopolyProperty } from "@/utils/monopoly";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Image from "next/image";
import { BadgeQuestionMark, Globe2 } from "lucide-react";
import { EIP1193Provider, useWallets } from "@privy-io/react-auth"
import { createWalletClient, custom, Hex, WalletClient } from "viem"
import { testnet } from "@/providers/WalletProvider"

export default function MonopolyBoard() {
    const [mounted, setMounted] = useState(false);
    const [rotationX, setRotationX] = useState(15); // Start with slight X tilt for 3D effect
    const [rotationY, setRotationY] = useState(0);
    const [rotationZ, setRotationZ] = useState(0);
    const [scale, setScale] = useState(1);

    const [ provider, setProvider ] = useState<EIP1193Provider | null>(null)
    const [ walletClient, setWalletClient ] = useState<WalletClient | null>(null)

    let { wallets } = useWallets()
    let wallet = wallets[0]

    useEffect(() => {
        setMounted(true);
        
        const boardElement = document.getElementById("board");
        if (boardElement) {
            boardElement.onwheel = (e) => {
                e.preventDefault();
                if (e.shiftKey) {
                    // Zoom
                    setScale((old) => Math.max(0.3, Math.min(2.5, old + (e.deltaY * -0.001))));
                } else if (e.ctrlKey || e.metaKey) {
                    // X-axis rotation (tilt up/down)
                    setRotationX((old) => Math.max(-60, Math.min(60, old + (e.deltaY * -0.3))));
                } else if (e.altKey) {
                    // Y-axis rotation (turn left/right)
                    setRotationY((old) => old + (e.deltaY * -0.5));
                } else {
                    // Z-axis rotation (spin clockwise/counterclockwise)
                    setRotationZ((old) => old + (e.deltaY * -0.5));
                }
            };
        }
    }, []);

    useEffect(() => {
        async function getWalletClient () {
            let p = await wallet.getEthereumProvider()
            let wc = createWalletClient({
                account: wallet.address as Hex,
                chain: testnet,
                transport: custom(p)
            })
            setProvider(p)
            setWalletClient(wc)
        }
        getWalletClient()

    }, [ wallet ])


    const renderProperty = (property: MonopolyProperty, index: number) => {
        const { style, orientation, isCorner } = getPropertyPosition(index, property);
        const isSpecial = Boolean(property.special);
        const isUtility = Boolean(property.utility);
        const isRailroad = isRailroadProperty(property);
        const textSizeClass = isCorner ? "text-xs" : "text-[7px]";
        const nameTextSizeClass = property.name.length > 12 ? "text-[6px]" : isCorner ? "text-[9px]" : "text-[7px]";
        const accentPositionClass = orientation ? getAccentPositionClasses(orientation) : "";

        return (
            <div
                key={`${property.name}-${index}`}
                className={`
                    absolute border-black border-1 rounded-none
                    bg-mgray
                    flex flex-col items-center justify-center
                    font-medium text-center cursor-pointer
                    transition-all duration-300 overflow-hidden
                    ${textSizeClass}
                `}
                style={style}
            >
                {!isCorner && !isSpecial && !isUtility && !isRailroad && orientation && (
                    <div
                        className={`absolute rounded-none ${accentPositionClass} ${property.color}`}
                    />
                )}
                {isRailroad && orientation && (
                    <div
                        className={`absolute text-white text-[6px] flex items-center justify-center rounded-sm ${accentPositionClass}`}
                        style={{
                            backgroundColor: property.color,
                            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
                        }}
                    >
                        🚂
                    </div>
                )}
                {isUtility && orientation && (
                    <div
                        className={`absolute bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-[8px] flex items-center justify-center rounded-sm shadow-inner ${accentPositionClass}`}
                    >
                        ⚡
                    </div>
                )}
                <div
                    className={`
                        p-1 leading-tight text-slate-700
                        ${nameTextSizeClass}
                        ${!isCorner && !isSpecial ? "mt-3" : ""}
                    `}
                >
                    {property.name}
                </div>
            </div>
        );
    };

    return (
        <SidebarProvider>
            <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex flex-row">
                {/* Sidebar on the left */}
                <AppSidebar walletClient = {walletClient} />
                {/* Main content */}
                <main className="flex-1 bg-[url('/delhi-bg.png')] flex flex-col items-center justify-center p-6 relative">
                    <div className="relative" style={{ perspective: "1200px" }}>
                        <div
                            id="board"
                            className="relative bg-white transition-transform duration-200 ease-out backdrop-blur-sm"
                            style={{
                                width: "800px",
                                height: "800px",
                                transform: mounted 
                                    ? `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg) scale(${scale})`
                                    : 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)',
                                transformStyle: "preserve-3d",
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)'
                            }}
                        >
                            <div className="absolute inset-0 m-20 rounded-2xl">
                                <div className="absolute top-20 left-12 border-4 border-mred w-36 h-22 rotate-[125deg] flex items-center justify-center">
                                    <BadgeQuestionMark className="text-mred w-10 h-10" />
                                </div>
                                
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Image src="/multipoly.png" alt="" width={400} height={400} />
                                </div>
                                <div className="absolute bottom-20 right-12 border-4 border-mblue w-36 h-22 rotate-[125deg] flex items-center justify-center">
                                    <Globe2 className="text-mblue w-10 h-10" />
                                </div>
                            </div>
                            {/* Generate all properties */}
                            {MONOPOLY_PROPERTIES.map((property, index) => renderProperty(property, index))}
                        </div>
                    </div>
                    
                    {/* Subtle rotation stats and controls at bottom right */}
                    <div className="fixed bottom-1 right-1 bg-white/60 border border-black backdrop-blur-sm rounded-none shadow-lg p-4 text-xs text-slate-600 max-w-xs">
                        <div className="grid grid-cols-1 gap-2 mb-3 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-black rounded-full"></div>
                                <span>Z: {Math.round(rotationZ)}°</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-black rounded-full"></div>
                                <span>X: {Math.round(rotationX)}°</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-black rounded-full"></div>
                                <span>Y: {Math.round(rotationY)}°</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-black rounded-full"></div>
                                <span>{(scale * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-1 mb-2">
                            <button 
                                onClick={() => {
                                    setRotationX(15);
                                    setRotationY(0);
                                    setRotationZ(0);
                                    setScale(1);
                                }}
                                className="px-2 py-1 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 rounded text-[10px] font-medium transition-colors flex-1"
                            >
                                Reset
                            </button>
                            <button 
                                onClick={() => {
                                    setRotationX(0);
                                    setRotationY(0);
                                    setRotationZ(0);
                                }}
                                className="px-2 py-1 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 rounded text-[10px] font-medium transition-colors flex-1"
                            >
                                Flat
                            </button>
                        </div>
                        <div className="text-[9px] text-slate-500 space-y-0.5">
                            <div>Wheel: Z rotate</div>
                            <div>⇧+Wheel: Zoom </div>
                            <div>⌃+Wheel: X tilt</div>
                            <div>⌥+Wheel: Y turn</div>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}

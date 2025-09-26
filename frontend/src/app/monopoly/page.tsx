"use client";

import { useEffect, useState } from "react";

export default function MonopolyBoard() {
    const [mounted, setMounted] = useState(false);
    const [rotationX, setRotationX] = useState(15); // Start with slight X tilt for 3D effect
    const [rotationY, setRotationY] = useState(0);
    const [rotationZ, setRotationZ] = useState(0);
    const [scale, setScale] = useState(1);

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

    // Monopoly board properties in order
    const properties = [
        { name: "GO", color: "#00ff00", corner: true },
        { name: "Mediterranean Avenue", color: "#8B4A9C" },
        { name: "Community Chest", color: "#f0f0f0", special: true },
        { name: "Baltic Avenue", color: "#8B4A9C" },
        { name: "Income Tax", color: "#f0f0f0", special: true },
        { name: "Reading Railroad", color: "#000000" },
        { name: "Oriental Avenue", color: "#87CEEB" },
        { name: "Chance", color: "#ff8c00", special: true },
        { name: "Vermont Avenue", color: "#87CEEB" },
        { name: "Connecticut Avenue", color: "#87CEEB" },
        { name: "JAIL", color: "#ff0000", corner: true },
        { name: "St. Charles Place", color: "#D12B76" },
        { name: "Electric Company", color: "#ffffff", utility: true },
        { name: "States Avenue", color: "#D12B76" },
        { name: "Virginia Avenue", color: "#D12B76" },
        { name: "Pennsylvania Railroad", color: "#000000" },
        { name: "St. James Place", color: "#FF8C00" },
        { name: "Community Chest", color: "#f0f0f0", special: true },
        { name: "Tennessee Avenue", color: "#FF8C00" },
        { name: "New York Avenue", color: "#FF8C00" },
        { name: "FREE PARKING", color: "#ffff00", corner: true },
        { name: "Kentucky Avenue", color: "#E11D3F" },
        { name: "Chance", color: "#ff8c00", special: true },
        { name: "Indiana Avenue", color: "#E11D3F" },
        { name: "Illinois Avenue", color: "#E11D3F" },
        { name: "B. & O. Railroad", color: "#000000" },
        { name: "Atlantic Avenue", color: "#FEF135" },
        { name: "Ventnor Avenue", color: "#FEF135" },
        { name: "Water Works", color: "#ffffff", utility: true },
        { name: "Marvin Gardens", color: "#FEF135" },
        { name: "GO TO JAIL", color: "#ff0000", corner: true },
        { name: "Pacific Avenue", color: "#1FB25A" },
        { name: "North Carolina Avenue", color: "#1FB25A" },
        { name: "Community Chest", color: "#f0f0f0", special: true },
        { name: "Pennsylvania Avenue", color: "#1FB25A" },
        { name: "Short Line Railroad", color: "#000000" },
        { name: "Chance", color: "#ff8c00", special: true },
        { name: "Park Place", color: "#0072CE" },
        { name: "Luxury Tax", color: "#f0f0f0", special: true },
        { name: "Boardwalk", color: "#0072CE" }
    ];

    const createProperty = (index: number) => {
        const property = properties[index];
        const isCorner = property.corner;
        const isSpecial = property.special;
        const isUtility = property.utility;
        const isRailroad = property.color === "#000000" && !isCorner;
        
        // Only keep positioning and size styles that can't be handled by Tailwind
        const positionStyle: React.CSSProperties = {};

        // Position calculation based on index - accounting for different square types
        const squareSize = 8.45; // percentage - calculated to fit exactly
        const cornerSize = 12; // percentage
        
        if (index <= 10) {
            // Bottom row (GO to JAIL)
            positionStyle.bottom = "0%";
            if (index === 0) {
                // GO corner
                positionStyle.right = "0%";
                positionStyle.width = `${cornerSize}%`;
                positionStyle.height = `${cornerSize}%`;
            } else if (index === 10) {
                // JAIL corner
                positionStyle.left = "0%";
                positionStyle.width = `${cornerSize}%`;
                positionStyle.height = `${cornerSize}%`;
            } else {
                // Regular squares between GO and JAIL
                // Calculate cumulative position from right
                const position = cornerSize + (9 - index) * squareSize;
                positionStyle.right = `${position}%`;
                positionStyle.width = `${squareSize}%`;
                positionStyle.height = `${cornerSize}%`;
            }
        } else if (index <= 20) {
            // Left side (after JAIL to FREE PARKING)
            const adjustedIndex = index - 11;
            positionStyle.left = "0%";
            if (index === 20) {
                // FREE PARKING corner
                positionStyle.top = "0%";
                positionStyle.width = `${cornerSize}%`;
                positionStyle.height = `${cornerSize}%`;
            } else {
                // Regular squares on left side
                const position = cornerSize + adjustedIndex * squareSize;
                positionStyle.bottom = `${position}%`;
                positionStyle.width = `${cornerSize}%`;
                positionStyle.height = `${squareSize}%`;
                positionStyle.writingMode = "vertical-rl";
                positionStyle.textOrientation = "mixed";
            }
        } else if (index <= 30) {
            // Top row (after FREE PARKING to GO TO JAIL)
            const adjustedIndex = index - 21;
            positionStyle.top = "0%";
            if (index === 30) {
                // GO TO JAIL corner
                positionStyle.right = "0%";
                positionStyle.width = `${cornerSize}%`;
                positionStyle.height = `${cornerSize}%`;
            } else {
                // Regular squares on top
                const position = cornerSize + adjustedIndex * squareSize;
                positionStyle.left = `${position}%`;
                positionStyle.width = `${squareSize}%`;
                positionStyle.height = `${cornerSize}%`;
                positionStyle.transform = "rotate(180deg)";
            }
        } else {
            // Right side (after GO TO JAIL back to GO)
            const adjustedIndex = 39 - index;
            positionStyle.right = "0%";
            // Regular squares on right side
            const position = cornerSize + adjustedIndex * squareSize;
            positionStyle.bottom = `${position}%`;
            positionStyle.width = `${cornerSize}%`;
            positionStyle.height = `${squareSize}%`;
            positionStyle.writingMode = "sideways-lr";
            positionStyle.textOrientation = "mixed";
        }

        // Determine text size classes
        const textSizeClass = isCorner ? "text-xs" : "text-[7px]";
        const nameTextSizeClass = property.name.length > 12 ? "text-[6px]" : isCorner ? "text-[9px]" : "text-[7px]";
        
        return (
            <div
                key={index}
                className={`
                    absolute border border-slate-200 shadow-sm
                    ${isSpecial ? "bg-slate-50/80 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm"}
                    flex flex-col items-center justify-center
                    font-medium text-center cursor-pointer
                    transition-all duration-300 overflow-hidden
                    hover:bg-white hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5
                    rounded-sm
                    ${textSizeClass}
                `}
                style={positionStyle}
            >
                {!isCorner && !isSpecial && !isUtility && !isRailroad && (
                    <div 
                        className={`
                            absolute rounded-sm
                            ${index <= 10 ? "top-0 left-0 right-0 h-1/4" :
                              index <= 20 ? "top-0 bottom-0 right-0 w-1/4" :
                              index <= 30 ? "top-0 left-0 right-0 h-1/4" :
                              "top-0 bottom-0 left-0 w-1/4"}
                        `}
                        style={{ 
                            backgroundColor: property.color,
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                        }}
                    />
                )}
                {isRailroad && (
                    <div 
                        className={`
                            absolute text-white text-[6px] flex items-center justify-center rounded-sm
                            ${index <= 10 ? "top-0 left-0 right-0 h-1/4" :
                              index <= 20 ? "top-0 bottom-0 right-0 w-1/4" :
                              index <= 30 ? "top-0 left-0 right-0 h-1/4" :
                              "top-0 bottom-0 left-0 w-1/4"}
                        `}
                        style={{ 
                            backgroundColor: property.color,
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
                        }}
                    >
                        🚂
                    </div>
                )}
                {isUtility && (
                    <div 
                        className={`
                            absolute bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-[8px] flex items-center justify-center rounded-sm shadow-inner
                            ${index <= 10 ? "top-0 left-0 right-0 h-1/4" :
                              index <= 20 ? "top-0 bottom-0 right-0 w-1/4" :
                              index <= 30 ? "top-0 left-0 right-0 h-1/4" :
                              "top-0 bottom-0 left-0 w-1/4"}
                        `}
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex flex-col items-center justify-center p-6">
            {/* Controls Panel */}
            <div className="mb-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 max-w-4xl">
                <div className="grid md:grid-cols-4 gap-3 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Mouse wheel: Z rotation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Shift + wheel: Zoom</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Ctrl/Cmd + wheel: X tilt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Alt + wheel: Y turn</span>
                    </div>
                </div>
                <div className="flex justify-center gap-2">
                    <button 
                        onClick={() => {
                            setRotationX(15);
                            setRotationY(0);
                            setRotationZ(0);
                            setScale(1);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                    >
                        Reset View
                    </button>
                    <button 
                        onClick={() => {
                            setRotationX(0);
                            setRotationY(0);
                            setRotationZ(0);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                    >
                        Flat View
                    </button>
                </div>
            </div>

            <div className="relative" style={{ perspective: "1200px" }}>
                <div
                    id="board"
                    className="relative bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-2xl border border-white/30 rounded-3xl transition-transform duration-200 ease-out backdrop-blur-sm"
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
                    <div className="absolute inset-0 m-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center border border-emerald-200/50 shadow-inner">
                        <div className="text-center">
                            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-emerald-900 mb-4 tracking-tight">
                                MULTIPOLY
                            </h1>
                            <div className="text-lg text-emerald-700/80 font-medium">
                                <p>Web3 Trading Game</p>
                            </div>
                        </div>
                    </div>

                    {/* Generate all properties */}
                    {properties.map((_, index) => createProperty(index))}
                </div>

                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30 shadow-lg">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span>Z: {Math.round(rotationZ)}°</span>
                        </div>
                        <div className="w-px h-4 bg-slate-300"></div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                            <span>X: {Math.round(rotationX)}°</span>
                        </div>
                        <div className="w-px h-4 bg-slate-300"></div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                            <span>Y: {Math.round(rotationY)}°</span>
                        </div>
                        <div className="w-px h-4 bg-slate-300"></div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span>Scale: {(scale * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

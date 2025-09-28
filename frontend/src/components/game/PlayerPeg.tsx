import React from 'react';

interface PlayerPegProps {
  playerId?: string; // Make this optional since we don't directly use it in the component
  playerNumber: number;
  position: number;
  isCurrentPlayer: boolean;
}

export function getPlayerPositionStyle(position: number, playerNumber: number) {
  // Get relative position within the property tile
  // Offset each player's peg position within the tile based on playerNumber
  const offsetX = ((playerNumber - 1) % 2) * 15; // 0px or 15px
  const offsetY = Math.floor((playerNumber - 1) / 2) * 15; // 0px, 15px for players 3-4

  // Handle board wrap-around - we have 40 positions (1-40)
  // If position goes beyond 40, wrap back around to position 1
  const normalizedPosition = ((position - 1) % 40) + 1;
  
  // Adjust position - index is 1-based (START position is 1)
  const boardPosition = normalizedPosition - 1; // Convert to 0-based index for calculation
  const squareSize = 8; // Size of each square in percentage
  
  // Calculate position based on board quadrant
  if (boardPosition <= 10) {
    // Bottom row (starting area)
    return {
      bottom: `${12}px`,
      right: `${(boardPosition * squareSize) + offsetX + 5}%`,
      transform: 'translate(50%, 50%)',
    };
  } else if (boardPosition <= 20) {
    // Left side
    return {
      bottom: `${((boardPosition - 10) * squareSize) + offsetY + 5}%`,
      left: `${12}px`,
      transform: 'translate(-50%, 50%)',
    };
  } else if (boardPosition <= 30) {
    // Top row
    return {
      top: `${12}px`,
      left: `${((boardPosition - 20) * squareSize) + offsetX + 5}%`,
      transform: 'translate(-50%, -50%)',
    };
  } else {
    // Right side
    return {
      top: `${((boardPosition - 30) * squareSize) + offsetY + 5}%`,
      right: `${12}px`,
      transform: 'translate(50%, -50%)',
    };
  }
}

interface ExtendedPlayerPegProps extends PlayerPegProps {
  isCurrentTurn?: boolean;
}

const PlayerPeg: React.FC<ExtendedPlayerPegProps> = ({ 
  playerNumber, 
  position, 
  isCurrentPlayer,
  isCurrentTurn = false 
}) => {
  // Colors for different players
  const playerColors = [
    'bg-mred border-mred',    // Player 1: Red
    'bg-mblue border-mblue',  // Player 2: Blue
    'bg-mgreen border-mgreen', // Player 3: Green
    'bg-myellow border-myellow', // Player 4: Yellow
  ];

  const colorClass = playerColors[(playerNumber - 1) % playerColors.length];
  
  // Get position style based on the player's current board position
  // Make sure position is valid and within range
  const validPosition = position > 0 ? position : 1;
  const positionStyle = getPlayerPositionStyle(validPosition, playerNumber);

  // Create a distinct appearance for current turn vs current player
  const ringClass = isCurrentTurn 
    ? 'animate-pulse ring-2 ring-black shadow-[0_0_8px_rgba(0,0,0,0.6)]' 
    : isCurrentPlayer 
      ? 'ring-2 ring-white' 
      : '';

  // Make current turn more prominent
  const scaleClass = isCurrentTurn ? 'scale-125' : '';

  return (
    <div 
      className={`absolute w-5 h-5 rounded-full border-2 ${colorClass} shadow-md z-50 
        flex items-center justify-center transition-all duration-500 ease-in-out
        ${ringClass} ${scaleClass}
      `}
      style={{
        ...positionStyle,
        transition: 'top 0.5s ease-in-out, left 0.5s ease-in-out, right 0.5s ease-in-out, bottom 0.5s ease-in-out'
      }}
    >
      <span className="text-[10px] font-bold text-white">
        {playerNumber}
      </span>
      {isCurrentTurn && (
        <div className="absolute -bottom-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
      )}
    </div>
  );
};

export default PlayerPeg;
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Multipoly is Ownable {
    struct PlayerPos {
        address user_account;
        uint256 game_id;
        uint256 position;
    }
    
    struct PlayerProperties {
        address user_account;
        uint256 game_id;
        address nft_address;
        uint256 stake_amount;
        address token;
    }

    // Interfaces
    interface IToken {
       function mint(address to, uint256 amount) external;
    }

    // Mappings
    // For PlayerPos: game_id => user_account => PlayerPos
    mapping(uint256 => mapping(address => PlayerPos)) public playerPositions;
    
    // For PlayerTurn: game_id => PlayerTurn
    mapping(uint256 => address) public playerTurns;
    
    // For PlayerProperties: user_account => game_id => PlayerProperties
    mapping(address => mapping(uint256 => PlayerProperties)) public playerProperties;
    
    // Additional helper mappings
    mapping(uint256 => address[]) public gamePlayersList; // game_id => array of players
    mapping(uint256 => mapping(address => bool)) public isPlayerInGame; // game_id => user => bool
    mapping(address => uint256[]) public userGames; // user => array of game_ids
    
    // Events
    event PlayerPositionUpdated(uint256 indexed game_id, address indexed user_account, uint256 position);
    event PlayerTurnSet(uint256 indexed game_id, address indexed user_account);
    event PlayerPropertiesSet(address indexed user_account, uint256 indexed game_id, address nft_address, uint256 stake_amount, address token);
    event PlayerJoinedGame(uint256 indexed game_id, address indexed user_account);
    event PlayerLeftGame(uint256 indexed game_id, address indexed user_account);
    event GameCreated(uint256 indexed game_id);
    
    modifier playerInGame(uint256 game_id, address user_account) {
        require(isPlayerInGame[game_id][user_account], "Player not in game");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}
    
    // ========== PLAYER POSITION CRUD OPERATIONS ==========
    
    function setPlayerPosition(
        uint256 game_id, 
        address user_account, 
        uint256 position
    ) external validAddress(user_account) {
        require(msg.sender == owner() || msg.sender == user_account, "Unauthorized");
        
        // Add player to game if not already added
        if (!isPlayerInGame[game_id][user_account]) {
            _addPlayerToGame(game_id, user_account);
        }
        
        playerPositions[game_id][user_account] = PlayerPos({
            user_account: user_account,
            game_id: game_id,
            position: position
        });
        
        emit PlayerPositionUpdated(game_id, user_account, position);
    }
    
    function getPlayerPosition(
        uint256 game_id, 
        address user_account
    ) external view returns (PlayerPos memory) {
        return playerPositions[game_id][user_account];
    }
    
    function updatePlayerPosition(
        uint256 game_id, 
        address user_account, 
        uint256 new_position
    ) external playerInGame(game_id, user_account) {
        require(msg.sender == owner() || msg.sender == user_account, "Unauthorized");
        
        playerPositions[game_id][user_account].position = new_position;
        emit PlayerPositionUpdated(game_id, user_account, new_position);
    }
    
    function deletePlayerPosition(
        uint256 game_id, 
        address user_account
    ) external playerInGame(game_id, user_account) {
        require(msg.sender == owner() || msg.sender == user_account, "Unauthorized");
        
        delete playerPositions[game_id][user_account];
        _removePlayerFromGame(game_id, user_account);
        emit PlayerLeftGame(game_id, user_account);
    }
    
    // ========== PLAYER TURN CRUD OPERATIONS ==========
    
    function setPlayerTurn(
        uint256 game_id, 
        address user_account
    ) external validAddress(user_account) {
        require(msg.sender == owner(), "Only owner can set turns");
        require(isPlayerInGame[game_id][user_account], "Player not in game");
        
        playerTurns[game_id] = user_account;
        
        emit PlayerTurnSet(game_id, user_account);
    }
    
    function getPlayerTurn(uint256 game_id) external view returns (address) {
        return playerTurns[game_id];
    }
    
    function updatePlayerTurn(
        uint256 game_id, 
        address new_user_account
    ) external validAddress(new_user_account) {
        require(isPlayerInGame[game_id][new_user_account], "Player not in game");
        
        playerTurns[game_id] = new_user_account;
        emit PlayerTurnSet(game_id, new_user_account);
    }
    
    // ========== PLAYER PROPERTIES CRUD OPERATIONS ==========
    
    function setPlayerProperties(
        address user_account,
        uint256 game_id,
        address nft_address,
        uint256 stake_amount,
        address token
    ) external validAddress(user_account) validAddress(token) {
        require(isPlayerInGame[game_id][user_account], "Player not in game");
        if (nft_address != address(0)) {
            require(IERC721(nft_address).balanceOf(user_account) > 0, "User does not own NFT");
        }
        
        playerProperties[user_account][game_id] = PlayerProperties({
            user_account: user_account,
            game_id: game_id,
            nft_address: nft_address,
            stake_amount: stake_amount,
            token: token
        });
        
        emit PlayerPropertiesSet(user_account, game_id, nft_address, stake_amount, token);
    }
    
    function getPlayerProperties(
        address user_account, 
        uint256 game_id
    ) external view returns (PlayerProperties memory) {
        return playerProperties[user_account][game_id];
    }
    
    function updatePlayerStakeAmount(
        address user_account,
        uint256 game_id,
        uint256 new_stake_amount
    ) external playerInGame(game_id, user_account) {
        require(msg.sender == owner() || msg.sender == user_account, "Unauthorized");
        
        playerProperties[user_account][game_id].stake_amount = new_stake_amount;
        emit PlayerPropertiesSet(
            user_account, 
            game_id, 
            playerProperties[user_account][game_id].nft_address,
            new_stake_amount,
            playerProperties[user_account][game_id].token
        );
    }
    
    function updatePlayerNFT(
        address user_account,
        uint256 game_id,
        address new_nft_address
    ) external playerInGame(game_id, user_account) {
        require(msg.sender == owner() || msg.sender == user_account, "Unauthorized");
        
        if (new_nft_address != address(0)) {
            require(IERC721(new_nft_address).balanceOf(user_account) > 0, "User does not own NFT");
        }
        
        playerProperties[user_account][game_id].nft_address = new_nft_address;
        emit PlayerPropertiesSet(
            user_account, 
            game_id, 
            new_nft_address,
            playerProperties[user_account][game_id].stake_amount,
            playerProperties[user_account][game_id].token
        );
    }
    
    function deletePlayerProperties(
        address user_account, 
        uint256 game_id
    ) external playerInGame(game_id, user_account) {
        require(msg.sender == owner() || msg.sender == user_account, "Unauthorized");
        
        delete playerProperties[user_account][game_id];
    }
    
    // ========== HELPER FUNCTIONS ==========
    
    function _addPlayerToGame(uint256 game_id, address user_account) internal {
        if (!isPlayerInGame[game_id][user_account]) {
            gamePlayersList[game_id].push(user_account);
            isPlayerInGame[game_id][user_account] = true;
            userGames[user_account].push(game_id);
            emit PlayerJoinedGame(game_id, user_account);
        }
    }
    
    function _removePlayerFromGame(uint256 game_id, address user_account) internal {
        if (isPlayerInGame[game_id][user_account]) {
            isPlayerInGame[game_id][user_account] = false;
            
            // Remove from gamePlayersList
            address[] storage players = gamePlayersList[game_id];
            for (uint256 i = 0; i < players.length; i++) {
                if (players[i] == user_account) {
                    players[i] = players[players.length - 1];
                    players.pop();
                    break;
                }
            }
            
            // Remove from userGames
            uint256[] storage games = userGames[user_account];
            for (uint256 i = 0; i < games.length; i++) {
                if (games[i] == game_id) {
                    games[i] = games[games.length - 1];
                    games.pop();
                    break;
                }
            }
        }
    }
    
    // ========== QUERY FUNCTIONS ==========
    
    function getGamePlayers(uint256 game_id) external view returns (address[] memory) {
        return gamePlayersList[game_id];
    }
    
    function getUserGames(address user_account) external view returns (uint256[] memory) {
        return userGames[user_account];
    }
    
    function getPlayerCount(uint256 game_id) external view returns (uint256) {
        return gamePlayersList[game_id].length;
    }
    
    function isPlayerInGameView(uint256 game_id, address user_account) external view returns (bool) {
        return isPlayerInGame[game_id][user_account];
    }
    
    // ========== BATCH OPERATIONS ==========
    
    function batchSetPlayerPositions(
        uint256 game_id,
        address[] calldata user_accounts,
        uint256[] calldata positions
    ) external {
        require(msg.sender == owner(), "Only owner can batch set positions");
        require(user_accounts.length == positions.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < user_accounts.length; i++) {
            require(user_accounts[i] != address(0), "Invalid address");
            
            if (!isPlayerInGame[game_id][user_accounts[i]]) {
                _addPlayerToGame(game_id, user_accounts[i]);
            }
            
            playerPositions[game_id][user_accounts[i]] = PlayerPos({
                user_account: user_accounts[i],
                game_id: game_id,
                position: positions[i]
            });
            
            emit PlayerPositionUpdated(game_id, user_accounts[i], positions[i]);
        }
    }
    
    function getAllPlayerPositionsInGame(uint256 game_id) external view returns (PlayerPos[] memory) {
        address[] memory players = gamePlayersList[game_id];
        PlayerPos[] memory positions = new PlayerPos[](players.length);
        
        for (uint256 i = 0; i < players.length; i++) {
            positions[i] = playerPositions[game_id][players[i]];
        }
        
        return positions;
    }

    function mintAllTokens(address player_address, address token_address_1, address token_address_2, address token_address_3, address token_address_4) external{
        require(token_address_1 != address(0) && token_address_2 != address(0) && token_address_3 != address(0) && token_address_4 != address(0), "Invalid token address");
        IToken(token_address_1).mint(player_address, 100);
        IToken(token_address_2).mint(player_address, 100);
        IToken(token_address_3).mint(player_address, 100);
        IToken(token_address_4).mint(player_address, 100);
    }
}
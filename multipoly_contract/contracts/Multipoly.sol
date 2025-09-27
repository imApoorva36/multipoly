// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// Interfaces
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function mint(address to, uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
}

interface IPropertyNFT {
    struct Property {
        address owner;
        string name;
        uint256 position;
        address tokenAddress;
        uint256 purchaseValue;
        uint256 rentAmount;
    }

    function mint(
        address to,
        string memory name,
        uint256 position,
        address tokenAddress,
        uint256 purchaseValue
    ) external returns (uint256);

    function _ownerOf(uint256 tokenId) external view returns (address);

    function getProperty(
        uint256 tokenId
    ) external view returns (Property memory);
}

contract Multipoly is Ownable {
    address public immutable PROPERTY_NFT;

    struct PlayerPos {
        address user_account;
        uint256 game_id;
        uint256 position;
    }

    struct PlayerProperties {
        uint256 nft_id;
        uint256 stake_amount;
        address token;
        bool exists;
    }

    mapping(uint256 => mapping(address => mapping(uint256 => PlayerProperties)))
        public playerProperties;
    // gameId => user => nftId => properties
    mapping(uint256 => mapping(address => uint256[])) private userNFTs;
    // gameId => user => list of nftIds

    // Mappings
    // For PlayerPos: game_id => user_account => PlayerPos
    mapping(uint256 => mapping(address => PlayerPos)) public playerPositions;

    // For PlayerTurn: game_id => PlayerTurn
    mapping(uint256 => address) public playerTurns;

    // Additional helper mappings
    mapping(uint256 => address[]) public gamePlayersList; // game_id => array of players
    mapping(uint256 => mapping(address => bool)) public isPlayerInGame; // game_id => user => bool
    mapping(address => uint256[]) public userGames; // user => array of game_ids

    // Events
    event PlayerPositionUpdated(
        uint256 indexed game_id,
        address indexed user_account,
        uint256 position
    );
    event PlayerTurnSet(uint256 indexed game_id, address indexed user_account);
    event PlayerPropertiesSet(
        address indexed user_account,
        uint256 indexed game_id,
        uint256 nft_id,
        uint256 stake_amount,
        address token
    );
    event PlayerJoinedGame(
        uint256 indexed game_id,
        address indexed user_account
    );
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

    constructor(
        address initialOwner,
        address _property_nft
    ) Ownable(initialOwner) {
        PROPERTY_NFT = _property_nft;
    }

    // ========== PLAYER POSITION CRUD OPERATIONS ==========

    function setPlayerPosition(
        uint256 game_id,
        address user_account,
        uint256 position
    ) internal validAddress(user_account) {
        require(
            msg.sender == owner() || msg.sender == user_account,
            "Unauthorized"
        );

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
    ) public view returns (PlayerPos memory) {
        return playerPositions[game_id][user_account];
    }

    function updatePlayerPosition(
        uint256 game_id,
        address user_account,
        uint256 new_position
    ) internal playerInGame(game_id, user_account) {
        require(
            msg.sender == owner() || msg.sender == user_account,
            "Unauthorized"
        );

        playerPositions[game_id][user_account].position = new_position;
        emit PlayerPositionUpdated(game_id, user_account, new_position);
    }

    function deletePlayerPosition(
        uint256 game_id,
        address user_account
    ) external playerInGame(game_id, user_account) {
        require(
            msg.sender == owner() || msg.sender == user_account,
            "Unauthorized"
        );

        delete playerPositions[game_id][user_account];
        _removePlayerFromGame(game_id, user_account);
        emit PlayerLeftGame(game_id, user_account);
    }

    // ========== PLAYER TURN CRUD OPERATIONS ==========

    function setPlayerTurn(
        uint256 game_id,
        address user_account
    ) internal validAddress(user_account) {
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
        require(
            isPlayerInGame[game_id][new_user_account],
            "Player not in game"
        );

        playerTurns[game_id] = new_user_account;
        emit PlayerTurnSet(game_id, new_user_account);
    }

    // ========== PLAYER PROPERTIES CRUD OPERATIONS ==========

    function setPlayerProperty(
        uint256 game_id,
        address user_account,
        uint256 nft_id
    ) internal validAddress(user_account) {
        require(isPlayerInGame[game_id][user_account], "Player not in game");

        if (!playerProperties[game_id][user_account][nft_id].exists) {
            userNFTs[game_id][user_account].push(nft_id);
        }

        playerProperties[game_id][user_account][nft_id] = PlayerProperties({
            nft_id: nft_id,
            stake_amount: 0,
            token: address(0),
            exists: true
        });

        emit PlayerPropertiesSet(user_account, game_id, nft_id, 0, address(0));
    }

    function getPlayerProperty(
        uint256 game_id,
        address user_account,
        uint256 nft_id
    ) external view returns (PlayerProperties memory) {
        require(
            playerProperties[game_id][user_account][nft_id].exists,
            "Property not found"
        );
        return playerProperties[game_id][user_account][nft_id];
    }

    function updatePlayerStakeAmount(
        uint256 game_id,
        address user_account,
        uint256 nft_id,
        uint256 new_stake_amount,
        address new_token_address
    ) external playerInGame(game_id, user_account) {
        require(
            msg.sender == owner() || msg.sender == user_account,
            "Unauthorized"
        );

        PlayerProperties storage prop = playerProperties[game_id][user_account][
            nft_id
        ];
        require(prop.exists, "Property not found");

        prop.stake_amount = new_stake_amount;
        prop.token = new_token_address;

        emit PlayerPropertiesSet(
            user_account,
            game_id,
            nft_id,
            new_stake_amount,
            new_token_address
        );
    }

    function deletePlayerProperty(
        uint256 game_id,
        address user_account,
        uint256 nft_id
    ) external playerInGame(game_id, user_account) {
        require(
            msg.sender == owner() || msg.sender == user_account,
            "Unauthorized"
        );

        require(
            playerProperties[game_id][user_account][nft_id].exists,
            "Property not found"
        );

        delete playerProperties[game_id][user_account][nft_id];
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

    function _removePlayerFromGame(
        uint256 game_id,
        address user_account
    ) internal {
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

    function getGamePlayers(
        uint256 game_id
    ) public view returns (address[] memory) {
        return gamePlayersList[game_id];
    }

    function getUserGames(
        address user_account
    ) external view returns (uint256[] memory) {
        return userGames[user_account];
    }

    function getPlayerCount(uint256 game_id) external view returns (uint256) {
        return gamePlayersList[game_id].length;
    }

    function isPlayerInGameView(
        uint256 game_id,
        address user_account
    ) external view returns (bool) {
        return isPlayerInGame[game_id][user_account];
    }

    // ========== BATCH OPERATIONS ==========

    function batchSetPlayerPositions(
        uint256 game_id,
        address[] calldata user_accounts,
        uint256[] calldata positions
    ) external {
        require(msg.sender == owner(), "Only owner can batch set positions");
        require(
            user_accounts.length == positions.length,
            "Arrays length mismatch"
        );

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

    function getAllPlayerPositionsInGame(
        uint256 game_id
    ) external view returns (PlayerPos[] memory) {
        address[] memory players = gamePlayersList[game_id];
        PlayerPos[] memory positions = new PlayerPos[](players.length);

        for (uint256 i = 0; i < players.length; i++) {
            positions[i] = playerPositions[game_id][players[i]];
        }

        return positions;
    }

    // Token functions
    function mintAllTokens(
        address player_address,
        address token_address_1,
        address token_address_2,
        address token_address_3,
        address token_address_4
    ) external {
        require(
            token_address_1 != address(0) &&
                token_address_2 != address(0) &&
                token_address_3 != address(0) &&
                token_address_4 != address(0),
            "Invalid token address"
        );
        IERC20(token_address_1).mint(player_address, 100);
        IERC20(token_address_2).mint(player_address, 100);
        IERC20(token_address_3).mint(player_address, 100);
        IERC20(token_address_4).mint(player_address, 100);
    }

    function burnAllTokens(
        address player_address,
        address token_address_1,
        address token_address_2,
        address token_address_3,
        address token_address_4
    ) external {
        require(
            token_address_1 != address(0) &&
                token_address_2 != address(0) &&
                token_address_3 != address(0) &&
                token_address_4 != address(0),
            "Invalid token address"
        );
        uint256 amount_1 = IERC20(token_address_1).balanceOf(player_address);
        uint256 amount_2 = IERC20(token_address_2).balanceOf(player_address);
        uint256 amount_3 = IERC20(token_address_3).balanceOf(player_address);
        uint256 amount_4 = IERC20(token_address_4).balanceOf(player_address);
        IERC20(token_address_1).burnFrom(player_address, amount_1);
        IERC20(token_address_2).burnFrom(player_address, amount_2);
        IERC20(token_address_3).burnFrom(player_address, amount_3);
        IERC20(token_address_4).burnFrom(player_address, amount_4);
    }

    function debit(
        address player_address,
        address token_address,
        uint256 amount
    ) public {
        require(token_address != address(0), "Invalid token address");
        uint256 current_balance = IERC20(token_address).balanceOf(
            player_address
        );
        require(current_balance >= amount, "Insufficient balance");
        IERC20(token_address).burnFrom(player_address, amount);
    }

    function credit(
        address player_address,
        address token_address,
        uint256 amount
    ) public {
        require(token_address != address(0), "Invalid token address");
        IERC20(token_address).mint(player_address, amount);
    }

    // NFT functions
    function purchaseProperty(
        address player_address,
        string memory name,
        uint256 position,
        address token_address,
        uint256 purchase_value,
        uint256 game_id,
        address next_player
    ) internal {
        require(playerTurns[game_id] == player_address, "Not your turn");
        debit(player_address, token_address, purchase_value);
        uint256 nftId = IPropertyNFT(PROPERTY_NFT).mint(
            player_address,
            name,
            position,
            token_address,
            purchase_value
        );
        setPlayerProperty(game_id, player_address, nftId);
        setPlayerTurn(game_id, next_player);
    }

    function getPropertyDetails(
        uint256 token_id
    ) external view returns (IPropertyNFT.Property memory) {
        return IPropertyNFT(PROPERTY_NFT).getProperty(token_id);
    }

    // Helper Functions

    // Sets up a new player in a game with default position and set the turm to be theirs
    function onboardPlayer(uint256 game_id, address user_account) external {
        _addPlayerToGame(game_id, user_account);
        setPlayerPosition(game_id, user_account, 0);
        setPlayerTurn(game_id, user_account);
    }

    function move(
        uint256 game_id,
        address user_account,
        uint256 steps,
        bool purchase,
        string memory name,
        address token_address,
        uint256 purchase_value,
        address next_player
    ) external {
        require(isPlayerInGame[game_id][user_account], "Player not in game");
        uint256 current_position = playerPositions[game_id][user_account]
            .position;
        uint256 new_position = (current_position + steps);
        updatePlayerPosition(game_id, user_account, new_position);

        if (purchase) {
            purchaseProperty(
                user_account,
                name,
                new_position,
                token_address,
                purchase_value,
                game_id,
                next_player
            );
        } else {
            setPlayerTurn(game_id, next_player);
        }
    }

    function getAllPlayerProperties(
        uint256 game_id,
        address user_account
    ) public view returns (PlayerProperties[] memory) {
        uint256[] memory nfts = userNFTs[game_id][user_account];
        PlayerProperties[] memory props = new PlayerProperties[](nfts.length);

        for (uint256 i = 0; i < nfts.length; i++) {
            props[i] = playerProperties[game_id][user_account][nfts[i]];
        }

        return props;
    }

    function getGameState(
        uint256 game_id,
        address user_account
    )
        external
        view
        returns (
            PlayerPos[] memory, // list of player - positions pairs
            PlayerProperties[] memory // properties of the user
        )
    {
        address[] memory players = getGamePlayers(game_id);
        PlayerPos[] memory positions = new PlayerPos[](players.length);
        for (uint256 i = 0; i < players.length; i++) {
            positions[i] = playerPositions[game_id][players[i]];
        }
        PlayerProperties[] memory user_props = getAllPlayerProperties(
            game_id,
            user_account
        );
        return (
            positions,
            user_props
        );
    }
}

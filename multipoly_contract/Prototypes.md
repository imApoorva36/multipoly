## Constructor
constructor(address initialOwner)

## Player Position CRUD Operations
`function setPlayerPosition(uint256 game_id, address user_account, uint256 position) external`

`function getPlayerPosition(uint256 game_id, address user_account) external view returns (PlayerPos memory)`

`function updatePlayerPosition(uint256 game_id, address user_account, uint256 new_position) external`

`function deletePlayerPosition(uint256 game_id, address user_account) external`


## Player Turn CRUD Operations
`function setPlayerTurn(uint256 game_id, address user_account) external`

`function getPlayerTurn(uint256 game_id) external view returns (address)`

`function updatePlayerTurn(uint256 game_id, address new_user_account) external`


## Player Properties CRUD Operations
`function setPlayerProperties(address user_account, uint256 game_id, address nft_address, uint256 stake_amount, address token) external`

`function getPlayerProperties(address user_account, uint256 game_id) external view returns (PlayerProperties memory)`

`function updatePlayerStakeAmount(address user_account, uint256 game_id, uint256 new_stake_amount) external`

`function updatePlayerNFT(address user_account, uint256 game_id, address new_nft_address) external`

`function deletePlayerProperties(address user_account, uint256 game_id) external`


## Query Functions
`function getGamePlayers(uint256 game_id) external view returns (address[] memory)`

`function getUserGames(address user_account) external view returns (uint256[] memory)`

`function getPlayerCount(uint256 game_id) external view returns (uint256)`

`function isPlayerInGameView(uint256 game_id, address user_account) external view returns (bool)`


## Batch Operations
`function batchSetPlayerPositions(uint256 game_id, address[] calldata user_accounts, uint256[] calldata positions) external`

`function getAllPlayerPositionsInGame(uint256 game_id) external view returns (PlayerPos[] memory)`


## Token Minting Operations
`function mintAllTokens(address player_address, address token_address_1, address token_address_2, address token_address_3, address token_address_4) external`


## Internal Helper Functions
`function _addPlayerToGame(uint256 game_id, address user_account) internal`

`function _removePlayerFromGame(uint256 game_id, address user_account) internal`


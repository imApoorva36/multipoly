// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyNFT is ERC721, Ownable {
    uint256 private _nextTokenId = 1;

    struct Property {
        address owner;        // address of the owner of the property
        string name;          // e.g. "Boardwalk"
        uint256 position;     // board position (1-40)
        address tokenAddress; // ERC20 token associated with color group
        uint256 purchaseValue;// cost to buy
        uint256 rentAmount;
    }

    mapping(uint256 => Property) private _properties;

    constructor() ERC721("Property", "MNP") Ownable(msg.sender) {}

    function mint(
        address to,
        string memory name,
        uint256 position,
        address tokenAddress,
        uint256 purchaseValue
    ) external returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _safeMint(to, tokenId);

        _properties[tokenId] = Property({
            owner: msg.sender,
            name: name,
            position: position,
            tokenAddress: tokenAddress,
            purchaseValue: purchaseValue,
            rentAmount: 5
        });

        _nextTokenId++;
        return tokenId;
    }

    function getProperty(uint256 tokenId) external view returns (Property memory) {
        require(_ownerOf(tokenId) != address(0), "Query for nonexistent token");
        return _properties[tokenId];
    }
}

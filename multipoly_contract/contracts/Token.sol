// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    uint8 private _decimals;
    address public allowedMinter;
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 tokenDecimals,
        address initialOwner,
        address minterContract
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _decimals = tokenDecimals;
        _mint(initialOwner, initialSupply * 10**tokenDecimals);
        allowedMinter = minterContract;
    }
    
    modifier onlyAllowedMinter() {
        require(msg.sender == allowedMinter, "Not authorized to mint");
        _;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) public onlyAllowedMinter{
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    function burnFrom(address from, uint256 amount) public {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }
}
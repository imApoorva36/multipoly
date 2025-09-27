require('dotenv').config();
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseUnits } from "ethers";

const MultipolyDeployment = buildModule("MultipolyDeployment", (m) => {
    const multipoly = m.contract("Multipoly");
    
    const deployer = m.getAccount(0);
    
    // Token 1
    const defiToken = m.contract("Token", [
        "DeFi Token",           // name
        "DEFI",                 // symbol
        parseUnits("5000000", 18), // initial supply (5M tokens with 18 decimals)
        18,                     // decimals
        deployer,               // initial owner
        multipoly               // minter contract (use contract instance, not .address)
    ], {
        id: "DeFiToken"
    });

    // Token 2
    const gameToken = m.contract("Token", [
        "Gaming Token",         // name
        "GAME",                 // symbol
        parseUnits("5000000", 18), // initial supply (5M tokens with 18 decimals)
        18,                     // decimals
        deployer,               // initial owner
        multipoly               // minter contract
    ], {
        id: "GamingToken"
    });

    // Token 3
    const utilToken = m.contract("Token", [
        "Utility Token",        // name
        "UTIL",                 // symbol
        parseUnits("5000000", 18), // initial supply (5M tokens with 18 decimals)
        18,                     // decimals
        deployer,               // initial owner
        multipoly               // minter contract
    ], {
        id: "UtilityToken"
    });

    // Token 4
    const rewardToken = m.contract("Token", [
        "Reward Token",         // name
        "RWRD",                 // symbol
        parseUnits("5000000", 18), // initial supply (5M tokens with 18 decimals)
        18,                     // decimals
        deployer,               // initial owner
        multipoly               // minter contract
    ], {
        id: "RewardToken"
    });

    return {
        multipoly,
        defiToken,
        gameToken,
        utilToken,
        rewardToken
    };
});

export default MultipolyDeployment;
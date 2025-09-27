require('dotenv').config();
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseUnits } from "ethers";

const MultipolyDeployment = buildModule("MultipolyDeployment", (m) => {    
    const deployer = m.getAccount(0);
    const propertyNFT = m.contract("PropertyNFT");
    const multipoly = m.contract("Multipoly", [deployer, propertyNFT]);
    
    // Token 1
    const emeraldToken = m.contract("Token", [
        "Emerald",          
        "EMRD",                 
        parseUnits("5000000", 18),
        18,                     
        deployer,               
        multipoly               
    ], {
        id: "Emerald"
    });

    // Token 2
    const goldenToken = m.contract("Token", [
        "Golden",         
        "GLDN",                 
        parseUnits("5000000", 18),
        18,                     
        deployer,               
        multipoly               
    ], {
        id: "Golden"
    });

    // Token 3
    const rubyToken = m.contract("Token", [
        "Ruby",        
        "RUBY",                 
        parseUnits("5000000", 18),
        18,                     
        deployer,               
        multipoly               
    ], {
        id: "Ruby"
    });

    // Token 4
    const amethystToken = m.contract("Token", [
        "Amethyst",         
        "AMTY",                 
        parseUnits("5000000", 18),
        18,                     
        deployer,               
        multipoly               
    ], {
        id: "Amethyst"
    });

    
    return {
        multipoly,
        emeraldToken,
        goldenToken,
        rubyToken,
        amethystToken,
        propertyNFT
    };
});

export default MultipolyDeployment;

// MultipolyDeployment#PropertyNFT - 0x20ACA5a43EB42032b27e6bd6E75e2Fb18ceFca5B
// MultipolyDeployment#Multipoly - 0x70350506655B3c5C6362a71d41D73fA472245319
// MultipolyDeployment#Amethyst - 0xEcb8e6B670A745B9Bf154ed273cBefA1967B3a46
// MultipolyDeployment#Emerald - 0xaCa7C005214D767097192Ae8e7004c2E01BC2239
// MultipolyDeployment#Golden - 0x4137c6b8Ca755738F3c79a67C9Da3d9c2D6aCe28
// MultipolyDeployment#Ruby - 0x1818f60807e34d186c59D87b5cfEb135Ad77e7Eb
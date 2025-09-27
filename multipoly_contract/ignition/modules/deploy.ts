require('dotenv').config();
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseUnits } from "ethers";

const MultipolyDeployment = buildModule("MultipolyDeployment", (m) => {
    const multipoly = m.contract("Multipoly");
    
    const deployer = m.getAccount(0);
    
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

    
    const propertyNFT = m.contract("PropertyNFT");
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
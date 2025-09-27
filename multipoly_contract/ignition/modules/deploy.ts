require('dotenv').config();
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseUnits } from "ethers";

const MultipolyDeployment = buildModule("MultipolyDeployment", (m) => {    
    const deployer = m.getAccount(0);
    
    const multipoly = m.contract("Multipoly", [deployer]);
    
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

// MultipolyDeployment#Multipoly - 0x57d35D61646BBbA208291505b65f1fdD32371daE
// MultipolyDeployment#PropertyNFT - 0xD209FbAB8Bd7C7d25Cc6a6245d88f9Ea09DD63FC
// MultipolyDeployment#Amethyst - 0x06efaA839dD76b9e2737Cb722A3e4A8bCc55D781
// MultipolyDeployment#Emerald - 0xFD590eD174E0c02ad7BcE6AF6cB7a58e3B1f5828
// MultipolyDeployment#Golden - 0xBAe2197598390E7362BEdA97Befd485d76970Cba
// MultipolyDeployment#Ruby - 0xa891917fd97dc08790955da1bc36B2554671b37A
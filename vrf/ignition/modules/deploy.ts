require('dotenv').config();
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const DiceRollDeployment = buildModule("DiceRollDeployment", (m) => {
  const dice_roll = m.contract("DiceRoll");
  return {
    dice_roll
  };
});

export default DiceRollDeployment;

// DiceRollDeployment#DiceRoll - 0xa7EE86A6BDE7CA388398C4ECdc11588bCe6CF3dc - flow_evm_testnet(545)
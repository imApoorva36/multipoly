// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract DiceRoll {
    address constant public cadenceArch = 0x0000000000000000000000010000000000000001;

    function revertibleRandom() public view returns (uint64) {
        (bool ok, bytes memory data) = cadenceArch.staticcall(abi.encodeWithSignature("revertibleRandom()"));
        require(ok, "Failed to fetch a random number through Cadence Arch");
        uint64 output = (abi.decode(data, (uint64))%6)+1;
        return output;
    }
}

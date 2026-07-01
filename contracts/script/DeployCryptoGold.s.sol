// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {CryptoGold} from "../CryptoGold.sol";

/**
 * Deploy CGOLD on BNB Smart Chain (testnet or mainnet).
 *
 * Env:
 *   DEPLOYER_PRIVATE_KEY
 *   TREASURY_ADDRESS (optional)
 *   INITIAL_TREASURY_MINT_TOKENS — whole tokens minted to treasury at deploy (default 0)
 */
contract DeployCryptoGold is Script {
    function run() external returns (CryptoGold token) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address treasury = vm.addr(deployerKey);
        if (vm.envExists("TREASURY_ADDRESS")) {
            treasury = vm.envAddress("TREASURY_ADDRESS");
        }

        uint256 initialTokens = 0;
        if (vm.envExists("INITIAL_TREASURY_MINT_TOKENS")) {
            initialTokens = vm.envUint("INITIAL_TREASURY_MINT_TOKENS");
        }
        uint256 initialMint = initialTokens * 10 ** 18;

        require(treasury != address(0), "TREASURY_ADDRESS required");

        vm.startBroadcast(deployerKey);

        token = new CryptoGold(treasury, initialMint);

        vm.stopBroadcast();

        console2.log("Network chainId:", block.chainid);
        console2.log("CryptoGold (CGOLD):", address(token));
        console2.log("Owner (minter):", token.owner());
        console2.log("Treasury:", treasury);
        console2.log("Initial treasury mint (tokens):", initialTokens);
        console2.log("Total supply after deploy:", token.totalSupply());
        console2.log("Remaining mintable:", token.remainingMintable());
    }
}

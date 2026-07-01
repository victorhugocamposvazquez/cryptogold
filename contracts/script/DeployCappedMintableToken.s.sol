// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {CappedMintableToken} from "../CappedMintableToken.sol";

contract DeployCappedMintableToken is Script {
    function run() external returns (CappedMintableToken token) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address treasury = vm.addr(deployerKey);
        if (vm.envExists("TREASURY_ADDRESS")) {
            treasury = vm.envAddress("TREASURY_ADDRESS");
        }

        string memory name_ = vm.envOr("TOKEN_NAME", string("CryptoGold"));
        string memory symbol_ = vm.envOr("TOKEN_SYMBOL", string("CGOLD"));

        uint256 maxTokens = vm.envOr("TOKEN_MAX_SUPPLY", uint256(12_000_000_000));
        uint256 maxSupply = maxTokens * 10 ** 18;

        uint256 initialTokens = vm.envOr("INITIAL_TREASURY_MINT_TOKENS", uint256(0));
        uint256 initialMint = initialTokens * 10 ** 18;

        require(treasury != address(0), "TREASURY_ADDRESS required");

        vm.startBroadcast(deployerKey);

        token = new CappedMintableToken(name_, symbol_, maxSupply, treasury, initialMint);

        vm.stopBroadcast();

        console2.log("Network chainId:", block.chainid);
        console2.log("Token:", address(token));
        console2.log("Name:", token.name());
        console2.log("Symbol:", token.symbol());
        console2.log("Max supply (tokens):", maxTokens);
        console2.log("Owner:", token.owner());
        console2.log("Treasury:", treasury);
        console2.log("Initial mint (tokens):", initialTokens);
        console2.log("Total supply after deploy:", token.totalSupply());
    }
}

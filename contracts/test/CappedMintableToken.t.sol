// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {CappedMintableToken} from "../CappedMintableToken.sol";

contract CappedMintableTokenTest is Test {
    CappedMintableToken internal token;
    address internal treasury = address(0xBEEF);
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);
    address internal deployer = address(this);

    uint256 internal constant CAP = 12_000_000_000 * 10 ** 18;

    function setUp() public {
        token = new CappedMintableToken("CryptoGold", "CGOLD", CAP, treasury, 1_000_000 ether);
    }

    function test_metadata() public view {
        assertEq(token.name(), "CryptoGold");
        assertEq(token.symbol(), "CGOLD");
        assertEq(token.decimals(), 18);
        assertEq(token.maxSupply(), CAP);
        assertEq(token.MAX_SUPPLY(), CAP);
    }

    function test_custom_metadata() public {
        CappedMintableToken t = new CappedMintableToken("My Token", "MYT", 1_000_000 ether, treasury, 0);
        assertEq(t.name(), "My Token");
        assertEq(t.symbol(), "MYT");
        assertEq(t.maxSupply(), 1_000_000 ether);
    }

    function test_initial_mint_to_treasury() public view {
        assertEq(token.balanceOf(treasury), 1_000_000 ether);
        assertEq(token.totalSupply(), 1_000_000 ether);
        assertEq(token.remainingMintable(), CAP - 1_000_000 ether);
    }

    function test_deploy_zero_initial() public {
        CappedMintableToken t = new CappedMintableToken("CryptoGold", "CGOLD", CAP, treasury, 0);
        assertEq(t.totalSupply(), 0);
        assertEq(t.remainingMintable(), CAP);
    }

    function test_revert_zero_treasury() public {
        vm.expectRevert("treasury required");
        new CappedMintableToken("CryptoGold", "CGOLD", CAP, address(0), 0);
    }

    function test_revert_initial_exceeds_cap() public {
        vm.expectRevert("initial exceeds cap");
        new CappedMintableToken("CryptoGold", "CGOLD", CAP, treasury, CAP + 1);
    }

    function test_owner_mint() public {
        vm.prank(deployer);
        token.mint(alice, 500_000 ether);
        assertEq(token.balanceOf(alice), 500_000 ether);
    }

    function test_revert_mint_not_owner() public {
        vm.prank(alice);
        vm.expectRevert("not owner");
        token.mint(bob, 1 ether);
    }

    function test_revert_mint_exceeds_cap() public {
        vm.prank(deployer);
        vm.expectRevert("cap exceeded");
        token.mint(alice, CAP);
    }

    function test_transfer() public {
        vm.prank(treasury);
        assertTrue(token.transfer(alice, 100_000 ether));
        assertEq(token.balanceOf(alice), 100_000 ether);
    }

    function test_transfer_ownership() public {
        vm.prank(deployer);
        token.transferOwnership(alice);
        assertEq(token.owner(), alice);
        vm.prank(alice);
        token.mint(bob, 1 ether);
        assertEq(token.balanceOf(bob), 1 ether);
    }
}

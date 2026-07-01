// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {CryptoGold} from "../CryptoGold.sol";

contract CryptoGoldTest is Test {
    CryptoGold internal token;
    address internal treasury = address(0xBEEF);
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);
    address internal deployer = address(this);

    uint256 internal constant MAX = 12_000_000_000 * 10 ** 18;

    function setUp() public {
        token = new CryptoGold(treasury, 1_000_000 ether);
    }

    function test_metadata() public view {
        assertEq(token.name(), "CryptoGold");
        assertEq(token.symbol(), "CGOLD");
        assertEq(token.decimals(), 18);
        assertEq(token.MAX_SUPPLY(), MAX);
    }

    function test_initial_mint_to_treasury() public view {
        assertEq(token.balanceOf(treasury), 1_000_000 ether);
        assertEq(token.totalSupply(), 1_000_000 ether);
        assertEq(token.remainingMintable(), MAX - 1_000_000 ether);
    }

    function test_deploy_zero_initial() public {
        CryptoGold t = new CryptoGold(treasury, 0);
        assertEq(t.totalSupply(), 0);
        assertEq(t.remainingMintable(), MAX);
    }

    function test_revert_zero_treasury() public {
        vm.expectRevert("treasury required");
        new CryptoGold(address(0), 0);
    }

    function test_revert_initial_exceeds_cap() public {
        vm.expectRevert("initial exceeds cap");
        new CryptoGold(treasury, MAX + 1);
    }

    function test_owner_mint() public {
        vm.prank(deployer);
        token.mint(alice, 500_000 ether);
        assertEq(token.balanceOf(alice), 500_000 ether);
        assertEq(token.totalSupply(), 1_500_000 ether);
    }

    function test_revert_mint_not_owner() public {
        vm.prank(alice);
        vm.expectRevert("not owner");
        token.mint(bob, 1 ether);
    }

    function test_revert_mint_exceeds_cap() public {
        vm.prank(deployer);
        vm.expectRevert("cap exceeded");
        token.mint(alice, MAX);
    }

    function test_transfer() public {
        vm.prank(treasury);
        assertTrue(token.transfer(alice, 100_000 ether));
        assertEq(token.balanceOf(alice), 100_000 ether);
    }

    function test_approve_and_transferFrom() public {
        vm.prank(treasury);
        token.approve(bob, 50_000 ether);
        vm.prank(bob);
        assertTrue(token.transferFrom(treasury, alice, 50_000 ether));
        assertEq(token.balanceOf(alice), 50_000 ether);
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

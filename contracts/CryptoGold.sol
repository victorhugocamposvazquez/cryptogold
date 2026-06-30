// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CryptoGold (CGOLD)
 * @notice Fixed-supply ERC-20. No mint. No burn. 12 billion tokens with 18 decimals.
 * @dev Deploy with Foundry/Hardhat. Audit before mainnet. Verify on block explorer.
 */
contract CryptoGold {
    string public constant name = "CryptoGold";
    string public constant symbol = "CGOLD";
    uint8 public constant decimals = 18;
    uint256 public constant TOTAL_SUPPLY = 12_000_000_000 * 10 ** 18;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(address treasury) {
        require(treasury != address(0), "treasury required");
        balanceOf[treasury] = TOTAL_SUPPLY;
        emit Transfer(address(0), treasury, TOTAL_SUPPLY);
    }

    function totalSupply() external pure returns (uint256) {
        return TOTAL_SUPPLY;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "zero address");
        uint256 bal = balanceOf[from];
        require(bal >= amount, "balance");
        unchecked {
            balanceOf[from] = bal - amount;
            balanceOf[to] += amount;
        }
        emit Transfer(from, to, amount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CryptoGold (CGOLD)
 * @notice ERC-20 / BEP-20 with hard cap (12B). Owner can mint until MAX_SUPPLY. No burn.
 * @dev Owner = deployer or transferred multisig. Mint via backoffice before LP / allocations.
 */
contract CryptoGold {
    string public constant name = "CryptoGold";
    string public constant symbol = "CGOLD";
    uint8 public constant decimals = 18;
    uint256 public constant MAX_SUPPLY = 12_000_000_000 * 10 ** 18;

    address public owner;
    uint256 private _totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Mint(address indexed to, uint256 amount, address indexed minter);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    /**
     * @param treasury Recipient of optional genesis mint (e.g. treasury multisig).
     * @param initialMint Amount minted to treasury at deploy (0 = all supply mintable later).
     */
    constructor(address treasury, uint256 initialMint) {
        require(treasury != address(0), "treasury required");
        require(initialMint <= MAX_SUPPLY, "initial exceeds cap");
        owner = msg.sender;
        if (initialMint > 0) {
            _mint(treasury, initialMint);
        }
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function remainingMintable() external view returns (uint256) {
        return MAX_SUPPLY - _totalSupply;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /// @notice Mint CGOLD to `to` while total supply stays within MAX_SUPPLY.
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero address");
        require(amount > 0, "zero amount");
        require(_totalSupply + amount <= MAX_SUPPLY, "cap exceeded");
        _mint(to, amount);
        emit Mint(to, amount, msg.sender);
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

    function _mint(address to, uint256 amount) internal {
        unchecked {
            _totalSupply += amount;
            balanceOf[to] += amount;
        }
        emit Transfer(address(0), to, amount);
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

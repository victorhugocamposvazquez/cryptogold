// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CappedMintableToken
 * @notice Generic hard-capped BEP-20 / ERC-20. Name and symbol set at deploy time.
 *         Owner mints until maxSupply. No burn.
 */
contract CappedMintableToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public immutable maxSupply;

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

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        address treasury,
        uint256 initialMint
    ) {
        require(bytes(name_).length > 0, "name required");
        require(bytes(symbol_).length > 0, "symbol required");
        require(maxSupply_ > 0, "maxSupply required");
        require(treasury != address(0), "treasury required");
        require(initialMint <= maxSupply_, "initial exceeds cap");

        name = name_;
        symbol = symbol_;
        maxSupply = maxSupply_;
        owner = msg.sender;

        if (initialMint > 0) {
            _mint(treasury, initialMint);
        }
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function remainingMintable() external view returns (uint256) {
        return maxSupply - _totalSupply;
    }

    /** @dev Alias for tooling that expects MAX_SUPPLY */
    function MAX_SUPPLY() external view returns (uint256) {
        return maxSupply;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero address");
        require(amount > 0, "zero amount");
        require(_totalSupply + amount <= maxSupply, "cap exceeded");
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

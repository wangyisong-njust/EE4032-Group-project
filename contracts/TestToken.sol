// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TestToken
 * @dev Simple ERC20 token for testing vesting functionality
 */
contract TestToken is ERC20 {
    constructor() ERC20("Test Company Token", "TCT") {
        // Mint 1 million tokens to the deployer
        _mint(msg.sender, 1000000 * 10**18);
    }

    /**
     * @dev Allows anyone to mint tokens for testing purposes
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

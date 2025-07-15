// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "hardhat/console.sol";

contract Counter {
    uint256 public counter;
    address owner;

    constructor() {
        counter = 1;
        owner = msg.sender;
    }

    function count() public {
        counter++;
        console.log("Counter incremented to", counter);
    }

    function mul() public {
        require(msg.sender == owner, "invalid call");
        counter = counter * 2;
    }
}
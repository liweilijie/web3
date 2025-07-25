// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MyERC20Permit is ERC20Permit {
    constructor() ERC20("LWPermitToken", "LWPermit") ERC20Permit("LWPermitToken") {
        _mint(msg.sender, 100000 * 10 ** 18);
    }
}

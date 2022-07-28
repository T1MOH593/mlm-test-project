// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract MLMProxyAdmin is ProxyAdmin {
    constructor(
        address /* owner */
    ) ProxyAdmin() {}
}

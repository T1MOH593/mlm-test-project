// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract MlmContract {
    mapping(address => address[]) private s_directPartners;

    event NewDirectPartner(address directPartner, address referee);
    event NewUser(address userAddress);

    function entry() public {
        s_directPartners[msg.sender] = new address[](0);
        emit NewUser(msg.sender);
    }

    function entry(address refereeAddress) public {
        s_directPartners[refereeAddress].push(msg.sender);
        emit NewDirectPartner(msg.sender, refereeAddress);
    }

    function getDirectPartners() public view returns(uint256) {
        return s_directPartners[msg.sender].length;
    }
}
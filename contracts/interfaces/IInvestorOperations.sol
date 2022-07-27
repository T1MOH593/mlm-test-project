// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

/**
* @author Vlad Andrievski
* @dev this interface is for interacting with Invest contract
*/
interface IInvestorOperations {
    /// @return referee of given address
    /// @param _referral The referral of returned referee
    function getReferralToReferee(address referral) external view returns (address);

    /// @return referrals of msg.sender
    function getRefereeToReferrals(address referee) external view returns (address[] memory);
}

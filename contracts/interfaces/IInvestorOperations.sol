// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

/**
* @author Vlad Andrievski
* @dev this interface is for interacting with Invest contract
*/
interface IInvestorOperations {
    /// @return referee of given address
    /// @param _referral The referral of returned referee
    function getReferralToReferee(address _referral) external view returns (address);

    /// @return referrals of given address
    /// @param _referee The referee of returned referrals
    function getRefereeToReferrals(address _referee) external view returns (address[] memory);
}

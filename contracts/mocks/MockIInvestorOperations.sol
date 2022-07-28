// SPDX-License-Identifier: MIT

pragma solidity ^0.8.15;

import "../interfaces/IInvestorOperations.sol";

contract MockIInvestorOperations is IInvestorOperations {
    mapping(address => address[]) private refereeToReferrals;
    mapping(address => address) private referralToReferee;

    function register(address _referral, address _referee) external {
        if (_referral != _referee) {
            refereeToReferrals[_referee].push(_referral);
        }
        referralToReferee[_referral] = _referee;
    }

    function getReferralToReferee(address _referral) external view override returns (address) {
        return referralToReferee[_referral];
    }

    function getRefereeToReferrals(address _referee)
        external
        view
        override
        returns (address[] memory)
    {
        return refereeToReferrals[_referee];
    }
}

//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BountyPayout.sol";

contract SafeMock {

  IERC20 dai;
  BountyPayout bp;

  constructor(address daiAddr, address bpAddr) public {
    dai = IERC20(daiAddr);
    bp = BountyPayout(bpAddr);
  }

  function approve(address addr, uint256 amount) public {
    dai.approve(addr, amount);
  }

  receive() external payable {

  }

  function payout(
    bytes32 _gardener,
    bytes32 _worker,
    bytes32 _reviewer,
    bytes32 _bountyId
  ) public {
    return bp.payout{ value: address(this).balance }(_gardener, _worker, _reviewer, _bountyId);
  }

}
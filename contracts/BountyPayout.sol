//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;


import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BountyPayout is AccessControl {
  bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

  uint256 constant DAI_DECIMALS = 10^18;

  address public daiAddr;
  address public leapAddr;

  enum PayoutType { Gardener, Worker, Reviewer }

  event Payout(
    bytes32 indexed bountyId,
    PayoutType indexed payoutType,
    address indexed recipient,
    uint256 amount
  );

  constructor(
    address _daiAddr,
    address _leapAddr) public {
    daiAddr = _daiAddr;
    leapAddr = _leapAddr;
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  modifier onlyUser() {
    require(hasRole(USER_ROLE, msg.sender), "Sender is not authorized");
    _;
  }

  modifier refundGasCost() {
    uint remainingGasStart = gasleft();

    _;

    if (msg.value > 0) {
      uint remainingGasEnd = gasleft();
      uint usedGas = remainingGasStart - remainingGasEnd;
      // markup for transfers and whatnot
      usedGas += 66000;
      // Possibly need to check max gasprice and usedGas here to limit possibility for abuse.
      uint gasCost = usedGas * tx.gasprice;
      // Refund gas cost
      tx.origin.transfer(gasCost); // solium-disable-line security/no-tx-origin
      // send the rest back
      msg.sender.transfer(msg.value - gasCost);
    }
  }

  /**
  * Pays out a bounty to the different roles of a bounty
  *
  * @dev This contract should have enough allowance of daiAddr from payerAddr
  * @param _gardener DAI amount to pay gardner and gardener wallet address
  * @param _worker DAI amount to pay worker and worker wallet address
  * @param _reviewer DAI amount to pay reviewer and reviewer wallet address
  */
  function payout(
    bytes32 _gardener,
    bytes32 _worker,
    bytes32 _reviewer,
    bytes32 _bountyId
  ) public payable onlyUser refundGasCost {
    _payout(
      address(bytes20(_gardener)),
      uint96(uint256(_gardener)),
      address(bytes20(_worker)),
      uint96(uint256(_worker)),
      address(bytes20(_reviewer)),
      uint96(uint256(_reviewer)),
      _bountyId
    );
  }

  function payoutReviewedDelivery(
    bytes32 _gardener,
    bytes32 _reviewer,
    bytes32 _bountyId
  ) public payable onlyUser refundGasCost {
    _payout(
      address(bytes20(_gardener)),
      uint96(uint256(_gardener)),
      address(bytes20(_gardener)),
      0,
      address(bytes20(_reviewer)),
      uint96(uint256(_reviewer)),
      _bountyId
    );
  }

  function payoutNoReviewer(
    bytes32 _gardener,
    bytes32 _worker,
    bytes32 _bountyId
  ) public payable onlyUser refundGasCost {
    _payout(
      address(bytes20(_gardener)),
      uint96(uint256(_gardener)),
      address(bytes20(_worker)),
      uint96(uint256(_worker)),
      address(bytes20(_gardener)),
      0,
      _bountyId
    );
  }

  function _isRepOnly(uint256 amount) pure internal returns (bool) {
    return ((amount & 0x01) == 1);
  }

  function _payout(
    address payable _gardenerAddr,
    uint256 _gardenerDaiAmount,
    address payable _workerAddr,
    uint256 _workerDaiAmount,
    address payable _reviewerAddr,
    uint256 _reviewerDaiAmount,
    bytes32 _bountyId
  ) internal {
    IERC20 dai = IERC20(daiAddr);

    // gardener worker
    // Why is a gardener share required?
    // Later we will hold a stake for gardeners, which will be handled here.
    require(_gardenerDaiAmount > DAI_DECIMALS, "gardener amount too small");
    if (!_isRepOnly(_gardenerDaiAmount)) {
      dai.transferFrom(msg.sender, _gardenerAddr, _gardenerDaiAmount);
    }
    // solium-disable-next-line arg-overflow
    emit Payout(_bountyId, PayoutType.Gardener, _gardenerAddr, _gardenerDaiAmount);

    // handle worker
    if (_workerDaiAmount > 0) {
      if (!_isRepOnly(_workerDaiAmount)) {
        dai.transferFrom(msg.sender, _workerAddr, _workerDaiAmount);
      }
      // solium-disable-next-line arg-overflow
      emit Payout(_bountyId, PayoutType.Worker, _workerAddr, _workerDaiAmount);
    }

    // handle reviewer
    if (_reviewerDaiAmount > 0) {
      if (!_isRepOnly(_reviewerDaiAmount)) {
        dai.transferFrom(msg.sender, _reviewerAddr, _reviewerDaiAmount);
      }
      // solium-disable-next-line arg-overflow
      emit Payout(_bountyId, PayoutType.Reviewer, _reviewerAddr, _reviewerDaiAmount);
    }
  }

}
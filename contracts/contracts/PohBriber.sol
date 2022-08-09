/**
 * @authors: [@greenlucid]
 * @reviewers: []
 * @auditors: []
 * @bounties: []
 * @deployments: []
 * SPDX-License-Identifier: Licenses are not real
 */

pragma solidity ^0.8.14;

contract PohBriber {
  
  struct Auction {
    string metadata; // info about the Snapshot vote, title, etc. uri to ipfs file?
    address winner;
    uint256 option;
    uint256 highBid;
    uint256 secondBid;
    uint256 auctionDeadline;
    uint256 optionDeadline;
    bool distributed;
  }
  
  address public constant briber = 0x89c4ACb8B5b5B8E5B2121934B9e143569a914C80;
  address public constant dao = 0xa3954B4aDB7caca9C188c325CF9F2991AbB3cF71;

  uint256 public constant briberPercent = 5; // compensate briber for handling the contract.
  uint256 public constant daoPercent = 45; // send a generous amount to the dao.
  uint256 public constant bribePercent = 50; // reward for the bribees.

  Auction[] public auctions;

  modifier onlyBriber() {
    require(msg.sender == briber, "Only briber");
    _;
  }

  function createAuction(
      string calldata _metadata, uint256 _auctionPeriod, uint256 _optionPeriod
  ) external onlyBriber {

    Auction memory auction = Auction(
      _metadata,
      briber,
      0, 0, 0,
      block.timestamp + _auctionPeriod,
      block.timestamp + _auctionPeriod + _optionPeriod,
      false
    );

    auctions.push(auction);
  }

  function bid(uint256 _auctionId) external payable {
    require(_auctionId < auctions.length, "Auction does not exist");
    Auction storage auction = auctions[_auctionId];
    require(auction.auctionDeadline >= block.timestamp, "Too late");
    require(msg.value > auction.highBid, "Too low");

    payable(auction.winner).send(auction.highBid);
    auction.secondBid = auction.highBid;
    auction.highBid = msg.value;
    auction.winner = msg.sender;
  }

  function setOption(uint256 _auctionId, uint256 _option) external {
    require(_auctionId < auctions.length, "Auction does not exist");
    Auction storage auction = auctions[_auctionId];
    require(auction.optionDeadline >= block.timestamp, "Too late");
    require(auction.winner == msg.sender, "Only auction winner");
    auction.option = _option;
  }


  /// @param _bribees If this is too large, it may exceed block size limit.
  /// If this ever happens, briber (who should be reputable, anyway),
  /// should call if with only themselves as _bribees, and then figure out
  /// how to distribute it later.
  function distributeRewards(uint256 _auctionId, address[] calldata _bribees) external onlyBriber {
    require(_auctionId < auctions.length, "Auction does not exist");
    Auction storage auction = auctions[_auctionId];
    // 1. send the second price surplus to auction winner
    payable(auction.winner).send(auction.highBid - auction.secondBid);
    // 2. the secondBid is the "real amount" we distribute. send fees.
    payable(briber).send(auction.secondBid * briberPercent / 100);
    payable(dao).send(auction.secondBid * daoPercent / 100);
    // 3. send the actual bribes. (shameful, lazy for loop...)
    uint256 i;
    for (i = 0; i < _bribees.length; i++) {
      payable(_bribees[i]).send(auction.secondBid / _bribees.length * bribePercent / 100);
    }
    auction.distributed = true;
  }

  function auctionCount() view public returns (uint256){
    return auctions.length;
  }
}
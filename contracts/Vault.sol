// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Vault {
    address payable public owner;
    mapping(address => uint256) public balances;
    uint256 public feePercent = 10;
    uint256 public lockDuration = 86400; // duration in seconds (1 day)

    constructor() {
        owner = payable(msg.sender);
    }

    function deposit() public payable {
        require(msg.value > 0, "Amount must be positive");
        uint256 fee = (msg.value * feePercent) / 100;
        address payable ownerPayable = owner;
        ownerPayable.transfer(fee);
        uint256 depositAmount = msg.value - fee;
        balances[msg.sender] += depositAmount;
    }

    function checkBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function changeOwner(address payable newOwner) public {
        require(msg.sender == owner, "Only owner can change it");
        owner = newOwner;
    }

    function ownerWithdraw(uint256 amount) public payable {
        require(msg.sender == owner, "Only owner can withdraw");
        require(balances[owner] >= amount, "Not enough balance");
        owner.transfer(amount);
        balances[owner] -= amount;
    }

    function releaseAmount() public payable {
        require(block.timestamp >= lockDuration, "Amount is still locked");
        require(balances[msg.sender] > 0, "Balance is low to withdraw");
        payable(msg.sender).transfer(balances[msg.sender]);
        balances[msg.sender] = 0;
    }
}

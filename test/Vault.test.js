const { ethers } = require('hardhat');
const { assert, expect } = require('chai');
const { utils } = require('ethers');
const { web3 } = require('@openzeppelin/test-environment');
const { time } = require('@openzeppelin/test-helpers');

describe('Vault', (accounts) => {
  let vault, vaultFactory;
  let depositAmount = utils.parseEther('1');
  let alice;

  beforeEach(async () => {
    vaultFactory = await ethers.getContractFactory('Vault');
    vault = await vaultFactory.deploy();
    owner = await web3.eth.getAccounts()[0];
  });

  it('should have the correct feePercent value', async () => {
    const feePercent = await vault.feePercent();
    expect(feePercent.toString()).to.equal('10');
  });
  it('should have the correct lockDuration value', async () => {
    const lockDuration = await vault.lockDuration();
    expect(lockDuration).to.equal('86400');
  });

  it('should have the correct owner', async () => {
    const owner = await vault.owner();
    assert.equal(owner.toString(), owner);
  });

  it('Should deposit the funds', async function () {
    await vault.deposit({ value: depositAmount });
    const balance = await vault.checkBalance();
    assert.equal(
      balance.toString(),
      depositAmount - (depositAmount * 0.1).toString()
    );
  });

  it('Should change the owner', async function () {
    const accounts = await ethers.getSigners();
    const newOwner = await accounts[1].getAddress();
    await vault.changeOwner(newOwner);
    const ownerAddress = await vault.owner();
    assert.equal(ownerAddress, newOwner);
  });

  it('Should allow owner to withdraw funds', async function () {
    const accounts = await ethers.getSigners();
    const owner = await vault.owner();
    assert.equal(owner, await accounts[0].getAddress());
    const depositAmount = 1000;
    await vault.deposit({ value: depositAmount });
    const balanceBeforeWithdraw = await vault.balances(owner);
    const withdrawAmount = 100;
    await vault.ownerWithdraw(withdrawAmount);
    const balanceAfterWithdraw = await vault.balances(owner);
    assert.equal(
      balanceBeforeWithdraw.sub(withdrawAmount).toString(),
      balanceAfterWithdraw.toString()
    );
  });

  it('Should not allow non-owner to withdraw funds', async () => {
    const depositAmount = ethers.utils.parseEther('1');
    const withdrawAmount = ethers.utils.parseEther('0.5');

    await vault.deposit({ value: depositAmount, from: alice });

    try {
      await vault.ownerWithdraw(withdrawAmount, { from: alice });
    } catch (error) {
      assert.include(error.message, 'Only owner can withdraw');
    }
  });
  it('should allow the user to release their funds after lock duration', async function () {
    const accounts = await ethers.getSigners();
    const owner = await vault.owner();
    assert.equal(owner, await accounts[0].getAddress());
    const depositAmount = 1000;
    await vault.deposit({ value: depositAmount });
    await time.increase(86400);
    const initialBalance = await vault.balances(owner);
    await vault.releaseAmount();
    const finalBalance = await vault.balances(owner);

    expect(finalBalance > initialBalance);
  });
});

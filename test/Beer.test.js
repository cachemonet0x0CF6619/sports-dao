const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('BeerMe', function () {
  let buyer, contract, owner;
  before(async () => {
    const [owner_, buyer_] = await ethers.getSigners();
    buyer = buyer_;
    owner = owner_;
    const Contract = await ethers.getContractFactory('BeerMe');
    contract = await Contract.deploy();
    await contract.deployed();
  });
  it('should allow others to buy me a coffee', async () => {
      await contract
        .connect(buyer)
        .buy('hello world', { value: ethers.utils.parseEther('0.01') });
  });
  it('should not allow idle writes', async () => {
    try {
      await contract
        .connect(buyer)
        .buy('hello world', { value: ethers.utils.parseEther('0.001') });
    } catch (error) {
      expect(error.message).to.include('not enough funds');
    }
  });
  it('should allow owner to release funds', async () => {
    try {
      await contract.connect(owner).release();
    } catch (error) {
      expect(error).to.not.exist;
    }
  });
  it('should prevent others from releasing funds', async () => {
    try {
      await contract.connect(buyer).release();
    } catch (error) {
      expect(error.message).to.include("not the owner");
    }
  });
});

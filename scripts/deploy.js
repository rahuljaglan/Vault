// SPDX-License-Identifier: MIT
const { ethers } = require('hardhat');

async function main() {
  const VaultFactory = await ethers.getContractFactory('Vault');
  console.log('Deploying contract...');
  const vault = await VaultFactory.deploy();
  await vault.deployed();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

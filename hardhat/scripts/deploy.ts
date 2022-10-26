import { ethers } from "hardhat";

async function main() {
  const allowlistContract = await ethers.getContractFactory("Allowlist");
  const deployedAllowlistContract = await allowlistContract.deploy(10);
  await deployedAllowlistContract.deployed();

  console.log("Allowlist Contract Address:", deployedAllowlistContract.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

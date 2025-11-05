const hre = require("hardhat");

async function main() {
  console.log("Deploying TestToken contract...");

  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy();

  await testToken.waitForDeployment();

  const address = await testToken.getAddress();
  console.log("\n✅ TestToken deployed to:", address);

  // Get deployer info
  const [deployer] = await hre.ethers.getSigners();
  const balance = await testToken.balanceOf(deployer.address);

  console.log("\n📊 Token Details:");
  console.log("- Name:", await testToken.name());
  console.log("- Symbol:", await testToken.symbol());
  console.log("- Total Supply:", hre.ethers.formatEther(await testToken.totalSupply()), "TCT");
  console.log("- Your Balance:", hre.ethers.formatEther(balance), "TCT");
  console.log("- Your Address:", deployer.address);

  console.log("\n📝 Instructions:");
  console.log("1. Copy the contract address above:", address);
  console.log("2. Open the Token Vesting page in your dApp");
  console.log("3. Paste the address in 'Token Contract Address' field");
  console.log("4. Fill in other fields and create vesting schedule");

  console.log("\n⚠️  IMPORTANT: Use the contract address, NOT your wallet address!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying ChronosVault...\n");

  const ChronosVault = await hre.ethers.getContractFactory("ChronosVault");
  const chronosVault = await ChronosVault.deploy();

  await chronosVault.waitForDeployment();

  const address = await chronosVault.getAddress();
  console.log("✅ ChronosVault deployed to:", address);

  console.log("\n📝 Next steps:");
  console.log("1. Update frontend/src/contractConfig.js with this address");
  console.log("2. Or run this command to auto-update:");
  console.log(`   node -e "const fs = require('fs'); const artifact = JSON.parse(fs.readFileSync('artifacts/contracts/ChronosVault.sol/ChronosVault.json')); const config = 'export const CONTRACT_ADDRESS = \\"${address}\\";\n\nexport const CONTRACT_ABI = ' + JSON.stringify(artifact.abi, null, 2) + ';\n'; fs.writeFileSync('frontend/src/contractConfig.js', config);"`);

  console.log("\n🎉 Features included:");
  console.log("   🔒 Time Capsules - Lock ETH/NFTs with time-based unlock");
  console.log("   📜 Multi-Sig Wills - Estate planning with trustee approval");
  console.log("   📊 Token Vesting - Employee compensation schedules");

  console.log("\n🌐 View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${address}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});

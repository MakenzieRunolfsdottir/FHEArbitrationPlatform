const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n========================================");
  console.log("Anonymous Arbitration Platform Deployment");
  console.log("========================================\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name}`);
  console.log(`🔗 Chain ID: ${network.chainId}\n`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer Address: ${deployer.address}`);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Check if sufficient balance
  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance. Deployment may fail.\n");
  }

  console.log("🚀 Starting deployment...\n");

  // Deploy AnonymousArbitrationPlatform contract
  console.log("📝 Deploying AnonymousArbitrationPlatform contract...");
  const AnonymousArbitrationPlatform = await hre.ethers.getContractFactory("AnonymousArbitrationPlatform");

  const startTime = Date.now();
  const platform = await AnonymousArbitrationPlatform.deploy();

  await platform.waitForDeployment();
  const endTime = Date.now();

  const contractAddress = await platform.getAddress();

  console.log("✅ Contract deployed successfully!\n");
  console.log("========================================");
  console.log("📋 Deployment Summary");
  console.log("========================================");
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`⏱️  Deployment Time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
  console.log(`🔗 Transaction Hash: ${platform.deploymentTransaction().hash}`);

  // Wait for confirmations on live networks
  if (network.chainId !== 31337n) {
    console.log("\n⏳ Waiting for block confirmations...");
    await platform.deploymentTransaction().wait(5);
    console.log("✅ 5 block confirmations received");
  }

  // Get contract owner
  const owner = await platform.owner();
  console.log(`\n👑 Contract Owner: ${owner}`);

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: platform.deploymentTransaction().hash,
    blockNumber: platform.deploymentTransaction().blockNumber,
    gasUsed: platform.deploymentTransaction().gasLimit.toString(),
    owner: owner
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}_deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  // Etherscan verification instructions
  if (network.chainId !== 31337n) {
    console.log("\n========================================");
    console.log("📝 Etherscan Verification");
    console.log("========================================");
    console.log("To verify the contract on Etherscan, run:");
    console.log(`\nnpx hardhat verify --network ${network.name} ${contractAddress}\n`);
    console.log("Or use the verification script:");
    console.log(`\nnpm run verify:${network.name}\n`);
  }

  // Contract interaction examples
  console.log("========================================");
  console.log("📚 Quick Start Guide");
  console.log("========================================");
  console.log("\n1️⃣  To interact with the contract:");
  console.log(`   npm run interact${network.chainId !== 31337n ? ':' + network.name : ''}\n`);
  console.log("2️⃣  To run simulations:");
  console.log(`   npm run simulate${network.chainId !== 31337n ? ':' + network.name : ''}\n`);
  console.log("3️⃣  To run tests:");
  console.log("   npm test\n");

  console.log("========================================");
  console.log("🎉 Deployment Complete!");
  console.log("========================================\n");

  return {
    platform,
    contractAddress,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = main;

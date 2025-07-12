const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n========================================");
  console.log("Contract Verification on Etherscan");
  console.log("========================================\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name}`);
  console.log(`🔗 Chain ID: ${network.chainId}\n`);

  // Check if not on localhost
  if (network.chainId === 31337n) {
    console.log("⚠️  Cannot verify contracts on localhost network");
    console.log("Please use a public testnet or mainnet\n");
    process.exit(0);
  }

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network.name}_deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.log(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("Please deploy the contract first using: npm run deploy:sepolia\n");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🚀 Starting verification...\n`);

  try {
    // Verify the contract
    console.log("⏳ Verifying AnonymousArbitrationPlatform...");

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // No constructor arguments for this contract
      contract: "contracts/AnonymousArbitrationPlatform.sol:AnonymousArbitrationPlatform"
    });

    console.log("\n✅ Contract verified successfully!\n");

    // Generate Etherscan link
    const etherscanBaseUrl = network.chainId === 11155111n
      ? "https://sepolia.etherscan.io"
      : network.chainId === 1n
      ? "https://etherscan.io"
      : "https://etherscan.io";

    const etherscanUrl = `${etherscanBaseUrl}/address/${contractAddress}#code`;

    console.log("========================================");
    console.log("📋 Verification Summary");
    console.log("========================================");
    console.log(`Contract: AnonymousArbitrationPlatform`);
    console.log(`Address: ${contractAddress}`);
    console.log(`Network: ${network.name}`);
    console.log(`Etherscan: ${etherscanUrl}\n`);

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();
    deploymentInfo.etherscanUrl = etherscanUrl;

    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Updated deployment info with verification status\n`);

    console.log("========================================");
    console.log("🎉 Verification Complete!");
    console.log("========================================\n");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract is already verified on Etherscan");

      const etherscanBaseUrl = network.chainId === 11155111n
        ? "https://sepolia.etherscan.io"
        : "https://etherscan.io";

      const etherscanUrl = `${etherscanBaseUrl}/address/${contractAddress}#code`;
      console.log(`\n🔗 Etherscan URL: ${etherscanUrl}\n`);

      // Update deployment info
      if (!deploymentInfo.verified) {
        deploymentInfo.verified = true;
        deploymentInfo.verifiedAt = new Date().toISOString();
        deploymentInfo.etherscanUrl = etherscanUrl;
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
      }

    } else if (error.message.includes("Missing API Key")) {
      console.log("\n❌ Error: Etherscan API key not found");
      console.log("Please set ETHERSCAN_API_KEY in your .env file");
      console.log("\nGet your API key from: https://etherscan.io/myapikey\n");
      process.exit(1);

    } else {
      console.log("\n❌ Verification failed:");
      console.log(error.message);
      console.log("\nTroubleshooting:");
      console.log("1. Make sure ETHERSCAN_API_KEY is set in .env");
      console.log("2. Wait a few minutes after deployment before verifying");
      console.log("3. Check that the contract address is correct");
      console.log("4. Ensure you're on the correct network\n");
      process.exit(1);
    }
  }
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification script failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = main;

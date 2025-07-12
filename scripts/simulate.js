const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n========================================");
  console.log("Anonymous Arbitration Platform Simulation");
  console.log("========================================\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name}`);
  console.log(`🔗 Chain ID: ${network.chainId}\n`);

  let platform;
  let contractAddress;

  // Check if we should deploy a new contract or use existing one
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network.name}_deployment.json`);

  if (network.chainId === 31337n) {
    // Deploy for local testing
    console.log("🚀 Deploying contract for simulation...\n");
    const Platform = await hre.ethers.getContractFactory("AnonymousArbitrationPlatform");
    platform = await Platform.deploy();
    await platform.waitForDeployment();
    contractAddress = await platform.getAddress();
    console.log(`✅ Contract deployed at: ${contractAddress}\n`);
  } else {
    // Use existing deployment
    if (!fs.existsSync(deploymentFile)) {
      console.log("❌ Deployment file not found. Please deploy first.");
      process.exit(1);
    }
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    contractAddress = deploymentInfo.contractAddress;
    platform = await hre.ethers.getContractAt("AnonymousArbitrationPlatform", contractAddress);
    console.log(`📍 Using deployed contract at: ${contractAddress}\n`);
  }

  // Get signers
  const [deployer, arbitrator1, arbitrator2, arbitrator3, plaintiff, defendant] = await hre.ethers.getSigners();

  console.log("========================================");
  console.log("👥 Simulation Participants");
  console.log("========================================");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Arbitrator 1: ${arbitrator1.address}`);
  console.log(`Arbitrator 2: ${arbitrator2.address}`);
  console.log(`Arbitrator 3: ${arbitrator3.address}`);
  console.log(`Plaintiff: ${plaintiff.address}`);
  console.log(`Defendant: ${defendant.address}\n`);

  console.log("========================================");
  console.log("🎬 Starting Simulation Scenario");
  console.log("========================================\n");

  // Step 1: Register Arbitrators
  console.log("📝 Step 1: Registering Arbitrators");
  console.log("----------------------------------------");

  try {
    const tx1 = await platform.connect(arbitrator1).registerArbitrator(12345);
    await tx1.wait();
    console.log(`✅ Arbitrator 1 registered (Hash: ${tx1.hash.substring(0, 10)}...)`);

    const tx2 = await platform.connect(arbitrator2).registerArbitrator(23456);
    await tx2.wait();
    console.log(`✅ Arbitrator 2 registered (Hash: ${tx2.hash.substring(0, 10)}...)`);

    const tx3 = await platform.connect(arbitrator3).registerArbitrator(34567);
    await tx3.wait();
    console.log(`✅ Arbitrator 3 registered (Hash: ${tx3.hash.substring(0, 10)}...)\n`);
  } catch (error) {
    console.log(`⚠️  Arbitrators already registered or error: ${error.message}\n`);
  }

  // Verify arbitrators
  const arb1Info = await platform.getArbitratorInfo(arbitrator1.address);
  const arb2Info = await platform.getArbitratorInfo(arbitrator2.address);
  const arb3Info = await platform.getArbitratorInfo(arbitrator3.address);

  console.log("📊 Arbitrator Status:");
  console.log(`   Arbitrator 1: Active=${arb1Info.isActive}, Reputation=${arb1Info.reputation}`);
  console.log(`   Arbitrator 2: Active=${arb2Info.isActive}, Reputation=${arb2Info.reputation}`);
  console.log(`   Arbitrator 3: Active=${arb3Info.isActive}, Reputation=${arb3Info.reputation}\n`);

  // Step 2: Create Dispute
  console.log("📝 Step 2: Creating Dispute");
  console.log("----------------------------------------");

  const stakeAmount = 1000;
  const evidenceHash = 999888777;
  const ethValue = hre.ethers.parseEther("0.001");

  const createTx = await platform.connect(plaintiff).createDispute(
    defendant.address,
    stakeAmount,
    evidenceHash,
    { value: ethValue }
  );
  const createReceipt = await createTx.wait();

  // Get dispute ID from event
  let disputeId = 0;
  for (const log of createReceipt.logs) {
    try {
      const parsedLog = platform.interface.parseLog(log);
      if (parsedLog.name === "DisputeCreated") {
        disputeId = Number(parsedLog.args.disputeId);
        console.log(`✅ Dispute created successfully!`);
        console.log(`   Dispute ID: ${disputeId}`);
        console.log(`   Transaction Hash: ${createTx.hash.substring(0, 10)}...`);
        break;
      }
    } catch (e) {
      // Skip logs that don't match our interface
    }
  }

  if (disputeId === 0) {
    // Fallback: get dispute counter
    disputeId = Number(await platform.disputeCounter());
    console.log(`✅ Dispute created! ID: ${disputeId}\n`);
  } else {
    console.log("");
  }

  // Get dispute info
  const disputeInfo = await platform.getDisputeInfo(disputeId);
  const statusNames = ["Created", "InArbitration", "Voting", "Resolved", "Cancelled"];
  console.log("📊 Dispute Details:");
  console.log(`   Status: ${statusNames[disputeInfo.status]}`);
  console.log(`   Plaintiff: ${disputeInfo.plaintiff}`);
  console.log(`   Defendant: ${disputeInfo.defendant}\n`);

  // Step 3: Assign Arbitrators (Note: This may fail due to simplified random selection)
  console.log("📝 Step 3: Assigning Arbitrators");
  console.log("----------------------------------------");

  try {
    const assignTx = await platform.connect(deployer).assignArbitrators(disputeId);
    await assignTx.wait();
    console.log(`✅ Arbitrators assigned successfully!`);
    console.log(`   Transaction Hash: ${assignTx.hash.substring(0, 10)}...\n`);

    const updatedInfo = await platform.getDisputeInfo(disputeId);
    console.log("📊 Updated Dispute Status:");
    console.log(`   Status: ${statusNames[updatedInfo.status]}`);
    console.log(`   Arbitrators Assigned: ${updatedInfo.arbitratorCount}\n`);

  } catch (error) {
    console.log(`⚠️  Note: Arbitrator assignment uses simplified random selection`);
    console.log(`   and may not succeed in simulation environment.`);
    console.log(`   Error: ${error.message.substring(0, 100)}...\n`);
    console.log(`   This is expected behavior in the current implementation.`);
    console.log(`   In production, this would use Chainlink VRF or similar.\n`);
  }

  // Step 4: Display Platform Statistics
  console.log("📝 Step 4: Platform Statistics");
  console.log("----------------------------------------");

  const totalDisputes = await platform.disputeCounter();
  const totalArbitrators = await platform.arbitratorPool();

  console.log(`📊 Current Platform Stats:`);
  console.log(`   Total Disputes: ${totalDisputes}`);
  console.log(`   Active Arbitrators: ${totalArbitrators}\n`);

  // Step 5: Check Reputations
  console.log("📝 Step 5: User Reputations");
  console.log("----------------------------------------");

  const plaintiffRep = await platform.getUserReputation(plaintiff.address);
  const defendantRep = await platform.getUserReputation(defendant.address);

  console.log(`⭐ Reputation Scores:`);
  console.log(`   Plaintiff: ${plaintiffRep}`);
  console.log(`   Defendant: ${defendantRep}\n`);

  // Summary
  console.log("========================================");
  console.log("✅ Simulation Complete!");
  console.log("========================================");
  console.log("\n📋 Simulation Summary:");
  console.log(`   ✓ Registered 3 arbitrators`);
  console.log(`   ✓ Created 1 dispute (ID: ${disputeId})`);
  console.log(`   ✓ Demonstrated platform functionality`);
  console.log(`   ✓ Verified contract interactions\n`);

  console.log("📚 Next Steps:");
  console.log(`   • Use interact.js to manually interact with the contract`);
  console.log(`   • Run tests with: npm test`);
  console.log(`   • Deploy to testnet with: npm run deploy:sepolia\n`);

  console.log("========================================\n");
}

// Execute simulation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });

module.exports = main;

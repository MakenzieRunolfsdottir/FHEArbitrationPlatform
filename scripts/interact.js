const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("\n========================================");
  console.log("Anonymous Arbitration Platform Interaction");
  console.log("========================================\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name}`);
  console.log(`🔗 Chain ID: ${network.chainId}\n`);

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`👤 Your Address: ${signer.address}`);

  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log(`💰 Your Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Load contract address
  let contractAddress;
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network.name}_deployment.json`);

  if (fs.existsSync(deploymentFile)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    contractAddress = deploymentInfo.contractAddress;
    console.log(`📍 Contract Address: ${contractAddress}\n`);
  } else {
    contractAddress = await question("Enter contract address: ");
    console.log("");
  }

  // Connect to contract
  const platform = await hre.ethers.getContractAt("AnonymousArbitrationPlatform", contractAddress);

  // Main interaction loop
  let running = true;

  while (running) {
    console.log("========================================");
    console.log("🎯 Choose an action:");
    console.log("========================================");
    console.log("1️⃣  Register as Arbitrator");
    console.log("2️⃣  Create Dispute");
    console.log("3️⃣  Assign Arbitrators to Dispute");
    console.log("4️⃣  Submit Vote (as Arbitrator)");
    console.log("5️⃣  View Dispute Information");
    console.log("6️⃣  View Arbitrator Profile");
    console.log("7️⃣  View User Reputation");
    console.log("8️⃣  View Platform Statistics");
    console.log("9️⃣  Exit");
    console.log("========================================\n");

    const choice = await question("Enter your choice (1-9): ");
    console.log("");

    try {
      switch (choice.trim()) {
        case "1":
          await registerArbitrator(platform);
          break;

        case "2":
          await createDispute(platform);
          break;

        case "3":
          await assignArbitrators(platform);
          break;

        case "4":
          await submitVote(platform);
          break;

        case "5":
          await viewDisputeInfo(platform);
          break;

        case "6":
          await viewArbitratorProfile(platform);
          break;

        case "7":
          await viewUserReputation(platform);
          break;

        case "8":
          await viewPlatformStats(platform);
          break;

        case "9":
          running = false;
          console.log("👋 Goodbye!\n");
          break;

        default:
          console.log("❌ Invalid choice. Please try again.\n");
      }
    } catch (error) {
      console.log(`\n❌ Error: ${error.message}\n`);
    }
  }

  rl.close();
}

// Register as arbitrator
async function registerArbitrator(platform) {
  console.log("\n🔐 Register as Arbitrator");
  console.log("========================================\n");

  const identityProof = await question("Enter identity proof (number): ");

  console.log("\n⏳ Registering...");
  const tx = await platform.registerArbitrator(parseInt(identityProof));
  const receipt = await tx.wait();

  console.log("✅ Registration successful!");
  console.log(`📝 Transaction Hash: ${receipt.hash}\n`);
}

// Create a new dispute
async function createDispute(platform) {
  console.log("\n📋 Create New Dispute");
  console.log("========================================\n");

  const defendant = await question("Enter defendant address: ");
  const stakeAmount = await question("Enter stake amount (number): ");
  const evidenceHash = await question("Enter evidence hash (number): ");
  const ethAmount = await question("Enter ETH amount to send (in ETH, min 0.001): ");

  console.log("\n⏳ Creating dispute...");
  const tx = await platform.createDispute(
    defendant,
    parseInt(stakeAmount),
    parseInt(evidenceHash),
    {
      value: hre.ethers.parseEther(ethAmount)
    }
  );
  const receipt = await tx.wait();

  // Get dispute ID from event
  const event = receipt.logs.find(log => {
    try {
      return platform.interface.parseLog(log).name === "DisputeCreated";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsedEvent = platform.interface.parseLog(event);
    console.log(`✅ Dispute created successfully!`);
    console.log(`🆔 Dispute ID: ${parsedEvent.args.disputeId.toString()}`);
    console.log(`📝 Transaction Hash: ${receipt.hash}\n`);
  }
}

// Assign arbitrators to dispute
async function assignArbitrators(platform) {
  console.log("\n👥 Assign Arbitrators");
  console.log("========================================\n");

  const disputeId = await question("Enter dispute ID: ");

  console.log("\n⏳ Assigning arbitrators...");
  const tx = await platform.assignArbitrators(parseInt(disputeId));
  const receipt = await tx.wait();

  console.log("✅ Arbitrators assigned successfully!");
  console.log(`📝 Transaction Hash: ${receipt.hash}\n`);
}

// Submit vote as arbitrator
async function submitVote(platform) {
  console.log("\n🗳️  Submit Vote");
  console.log("========================================\n");

  const disputeId = await question("Enter dispute ID: ");
  console.log("\nVote Options:");
  console.log("1 - Favor Plaintiff");
  console.log("2 - Favor Defendant");
  console.log("3 - Neutral\n");

  const vote = await question("Enter your vote (1-3): ");
  const justification = await question("Enter justification (number): ");

  console.log("\n⏳ Submitting vote...");
  const tx = await platform.submitVote(
    parseInt(disputeId),
    parseInt(vote),
    parseInt(justification)
  );
  const receipt = await tx.wait();

  console.log("✅ Vote submitted successfully!");
  console.log(`📝 Transaction Hash: ${receipt.hash}\n`);
}

// View dispute information
async function viewDisputeInfo(platform) {
  console.log("\n📊 Dispute Information");
  console.log("========================================\n");

  const disputeId = await question("Enter dispute ID: ");

  const info = await platform.getDisputeInfo(parseInt(disputeId));

  const statusNames = ["Created", "InArbitration", "Voting", "Resolved", "Cancelled"];

  console.log("\n📋 Dispute Details:");
  console.log("========================================");
  console.log(`Dispute ID: ${disputeId}`);
  console.log(`Plaintiff: ${info.plaintiff}`);
  console.log(`Defendant: ${info.defendant}`);
  console.log(`Status: ${statusNames[info.status]}`);
  console.log(`Created At: ${new Date(Number(info.createdAt) * 1000).toLocaleString()}`);
  console.log(`Voting Deadline: ${info.votingDeadline > 0 ? new Date(Number(info.votingDeadline) * 1000).toLocaleString() : "Not set"}`);
  console.log(`Arbitrators Assigned: ${info.arbitratorCount.toString()}`);
  console.log(`Decision Revealed: ${info.decisionRevealed ? "Yes" : "No"}`);
  console.log(`Winner: ${info.winner === hre.ethers.ZeroAddress ? "None" : info.winner}`);
  console.log("========================================\n");
}

// View arbitrator profile
async function viewArbitratorProfile(platform) {
  console.log("\n👤 Arbitrator Profile");
  console.log("========================================\n");

  const address = await question("Enter arbitrator address (or press Enter for your address): ");
  const targetAddress = address.trim() || (await hre.ethers.getSigners())[0].address;

  const info = await platform.getArbitratorInfo(targetAddress);

  console.log("\n📋 Arbitrator Details:");
  console.log("========================================");
  console.log(`Address: ${targetAddress}`);
  console.log(`Active: ${info.isActive ? "Yes" : "No"}`);
  console.log(`Reputation: ${info.reputation.toString()}`);
  console.log(`Total Disputes Handled: ${info.totalDisputesHandled.toString()}`);
  console.log(`Successful Arbitrations: ${info.successfulArbitrations.toString()}`);
  console.log(`Identity Verified: ${info.identityVerified ? "Yes" : "No"}`);
  console.log("========================================\n");
}

// View user reputation
async function viewUserReputation(platform) {
  console.log("\n⭐ User Reputation");
  console.log("========================================\n");

  const address = await question("Enter user address (or press Enter for your address): ");
  const targetAddress = address.trim() || (await hre.ethers.getSigners())[0].address;

  const reputation = await platform.getUserReputation(targetAddress);

  console.log(`\n📊 Reputation for ${targetAddress}`);
  console.log(`⭐ Score: ${reputation.toString()}\n`);
}

// View platform statistics
async function viewPlatformStats(platform) {
  console.log("\n📈 Platform Statistics");
  console.log("========================================\n");

  const disputeCounter = await platform.disputeCounter();
  const arbitratorPool = await platform.arbitratorPool();
  const owner = await platform.owner();

  console.log(`Total Disputes Created: ${disputeCounter.toString()}`);
  console.log(`Active Arbitrators: ${arbitratorPool.toString()}`);
  console.log(`Platform Owner: ${owner}`);
  console.log("========================================\n");
}

// Execute interaction
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    rl.close();
    process.exit(1);
  });

module.exports = main;

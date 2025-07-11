const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("AnonymousArbitrationPlatform - Sepolia Testnet", function () {
  let platform;
  let contractAddress;
  let signer;
  let step;
  let steps;

  function progress(message) {
    console.log(`      ${++step}/${steps} ${message}`);
  }

  before(async function () {
    // Only run on Sepolia network
    if (network.name !== "sepolia") {
      console.warn("⚠️  This test suite can only run on Sepolia Testnet");
      console.warn(`   Current network: ${network.name}`);
      console.warn(`   Run with: npm run test:sepolia`);
      this.skip();
    }

    console.log(`\n   📡 Running tests on Sepolia Testnet`);
    console.log(`   🔗 Chain ID: ${network.config.chainId}\n`);

    // Get deployed contract address
    contractAddress = process.env.PLATFORM_ADDRESS || "0x019487001FaCC26883f8760b72B0DAef2cbFa1bd";

    console.log(`   📍 Contract Address: ${contractAddress}\n`);

    // Connect to deployed contract
    platform = await ethers.getContractAt("AnonymousArbitrationPlatform", contractAddress);

    // Get signer
    [signer] = await ethers.getSigners();
    console.log(`   👤 Test Account: ${signer.address}`);

    // Check balance
    const balance = await ethers.provider.getBalance(signer.address);
    console.log(`   💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

    if (balance < ethers.parseEther("0.01")) {
      console.warn("   ⚠️  Low balance - tests may fail");
      console.warn("   Please fund your account: https://sepoliafaucet.com\n");
    }
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  describe("Contract Verification", function () {
    it("should be deployed on Sepolia", async function () {
      steps = 2;
      this.timeout(30000);

      progress("Verifying contract deployment...");
      expect(await platform.getAddress()).to.be.properAddress;
      expect(await platform.getAddress()).to.equal(contractAddress);

      progress("Contract verified successfully");
    });

    it("should have correct owner", async function () {
      steps = 2;
      this.timeout(30000);

      progress("Fetching owner address...");
      const owner = await platform.owner();

      progress(`Owner: ${owner}`);
      expect(owner).to.be.properAddress;
    });

    it("should return current platform statistics", async function () {
      steps = 4;
      this.timeout(30000);

      progress("Fetching dispute counter...");
      const disputeCounter = await platform.disputeCounter();

      progress("Fetching arbitrator pool...");
      const arbitratorPool = await platform.arbitratorPool();

      progress("Fetching owner...");
      const owner = await platform.owner();

      progress(`Statistics - Disputes: ${disputeCounter}, Arbitrators: ${arbitratorPool}`);

      expect(disputeCounter).to.be.gte(0);
      expect(arbitratorPool).to.be.gte(0);
      expect(owner).to.be.properAddress;
    });
  });

  describe("Read Operations", function () {
    it("should query arbitrator information", async function () {
      steps = 3;
      this.timeout(30000);

      progress("Querying arbitrator info...");
      const info = await platform.getArbitratorInfo(signer.address);

      progress("Parsing arbitrator data...");
      expect(info).to.have.property('isActive');
      expect(info).to.have.property('reputation');
      expect(info).to.have.property('totalDisputesHandled');
      expect(info).to.have.property('successfulArbitrations');
      expect(info).to.have.property('identityVerified');

      progress(`Arbitrator Status - Active: ${info.isActive}, Reputation: ${info.reputation}`);
    });

    it("should query user reputation", async function () {
      steps = 2;
      this.timeout(30000);

      progress("Fetching user reputation...");
      const reputation = await platform.getUserReputation(signer.address);

      progress(`User Reputation: ${reputation.toString()}`);
      expect(reputation).to.be.gte(0);
    });
  });

  describe("Write Operations (Optional - requires gas)", function () {
    it("should register as arbitrator on Sepolia", async function () {
      steps = 5;
      this.timeout(120000); // 2 minutes

      progress("Checking if already registered...");
      const beforeInfo = await platform.getArbitratorInfo(signer.address);

      if (beforeInfo.isActive) {
        console.log("      ℹ️  Already registered as arbitrator");
        this.skip();
      }

      progress("Preparing registration transaction...");
      const identityProof = Math.floor(Math.random() * 1000000);

      progress(`Sending registration transaction (ID: ${identityProof})...`);
      const tx = await platform.connect(signer).registerArbitrator(identityProof);

      progress("Waiting for confirmation...");
      const receipt = await tx.wait();

      progress(`✅ Registered! Gas used: ${receipt.gasUsed.toString()}`);

      // Verify registration
      const afterInfo = await platform.getArbitratorInfo(signer.address);
      expect(afterInfo.isActive).to.be.true;
      expect(afterInfo.reputation).to.equal(100);

      console.log(`      📝 Transaction Hash: ${receipt.hash}`);
      console.log(`      🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}`);
    });

    it("should create dispute on Sepolia", async function () {
      steps = 6;
      this.timeout(120000); // 2 minutes

      progress("Preparing dispute creation...");
      const [signer1, signer2] = await ethers.getSigners();

      if (!signer2) {
        console.log("      ⚠️  Need at least 2 accounts to create dispute");
        this.skip();
      }

      const stakeAmount = 1000;
      const evidenceHash = Math.floor(Math.random() * 1000000000);

      progress(`Creating dispute with defendant: ${signer2.address.substring(0, 10)}...`);
      const tx = await platform.connect(signer1).createDispute(
        signer2.address,
        stakeAmount,
        evidenceHash,
        { value: ethers.parseEther("0.001") }
      );

      progress("Waiting for confirmation...");
      const receipt = await tx.wait();

      progress(`✅ Dispute created! Gas used: ${receipt.gasUsed.toString()}`);

      // Get dispute ID from event
      let disputeId = 0;
      for (const log of receipt.logs) {
        try {
          const parsedLog = platform.interface.parseLog(log);
          if (parsedLog.name === "DisputeCreated") {
            disputeId = Number(parsedLog.args.disputeId);
            break;
          }
        } catch (e) {
          // Skip logs that don't match
        }
      }

      if (disputeId > 0) {
        progress(`Verifying dispute ID: ${disputeId}...`);
        const info = await platform.getDisputeInfo(disputeId);
        expect(info.plaintiff).to.equal(signer1.address);
        expect(info.defendant).to.equal(signer2.address);

        progress(`✅ Dispute verified - ID: ${disputeId}`);
        console.log(`      📝 Transaction Hash: ${receipt.hash}`);
        console.log(`      🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}`);
      } else {
        progress("⚠️  Could not extract dispute ID from events");
      }
    });
  });

  describe("Gas Usage Analysis", function () {
    it("should estimate gas for arbitrator registration", async function () {
      steps = 2;
      this.timeout(30000);

      progress("Estimating gas for registration...");

      try {
        const gasEstimate = await platform.registerArbitrator.estimateGas(123456);
        progress(`Estimated gas: ${gasEstimate.toString()}`);

        expect(gasEstimate).to.be.lessThan(500000);
      } catch (error) {
        if (error.message.includes("Already registered")) {
          console.log("      ℹ️  Cannot estimate - already registered");
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it("should estimate gas for dispute creation", async function () {
      steps = 2;
      this.timeout(30000);

      progress("Estimating gas for dispute creation...");

      const [signer1, signer2] = await ethers.getSigners();

      if (!signer2) {
        console.log("      ⚠️  Need at least 2 accounts");
        this.skip();
      }

      const gasEstimate = await platform.connect(signer1).createDispute.estimateGas(
        signer2.address,
        1000,
        999888777,
        { value: ethers.parseEther("0.001") }
      );

      progress(`Estimated gas: ${gasEstimate.toString()}`);
      expect(gasEstimate).to.be.lessThan(500000);
    });
  });

  describe("Integration Tests", function () {
    it("should complete full arbitration workflow simulation", async function () {
      steps = 8;
      this.timeout(180000); // 3 minutes

      progress("Starting workflow simulation...");

      // Step 1: Check platform state
      progress("Checking initial platform state...");
      const initialDisputes = await platform.disputeCounter();
      const initialArbitrators = await platform.arbitratorPool();

      console.log(`      Initial state - Disputes: ${initialDisputes}, Arbitrators: ${initialArbitrators}`);

      // Step 2: Check arbitrator status
      progress("Checking arbitrator status...");
      const arbInfo = await platform.getArbitratorInfo(signer.address);

      if (!arbInfo.isActive) {
        progress("Note: Signer is not registered as arbitrator");
        progress("Would need to call registerArbitrator() first");
      } else {
        progress(`Arbitrator active with reputation: ${arbInfo.reputation}`);
      }

      // Step 3: Check user reputation
      progress("Checking user reputation...");
      const reputation = await platform.getUserReputation(signer.address);
      console.log(`      User reputation: ${reputation}`);

      // Step 4: Simulate dispute query
      if (initialDisputes > 0) {
        progress(`Querying existing dispute (ID: 1)...`);
        try {
          const disputeInfo = await platform.getDisputeInfo(1);
          console.log(`      Dispute status: ${disputeInfo.status}`);
          console.log(`      Arbitrators assigned: ${disputeInfo.arbitratorCount}`);
        } catch (error) {
          progress("Could not query dispute - may not exist");
        }
      }

      // Step 5-8: Summary
      progress("Workflow simulation complete");
      progress("All read operations successful");

      expect(initialDisputes).to.be.gte(0);
      expect(initialArbitrators).to.be.gte(0);
    });
  });

  after(function () {
    if (network.name === "sepolia") {
      console.log("\n   ✅ Sepolia tests completed");
      console.log(`   📊 Contract: ${contractAddress}`);
      console.log(`   🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}\n`);
    }
  });
});

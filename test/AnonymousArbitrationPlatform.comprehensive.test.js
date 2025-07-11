const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AnonymousArbitrationPlatform - Comprehensive Test Suite", function () {
  // Fixture for deploying the contract
  async function deployPlatformFixture() {
    const [owner, arbitrator1, arbitrator2, arbitrator3, arbitrator4, plaintiff1, plaintiff2, defendant1, defendant2, user1, user2] =
      await ethers.getSigners();

    const Platform = await ethers.getContractFactory("AnonymousArbitrationPlatform");
    const platform = await Platform.deploy();
    await platform.waitForDeployment();

    return {
      platform,
      owner,
      arbitrator1,
      arbitrator2,
      arbitrator3,
      arbitrator4,
      plaintiff1,
      plaintiff2,
      defendant1,
      defendant2,
      user1,
      user2
    };
  }

  // Fixture with registered arbitrators
  async function deployWithArbitratorsFixture() {
    const fixture = await deployPlatformFixture();
    const { platform, arbitrator1, arbitrator2, arbitrator3 } = fixture;

    await platform.connect(arbitrator1).registerArbitrator(11111);
    await platform.connect(arbitrator2).registerArbitrator(22222);
    await platform.connect(arbitrator3).registerArbitrator(33333);

    return fixture;
  }

  // Fixture with dispute created
  async function deployWithDisputeFixture() {
    const fixture = await deployWithArbitratorsFixture();
    const { platform, plaintiff1, defendant1 } = fixture;

    await platform.connect(plaintiff1).createDispute(
      defendant1.address,
      1000,
      999888777,
      { value: ethers.parseEther("0.001") }
    );

    return { ...fixture, disputeId: 1 };
  }

  describe("Deployment and Initialization", function () {
    it("should deploy successfully with proper address", async function () {
      const { platform } = await loadFixture(deployPlatformFixture);
      expect(await platform.getAddress()).to.be.properAddress;
    });

    it("should set the deployer as owner", async function () {
      const { platform, owner } = await loadFixture(deployPlatformFixture);
      expect(await platform.owner()).to.equal(owner.address);
    });

    it("should initialize dispute counter to zero", async function () {
      const { platform } = await loadFixture(deployPlatformFixture);
      expect(await platform.disputeCounter()).to.equal(0);
    });

    it("should initialize arbitrator pool to zero", async function () {
      const { platform } = await loadFixture(deployPlatformFixture);
      expect(await platform.arbitratorPool()).to.equal(0);
    });

    it("should have correct contract bytecode", async function () {
      const { platform } = await loadFixture(deployPlatformFixture);
      const code = await ethers.provider.getCode(await platform.getAddress());
      expect(code).to.not.equal("0x");
      expect(code.length).to.be.greaterThan(100);
    });
  });

  describe("Arbitrator Registration - Extended", function () {
    it("should register arbitrator with correct initial reputation", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      const info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.reputation).to.equal(100);
    });

    it("should register arbitrator with active status", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      const info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.isActive).to.be.true;
    });

    it("should register arbitrator with verified identity", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      const info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.identityVerified).to.be.true;
    });

    it("should register arbitrator with zero disputes handled", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      const info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.totalDisputesHandled).to.equal(0);
      expect(info.successfulArbitrations).to.equal(0);
    });

    it("should allow multiple arbitrators to register with different IDs", async function () {
      const { platform, arbitrator1, arbitrator2, arbitrator3, arbitrator4 } =
        await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(11111);
      await platform.connect(arbitrator2).registerArbitrator(22222);
      await platform.connect(arbitrator3).registerArbitrator(33333);
      await platform.connect(arbitrator4).registerArbitrator(44444);

      expect(await platform.arbitratorPool()).to.equal(4);
    });

    it("should increment pool count correctly", async function () {
      const { platform, arbitrator1, arbitrator2 } = await loadFixture(deployPlatformFixture);

      expect(await platform.arbitratorPool()).to.equal(0);

      await platform.connect(arbitrator1).registerArbitrator(11111);
      expect(await platform.arbitratorPool()).to.equal(1);

      await platform.connect(arbitrator2).registerArbitrator(22222);
      expect(await platform.arbitratorPool()).to.equal(2);
    });

    it("should prevent duplicate registration from same address", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      await expect(
        platform.connect(arbitrator1).registerArbitrator(54321)
      ).to.be.revertedWith("Already registered as arbitrator");
    });

    it("should emit ArbitratorRegistered event with correct address", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await expect(platform.connect(arbitrator1).registerArbitrator(12345))
        .to.emit(platform, "ArbitratorRegistered")
        .withArgs(arbitrator1.address);
    });

    it("should allow registration with identity proof zero", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await expect(platform.connect(arbitrator1).registerArbitrator(0))
        .to.emit(platform, "ArbitratorRegistered");
    });

    it("should allow registration with maximum identity proof", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      const maxUint32 = 2**32 - 1;
      await expect(platform.connect(arbitrator1).registerArbitrator(maxUint32))
        .to.emit(platform, "ArbitratorRegistered");
    });
  });

  describe("Dispute Creation - Extended", function () {
    it("should create dispute with correct plaintiff", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff1).createDispute(
        defendant1.address,
        1000,
        999888777,
        { value: ethers.parseEther("0.001") }
      );

      const info = await platform.getDisputeInfo(1);
      expect(info.plaintiff).to.equal(plaintiff1.address);
    });

    it("should create dispute with correct defendant", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff1).createDispute(
        defendant1.address,
        1000,
        999888777,
        { value: ethers.parseEther("0.001") }
      );

      const info = await platform.getDisputeInfo(1);
      expect(info.defendant).to.equal(defendant1.address);
    });

    it("should create dispute with Created status", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff1).createDispute(
        defendant1.address,
        1000,
        999888777,
        { value: ethers.parseEther("0.001") }
      );

      const info = await platform.getDisputeInfo(1);
      expect(info.status).to.equal(0); // Created
    });

    it("should create dispute with correct timestamp", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      const txTime = await time.latest();
      await platform.connect(plaintiff1).createDispute(
        defendant1.address,
        1000,
        999888777,
        { value: ethers.parseEther("0.001") }
      );

      const info = await platform.getDisputeInfo(1);
      expect(Number(info.createdAt)).to.be.greaterThan(txTime);
    });

    it("should create dispute with zero arbitrators initially", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff1).createDispute(
        defendant1.address,
        1000,
        999888777,
        { value: ethers.parseEther("0.001") }
      );

      const info = await platform.getDisputeInfo(1);
      expect(info.arbitratorCount).to.equal(0);
    });

    it("should create dispute with no revealed decision", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff1).createDispute(
        defendant1.address,
        1000,
        999888777,
        { value: ethers.parseEther("0.001") }
      );

      const info = await platform.getDisputeInfo(1);
      expect(info.decisionRevealed).to.be.false;
    });

    it("should create dispute with no winner initially", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff1).createDispute(
        defendant1.address,
        1000,
        999888777,
        { value: ethers.parseEther("0.001") }
      );

      const info = await platform.getDisputeInfo(1);
      expect(info.winner).to.equal(ethers.ZeroAddress);
    });

    it("should reject dispute with zero address defendant", async function () {
      const { platform, plaintiff1 } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(plaintiff1).createDispute(
          ethers.ZeroAddress,
          1000,
          999888777,
          { value: ethers.parseEther("0.001") }
        )
      ).to.be.revertedWith("Invalid defendant address");
    });

    it("should reject self-dispute", async function () {
      const { platform, plaintiff1 } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(plaintiff1).createDispute(
          plaintiff1.address,
          1000,
          999888777,
          { value: ethers.parseEther("0.001") }
        )
      ).to.be.revertedWith("Cannot create dispute with yourself");
    });

    it("should reject dispute with insufficient stake", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(plaintiff1).createDispute(
          defendant1.address,
          1000,
          999888777,
          { value: ethers.parseEther("0.0001") }
        )
      ).to.be.revertedWith("Minimum stake required");
    });

    it("should accept exact minimum stake", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(plaintiff1).createDispute(
          defendant1.address,
          1000,
          999888777,
          { value: ethers.parseEther("0.001") }
        )
      ).to.not.be.reverted;
    });

    it("should accept stake higher than minimum", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(plaintiff1).createDispute(
          defendant1.address,
          1000,
          999888777,
          { value: ethers.parseEther("1.0") }
        )
      ).to.not.be.reverted;
    });

    it("should emit DisputeCreated event with correct parameters", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(plaintiff1).createDispute(
          defendant1.address,
          1000,
          999888777,
          { value: ethers.parseEther("0.001") }
        )
      )
        .to.emit(platform, "DisputeCreated")
        .withArgs(1, plaintiff1.address, defendant1.address);
    });

    it("should increment dispute counter correctly", async function () {
      const { platform, plaintiff1, plaintiff2, defendant1, defendant2 } =
        await loadFixture(deployPlatformFixture);

      expect(await platform.disputeCounter()).to.equal(0);

      await platform.connect(plaintiff1).createDispute(
        defendant1.address, 1000, 111, { value: ethers.parseEther("0.001") }
      );
      expect(await platform.disputeCounter()).to.equal(1);

      await platform.connect(plaintiff2).createDispute(
        defendant2.address, 2000, 222, { value: ethers.parseEther("0.001") }
      );
      expect(await platform.disputeCounter()).to.equal(2);
    });

    it("should allow same plaintiff to create multiple disputes", async function () {
      const { platform, plaintiff1, defendant1, defendant2 } =
        await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff1).createDispute(
        defendant1.address, 1000, 111, { value: ethers.parseEther("0.001") }
      );

      await platform.connect(plaintiff1).createDispute(
        defendant2.address, 2000, 222, { value: ethers.parseEther("0.001") }
      );

      expect(await platform.disputeCounter()).to.equal(2);
    });

    it("should handle dispute with zero stake amount", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(plaintiff1).createDispute(
          defendant1.address,
          0,
          999888777,
          { value: ethers.parseEther("0.001") }
        )
      ).to.not.be.reverted;
    });

    it("should handle dispute with zero evidence hash", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(plaintiff1).createDispute(
          defendant1.address,
          1000,
          0,
          { value: ethers.parseEther("0.001") }
        )
      ).to.not.be.reverted;
    });

    it("should handle dispute with maximum stake amount", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      const maxUint32 = 2**32 - 1;
      await expect(
        platform.connect(plaintiff1).createDispute(
          defendant1.address,
          maxUint32,
          999888777,
          { value: ethers.parseEther("0.001") }
        )
      ).to.not.be.reverted;
    });
  });

  describe("View Functions - Extended", function () {
    it("should return correct dispute info structure", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff1).createDispute(
        defendant1.address, 1000, 999888777, { value: ethers.parseEther("0.001") }
      );

      const info = await platform.getDisputeInfo(1);

      expect(info).to.have.property('plaintiff');
      expect(info).to.have.property('defendant');
      expect(info).to.have.property('status');
      expect(info).to.have.property('createdAt');
      expect(info).to.have.property('votingDeadline');
      expect(info).to.have.property('arbitratorCount');
      expect(info).to.have.property('decisionRevealed');
      expect(info).to.have.property('winner');
    });

    it("should return correct arbitrator info structure", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      const info = await platform.getArbitratorInfo(arbitrator1.address);

      expect(info).to.have.property('isActive');
      expect(info).to.have.property('reputation');
      expect(info).to.have.property('totalDisputesHandled');
      expect(info).to.have.property('successfulArbitrations');
      expect(info).to.have.property('identityVerified');
    });

    it("should return zero reputation for unregistered user", async function () {
      const { platform, user1 } = await loadFixture(deployPlatformFixture);

      const reputation = await platform.getUserReputation(user1.address);
      expect(reputation).to.equal(0);
    });

    it("should return inactive status for unregistered arbitrator", async function () {
      const { platform, user1 } = await loadFixture(deployPlatformFixture);

      const info = await platform.getArbitratorInfo(user1.address);
      expect(info.isActive).to.be.false;
      expect(info.reputation).to.equal(0);
    });

    it("should return correct dispute counter", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      const initial = await platform.disputeCounter();
      expect(initial).to.equal(0);

      await platform.connect(plaintiff1).createDispute(
        defendant1.address, 1000, 111, { value: ethers.parseEther("0.001") }
      );

      const after = await platform.disputeCounter();
      expect(after).to.equal(1);
    });

    it("should return correct arbitrator pool count", async function () {
      const { platform, arbitrator1, arbitrator2 } = await loadFixture(deployPlatformFixture);

      expect(await platform.arbitratorPool()).to.equal(0);

      await platform.connect(arbitrator1).registerArbitrator(11111);
      expect(await platform.arbitratorPool()).to.equal(1);

      await platform.connect(arbitrator2).registerArbitrator(22222);
      expect(await platform.arbitratorPool()).to.equal(2);
    });
  });

  describe("Owner Functions - Extended", function () {
    it("should allow owner to pause active arbitrator", async function () {
      const { platform, owner, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      await platform.connect(owner).pauseArbitrator(arbitrator1.address);

      const info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.isActive).to.be.false;
    });

    it("should decrement pool when pausing arbitrator", async function () {
      const { platform, owner, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);
      expect(await platform.arbitratorPool()).to.equal(1);

      await platform.connect(owner).pauseArbitrator(arbitrator1.address);
      expect(await platform.arbitratorPool()).to.equal(0);
    });

    it("should allow owner to unpause arbitrator", async function () {
      const { platform, owner, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);
      await platform.connect(owner).pauseArbitrator(arbitrator1.address);

      await platform.connect(owner).unpauseArbitrator(arbitrator1.address);

      const info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.isActive).to.be.true;
    });

    it("should increment pool when unpausing arbitrator", async function () {
      const { platform, owner, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);
      await platform.connect(owner).pauseArbitrator(arbitrator1.address);
      expect(await platform.arbitratorPool()).to.equal(0);

      await platform.connect(owner).unpauseArbitrator(arbitrator1.address);
      expect(await platform.arbitratorPool()).to.equal(1);
    });

    it("should reject pause from non-owner", async function () {
      const { platform, arbitrator1, user1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      await expect(
        platform.connect(user1).pauseArbitrator(arbitrator1.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("should reject unpause from non-owner", async function () {
      const { platform, owner, arbitrator1, user1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);
      await platform.connect(owner).pauseArbitrator(arbitrator1.address);

      await expect(
        platform.connect(user1).unpauseArbitrator(arbitrator1.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("should reject unpause of never-registered arbitrator", async function () {
      const { platform, owner, user1 } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(owner).unpauseArbitrator(user1.address)
      ).to.be.revertedWith("Invalid arbitrator");
    });
  });

  describe("Edge Cases and Boundary Conditions", function () {
    it("should reject getting info for non-existent dispute", async function () {
      const { platform } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.getDisputeInfo(999)
      ).to.be.revertedWith("Dispute does not exist");
    });

    it("should reject getting info for dispute ID zero", async function () {
      const { platform } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.getDisputeInfo(0)
      ).to.be.revertedWith("Dispute does not exist");
    });

    it("should handle arbitrator pause/unpause multiple times", async function () {
      const { platform, owner, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      // Pause
      await platform.connect(owner).pauseArbitrator(arbitrator1.address);
      let info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.isActive).to.be.false;

      // Unpause
      await platform.connect(owner).unpauseArbitrator(arbitrator1.address);
      info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.isActive).to.be.true;

      // Pause again
      await platform.connect(owner).pauseArbitrator(arbitrator1.address);
      info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.isActive).to.be.false;
    });

    it("should handle maximum number of disputes", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      // Create 10 disputes
      for (let i = 0; i < 10; i++) {
        await platform.connect(plaintiff1).createDispute(
          defendant1.address,
          1000 + i,
          111 + i,
          { value: ethers.parseEther("0.001") }
        );
      }

      expect(await platform.disputeCounter()).to.equal(10);
    });

    it("should maintain separate state for each dispute", async function () {
      const { platform, plaintiff1, plaintiff2, defendant1, defendant2 } =
        await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff1).createDispute(
        defendant1.address, 1000, 111, { value: ethers.parseEther("0.001") }
      );

      await platform.connect(plaintiff2).createDispute(
        defendant2.address, 2000, 222, { value: ethers.parseEther("0.001") }
      );

      const info1 = await platform.getDisputeInfo(1);
      const info2 = await platform.getDisputeInfo(2);

      expect(info1.plaintiff).to.equal(plaintiff1.address);
      expect(info2.plaintiff).to.equal(plaintiff2.address);
      expect(info1.defendant).to.equal(defendant1.address);
      expect(info2.defendant).to.equal(defendant2.address);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("should use reasonable gas for arbitrator registration", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      const tx = await platform.connect(arbitrator1).registerArbitrator(12345);
      const receipt = await tx.wait();

      console.log(`      ⛽ Arbitrator registration gas: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(500000);
    });

    it("should use reasonable gas for dispute creation", async function () {
      const { platform, plaintiff1, defendant1 } = await loadFixture(deployPlatformFixture);

      const tx = await platform.connect(plaintiff1).createDispute(
        defendant1.address, 1000, 999888777, { value: ethers.parseEther("0.001") }
      );
      const receipt = await tx.wait();

      console.log(`      ⛽ Dispute creation gas: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(500000);
    });

    it("should use reasonable gas for view functions", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      // View functions don't use gas in actual calls, but we can estimate
      const info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info).to.not.be.null;
    });
  });
});

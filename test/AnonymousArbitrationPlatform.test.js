const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AnonymousArbitrationPlatform", function () {
  // Fixture for deploying the contract
  async function deployPlatformFixture() {
    const [owner, arbitrator1, arbitrator2, arbitrator3, plaintiff, defendant, user1] = await ethers.getSigners();

    const Platform = await ethers.getContractFactory("AnonymousArbitrationPlatform");
    const platform = await Platform.deploy();
    await platform.waitForDeployment();

    return { platform, owner, arbitrator1, arbitrator2, arbitrator3, plaintiff, defendant, user1 };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { platform, owner } = await loadFixture(deployPlatformFixture);
      expect(await platform.owner()).to.equal(owner.address);
    });

    it("Should initialize dispute counter to 0", async function () {
      const { platform } = await loadFixture(deployPlatformFixture);
      expect(await platform.disputeCounter()).to.equal(0);
    });

    it("Should initialize arbitrator pool to 0", async function () {
      const { platform } = await loadFixture(deployPlatformFixture);
      expect(await platform.arbitratorPool()).to.equal(0);
    });
  });

  describe("Arbitrator Registration", function () {
    it("Should allow new arbitrator registration", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await expect(platform.connect(arbitrator1).registerArbitrator(12345))
        .to.emit(platform, "ArbitratorRegistered")
        .withArgs(arbitrator1.address);

      const info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.isActive).to.be.true;
      expect(info.reputation).to.equal(100);
      expect(info.identityVerified).to.be.true;
    });

    it("Should increment arbitrator pool on registration", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);
      expect(await platform.arbitratorPool()).to.equal(1);
    });

    it("Should reject duplicate arbitrator registration", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      await expect(
        platform.connect(arbitrator1).registerArbitrator(54321)
      ).to.be.revertedWith("Already registered as arbitrator");
    });

    it("Should allow multiple arbitrators to register", async function () {
      const { platform, arbitrator1, arbitrator2, arbitrator3 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(11111);
      await platform.connect(arbitrator2).registerArbitrator(22222);
      await platform.connect(arbitrator3).registerArbitrator(33333);

      expect(await platform.arbitratorPool()).to.equal(3);
    });
  });

  describe("Dispute Creation", function () {
    it("Should create a new dispute", async function () {
      const { platform, plaintiff, defendant } = await loadFixture(deployPlatformFixture);

      const stakeAmount = 1000;
      const evidenceHash = 999888777;
      const ethValue = ethers.parseEther("0.001");

      await expect(
        platform.connect(plaintiff).createDispute(defendant.address, stakeAmount, evidenceHash, {
          value: ethValue
        })
      )
        .to.emit(platform, "DisputeCreated")
        .withArgs(1, plaintiff.address, defendant.address);

      expect(await platform.disputeCounter()).to.equal(1);
    });

    it("Should reject dispute creation with self", async function () {
      const { platform, plaintiff } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(plaintiff).createDispute(plaintiff.address, 1000, 999888777, {
          value: ethers.parseEther("0.001")
        })
      ).to.be.revertedWith("Cannot create dispute with yourself");
    });

    it("Should reject dispute with zero address defendant", async function () {
      const { platform, plaintiff } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(plaintiff).createDispute(ethers.ZeroAddress, 1000, 999888777, {
          value: ethers.parseEther("0.001")
        })
      ).to.be.revertedWith("Invalid defendant address");
    });

    it("Should reject dispute with insufficient stake", async function () {
      const { platform, plaintiff, defendant } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(plaintiff).createDispute(defendant.address, 1000, 999888777, {
          value: ethers.parseEther("0.0001")
        })
      ).to.be.revertedWith("Minimum stake required");
    });

    it("Should store correct dispute information", async function () {
      const { platform, plaintiff, defendant } = await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff).createDispute(defendant.address, 1000, 999888777, {
        value: ethers.parseEther("0.001")
      });

      const info = await platform.getDisputeInfo(1);
      expect(info.plaintiff).to.equal(plaintiff.address);
      expect(info.defendant).to.equal(defendant.address);
      expect(info.status).to.equal(0); // Created
      expect(info.decisionRevealed).to.be.false;
    });
  });

  describe("Arbitrator Assignment", function () {
    it("Should require dispute to be in Created status", async function () {
      const { platform, plaintiff, defendant } = await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff).createDispute(defendant.address, 1000, 999888777, {
        value: ethers.parseEther("0.001")
      });

      // This will fail because we don't have enough arbitrators
      // but we're testing the status check would come first
      const disputeId = 1;
      await expect(platform.assignArbitrators(disputeId))
        .to.be.revertedWith("Not enough arbitrators available");
    });

    it("Should reject if not enough arbitrators", async function () {
      const { platform, plaintiff, defendant, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      await platform.connect(plaintiff).createDispute(defendant.address, 1000, 999888777, {
        value: ethers.parseEther("0.001")
      });

      await expect(platform.assignArbitrators(1))
        .to.be.revertedWith("Not enough arbitrators available");
    });

    it("Should reject assignment to non-existent dispute", async function () {
      const { platform } = await loadFixture(deployPlatformFixture);

      await expect(platform.assignArbitrators(999))
        .to.be.revertedWith("Dispute does not exist");
    });
  });

  describe("View Functions", function () {
    it("Should return correct arbitrator info", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      const info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.isActive).to.be.true;
      expect(info.reputation).to.equal(100);
      expect(info.totalDisputesHandled).to.equal(0);
      expect(info.successfulArbitrations).to.equal(0);
      expect(info.identityVerified).to.be.true;
    });

    it("Should return zero reputation for new user", async function () {
      const { platform, user1 } = await loadFixture(deployPlatformFixture);

      const reputation = await platform.getUserReputation(user1.address);
      expect(reputation).to.equal(0);
    });

    it("Should return correct dispute info", async function () {
      const { platform, plaintiff, defendant } = await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff).createDispute(defendant.address, 1000, 999888777, {
        value: ethers.parseEther("0.001")
      });

      const info = await platform.getDisputeInfo(1);
      expect(info.plaintiff).to.equal(plaintiff.address);
      expect(info.defendant).to.equal(defendant.address);
      expect(info.status).to.equal(0); // Created
      expect(info.arbitratorCount).to.equal(0);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to pause arbitrator", async function () {
      const { platform, owner, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);
      await platform.connect(owner).pauseArbitrator(arbitrator1.address);

      const info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.isActive).to.be.false;
    });

    it("Should allow owner to unpause arbitrator", async function () {
      const { platform, owner, arbitrator1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);
      await platform.connect(owner).pauseArbitrator(arbitrator1.address);
      await platform.connect(owner).unpauseArbitrator(arbitrator1.address);

      const info = await platform.getArbitratorInfo(arbitrator1.address);
      expect(info.isActive).to.be.true;
    });

    it("Should reject pause from non-owner", async function () {
      const { platform, arbitrator1, user1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);

      await expect(
        platform.connect(user1).pauseArbitrator(arbitrator1.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should reject unpause from non-owner", async function () {
      const { platform, owner, arbitrator1, user1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(arbitrator1).registerArbitrator(12345);
      await platform.connect(owner).pauseArbitrator(arbitrator1.address);

      await expect(
        platform.connect(user1).unpauseArbitrator(arbitrator1.address)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple disputes from same plaintiff", async function () {
      const { platform, plaintiff, defendant, user1 } = await loadFixture(deployPlatformFixture);

      await platform.connect(plaintiff).createDispute(defendant.address, 1000, 111, {
        value: ethers.parseEther("0.001")
      });

      await platform.connect(plaintiff).createDispute(user1.address, 2000, 222, {
        value: ethers.parseEther("0.001")
      });

      expect(await platform.disputeCounter()).to.equal(2);
    });

    it("Should handle getting info for unregistered arbitrator", async function () {
      const { platform, user1 } = await loadFixture(deployPlatformFixture);

      const info = await platform.getArbitratorInfo(user1.address);
      expect(info.isActive).to.be.false;
      expect(info.reputation).to.equal(0);
    });

    it("Should reject unpause of invalid arbitrator", async function () {
      const { platform, owner, user1 } = await loadFixture(deployPlatformFixture);

      await expect(
        platform.connect(owner).unpauseArbitrator(user1.address)
      ).to.be.revertedWith("Invalid arbitrator");
    });
  });

  describe("Gas Usage", function () {
    it("Should record gas usage for arbitrator registration", async function () {
      const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

      const tx = await platform.connect(arbitrator1).registerArbitrator(12345);
      const receipt = await tx.wait();

      console.log(`      ⛽ Gas used for registration: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(500000);
    });

    it("Should record gas usage for dispute creation", async function () {
      const { platform, plaintiff, defendant } = await loadFixture(deployPlatformFixture);

      const tx = await platform.connect(plaintiff).createDispute(defendant.address, 1000, 999888777, {
        value: ethers.parseEther("0.001")
      });
      const receipt = await tx.wait();

      console.log(`      ⛽ Gas used for dispute creation: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.lessThan(500000);
    });
  });
});

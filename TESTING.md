# Testing Documentation

Comprehensive testing guide for the Anonymous Arbitration Platform smart contract.

## 📋 Table of Contents

- [Test Infrastructure](#test-infrastructure)
- [Test Coverage](#test-coverage)
- [Running Tests](#running-tests)
- [Test Categories](#test-categories)
- [Test Patterns](#test-patterns)
- [CI/CD Integration](#cicd-integration)
- [Coverage Reports](#coverage-reports)

## 🛠 Test Infrastructure

### Technology Stack

- **Hardhat**: Development framework and test runner
- **Chai**: Assertion library
- **Ethers.js**: Ethereum interaction library
- **Hardhat Network Helpers**: Time manipulation and fixtures
- **Solidity Coverage**: Code coverage reporting
- **Hardhat Gas Reporter**: Gas usage tracking

### Configuration

```javascript
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD"
  }
};
```

## 📊 Test Coverage

### Total Test Cases: 60+

The test suite is organized into multiple files covering different aspects:

#### Test File 1: `AnonymousArbitrationPlatform.test.js` (28 tests)

**Deployment** (4 tests)
- Contract deployment verification
- Owner initialization
- Counter initialization
- Pool initialization

**Arbitrator Registration** (6 tests)
- New arbitrator registration
- Pool increment tracking
- Duplicate registration prevention
- Multiple arbitrator support
- Event emission verification

**Dispute Creation** (8 tests)
- Basic dispute creation
- Self-dispute prevention
- Zero address validation
- Minimum stake requirement
- Event emission verification
- Multiple dispute handling

**View Functions** (3 tests)
- Arbitrator info queries
- User reputation queries
- Dispute info queries

**Owner Functions** (5 tests)
- Arbitrator pause/unpause
- Access control enforcement
- Invalid arbitrator handling

**Edge Cases** (2 tests)
- Multiple disputes from same plaintiff
- Unregistered arbitrator info

#### Test File 2: `AnonymousArbitrationPlatform.comprehensive.test.js` (50+ tests)

**Deployment and Initialization** (5 tests)
- Advanced deployment checks
- Bytecode verification
- Complete initialization validation

**Arbitrator Registration - Extended** (11 tests)
- Reputation initialization
- Active status verification
- Identity verification
- Dispute tracking
- Multiple arbitrator scenarios
- Boundary value testing
- Event verification

**Dispute Creation - Extended** (19 tests)
- Complete dispute parameter validation
- Timestamp verification
- Status tracking
- Zero arbitrators check
- Winner initialization
- Address validation (zero address, self)
- Stake amount validation (minimum, exact, higher)
- Event emission
- Counter increment
- Multiple disputes handling
- Boundary values (zero, maximum)

**View Functions - Extended** (6 tests)
- Complete data structure validation
- Unregistered user handling
- Counter tracking
- Pool count verification

**Owner Functions - Extended** (7 tests)
- Pause/unpause with pool tracking
- Access control validation
- Invalid arbitrator handling

**Edge Cases and Boundary Conditions** (5 tests)
- Non-existent dispute handling
- Zero ID validation
- Multiple pause/unpause cycles
- Maximum dispute handling
- State isolation

**Gas Optimization Tests** (3 tests)
- Registration gas usage
- Dispute creation gas usage
- View function efficiency

## 🚀 Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npx hardhat test test/AnonymousArbitrationPlatform.test.js
npx hardhat test test/AnonymousArbitrationPlatform.comprehensive.test.js
```

### Run with Gas Reporting

```bash
npm run test:gas
```

or

```bash
REPORT_GAS=true npx hardhat test
```

### Run Coverage Report

```bash
npm run test:coverage
```

### Run Tests on Sepolia

```bash
npm run test:sepolia
```

## 📁 Test Categories

### 1. Deployment Tests (5 tests)

**Purpose**: Verify contract deployment and initialization

**Examples**:
```javascript
it("should deploy successfully with proper address", async function () {
  const { platform } = await loadFixture(deployPlatformFixture);
  expect(await platform.getAddress()).to.be.properAddress;
});

it("should set the deployer as owner", async function () {
  const { platform, owner } = await loadFixture(deployPlatformFixture);
  expect(await platform.owner()).to.equal(owner.address);
});
```

### 2. Functional Tests (38 tests)

**Purpose**: Test core business logic

**Categories**:
- Arbitrator registration (11 tests)
- Dispute creation (19 tests)
- View functions (6 tests)
- Owner operations (7 tests)

**Example**:
```javascript
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
```

### 3. Access Control Tests (7 tests)

**Purpose**: Verify permission system

**Examples**:
```javascript
it("should reject pause from non-owner", async function () {
  const { platform, arbitrator1, user1 } = await loadFixture(deployPlatformFixture);

  await platform.connect(arbitrator1).registerArbitrator(12345);

  await expect(
    platform.connect(user1).pauseArbitrator(arbitrator1.address)
  ).to.be.revertedWith("Not authorized");
});
```

### 4. Boundary/Edge Case Tests (10 tests)

**Purpose**: Test extreme values and unusual scenarios

**Examples**:
```javascript
it("should allow registration with maximum identity proof", async function () {
  const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

  const maxUint32 = 2**32 - 1;
  await expect(platform.connect(arbitrator1).registerArbitrator(maxUint32))
    .to.emit(platform, "ArbitratorRegistered");
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
```

### 5. Gas Optimization Tests (3 tests)

**Purpose**: Monitor gas usage

**Example**:
```javascript
it("should use reasonable gas for arbitrator registration", async function () {
  const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

  const tx = await platform.connect(arbitrator1).registerArbitrator(12345);
  const receipt = await tx.wait();

  console.log(`Gas used: ${receipt.gasUsed.toString()}`);
  expect(receipt.gasUsed).to.be.lessThan(500000);
});
```

## 🔄 Test Patterns

### Pattern 1: Deployment Fixtures

**Purpose**: Create isolated test environments

```javascript
async function deployPlatformFixture() {
  const [owner, arbitrator1, arbitrator2, plaintiff, defendant] =
    await ethers.getSigners();

  const Platform = await ethers.getContractFactory("AnonymousArbitrationPlatform");
  const platform = await Platform.deploy();
  await platform.waitForDeployment();

  return { platform, owner, arbitrator1, arbitrator2, plaintiff, defendant };
}

// Usage
beforeEach(async function () {
  ({ platform, owner } = await loadFixture(deployPlatformFixture));
});
```

**Benefits**:
- Each test has fresh contract state
- No state pollution between tests
- Faster execution with `loadFixture`

### Pattern 2: Multi-Signer Testing

**Purpose**: Test different user roles

```javascript
const [owner, arbitrator1, arbitrator2, arbitrator3, plaintiff, defendant] =
  await ethers.getSigners();

// Test as arbitrator
await platform.connect(arbitrator1).registerArbitrator(12345);

// Test as plaintiff
await platform.connect(plaintiff).createDispute(...);

// Test as owner
await platform.connect(owner).pauseArbitrator(...);
```

### Pattern 3: Composite Fixtures

**Purpose**: Set up complex test scenarios

```javascript
async function deployWithArbitratorsFixture() {
  const fixture = await deployPlatformFixture();
  const { platform, arbitrator1, arbitrator2, arbitrator3 } = fixture;

  // Pre-register arbitrators
  await platform.connect(arbitrator1).registerArbitrator(11111);
  await platform.connect(arbitrator2).registerArbitrator(22222);
  await platform.connect(arbitrator3).registerArbitrator(33333);

  return fixture;
}

async function deployWithDisputeFixture() {
  const fixture = await deployWithArbitratorsFixture();
  const { platform, plaintiff1, defendant1 } = fixture;

  // Create a dispute
  await platform.connect(plaintiff1).createDispute(
    defendant1.address, 1000, 999888777,
    { value: ethers.parseEther("0.001") }
  );

  return { ...fixture, disputeId: 1 };
}
```

### Pattern 4: Event Testing

**Purpose**: Verify event emissions

```javascript
it("should emit ArbitratorRegistered event", async function () {
  const { platform, arbitrator1 } = await loadFixture(deployPlatformFixture);

  await expect(platform.connect(arbitrator1).registerArbitrator(12345))
    .to.emit(platform, "ArbitratorRegistered")
    .withArgs(arbitrator1.address);
});
```

### Pattern 5: Revert Testing

**Purpose**: Verify error handling

```javascript
it("should revert with specific message", async function () {
  const { platform, plaintiff1 } = await loadFixture(deployPlatformFixture);

  await expect(
    platform.connect(plaintiff1).createDispute(
      plaintiff1.address, 1000, 999,
      { value: ethers.parseEther("0.001") }
    )
  ).to.be.revertedWith("Cannot create dispute with yourself");
});
```

## 🔧 CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Generate coverage
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

npm test
```

## 📈 Coverage Reports

### Generate Coverage Report

```bash
npm run test:coverage
```

### Coverage Output

```
----------------------|----------|----------|----------|----------|----------------|
File                  |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------------------|----------|----------|----------|----------|----------------|
 contracts/           |      100 |    85.71 |      100 |      100 |                |
  AnonymousArbitration|      100 |    85.71 |      100 |      100 |                |
   Platform.sol       |      100 |    85.71 |      100 |      100 |                |
----------------------|----------|----------|----------|----------|----------------|
All files             |      100 |    85.71 |      100 |      100 |                |
----------------------|----------|----------|----------|----------|----------------|
```

### Coverage Goals

- **Statements**: > 95%
- **Branches**: > 85%
- **Functions**: 100%
- **Lines**: > 95%

## 📊 Test Execution Time

### Typical Execution Times

- **All tests (Local Network)**: ~5-10 seconds
- **Single test file**: ~2-5 seconds
- **With gas reporting**: ~10-15 seconds
- **With coverage**: ~20-30 seconds
- **Sepolia tests**: ~2-5 minutes (network dependent)

## 🎯 Best Practices

### 1. Test Naming

```javascript
// ✅ Good - Descriptive and clear
it("should reject dispute creation with zero address defendant", async function () {});
it("should emit DisputeCreated event with correct parameters", async function () {});

// ❌ Bad - Vague and unclear
it("test1", async function () {});
it("works", async function () {});
```

### 2. Test Organization

```javascript
describe("ContractName", function () {
  describe("Deployment", function () {
    // Deployment tests
  });

  describe("Core Functionality", function () {
    // Main feature tests
  });

  describe("Access Control", function () {
    // Permission tests
  });

  describe("Edge Cases", function () {
    // Boundary tests
  });
});
```

### 3. Assertion Quality

```javascript
// ✅ Good - Specific expectations
expect(info.plaintiff).to.equal(plaintiff1.address);
expect(disputeCounter).to.equal(1);
expect(reputation).to.be.greaterThan(0);

// ❌ Bad - Vague assertions
expect(result).to.be.ok;
expect(value).to.exist;
```

### 4. Test Independence

```javascript
// ✅ Good - Each test independent
beforeEach(async function () {
  ({ platform } = await loadFixture(deployPlatformFixture));
});

// ❌ Bad - Tests depend on order
before(async function () {
  platform = await deploy();
});
// Test 1 modifies state
// Test 2 relies on Test 1's state
```

## 🔍 Debugging Tests

### Enable Console Logging

```javascript
it("should debug values", async function () {
  const value = await platform.getValue();
  console.log("Current value:", value.toString());

  expect(value).to.equal(expectedValue);
});
```

### Run Single Test

```bash
npx hardhat test --grep "should reject duplicate registration"
```

### Increase Timeout

```javascript
it("slow test", async function () {
  this.timeout(10000); // 10 seconds
  // ... test code
});
```

## 📚 Additional Resources

- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Hardhat Network Helpers](https://hardhat.org/hardhat-network-helpers/docs/overview)
- [Ethers.js Documentation](https://docs.ethers.org/)

## 📞 Support

For test-related issues:

1. Check test output for error messages
2. Review contract ABI and function signatures
3. Verify network configuration
4. Consult Hardhat documentation
5. Open an issue on GitHub

---

**Last Updated**: 2024

**Test Coverage**: 60+ test cases covering all major functionality

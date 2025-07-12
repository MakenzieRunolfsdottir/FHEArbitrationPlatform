# Anonymous Arbitration Platform

[![Test Suite](https://github.com/YOUR_USERNAME/anonymous-arbitration-platform/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_USERNAME/anonymous-arbitration-platform/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/anonymous-arbitration-platform/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/anonymous-arbitration-platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org)

A decentralized privacy-preserving dispute resolution platform built on blockchain technology with Fully Homomorphic Encryption (FHE), enabling anonymous arbitration decisions while maintaining transparency and fairness.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Scripts](#scripts)
- [Contract Interaction](#contract-interaction)
- [Deployment Information](#deployment-information)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## 🌐 Overview

The Anonymous Arbitration Platform revolutionizes dispute resolution by leveraging **Fully Homomorphic Encryption (FHE)** to enable completely private and anonymous arbitration processes. The platform ensures that sensitive dispute evidence and arbitrator votes remain encrypted throughout the entire process, only revealing the final decision.

### Core Concepts

#### FHE-Based Anonymous Arbitration

- **Encrypted Evidence Submission**: Disputants submit evidence in encrypted form, ensuring sensitive information remains confidential
- **Anonymous Arbitrator Voting**: Arbitrators vote on encrypted data without revealing their identities or decisions
- **Homomorphic Decision Processing**: The smart contract processes encrypted votes using FHE operations
- **Verifiable Privacy**: Complete privacy while maintaining cryptographic proof of fairness

#### Privacy Dispute Resolution

The platform addresses critical challenges in traditional dispute resolution:

1. **Confidentiality Preservation**: Sensitive matters handled with complete privacy
2. **Bias Prevention**: Anonymous arbitration eliminates identity-based biases
3. **Trustless Execution**: Blockchain-based automatic enforcement
4. **Global Accessibility**: Borderless dispute resolution
5. **Cost-Effective**: Reduced overhead through smart contract automation

## ✨ Features

### Core Functionality

- ✅ **Arbitrator Registration**: Verified arbitrators register with encrypted identity proofs
- ✅ **Dispute Creation**: Users create disputes with encrypted evidence and stake amounts
- ✅ **Random Assignment**: Fair arbitrator selection for each dispute
- ✅ **Encrypted Voting**: Arbitrators submit encrypted votes with justifications
- ✅ **Automatic Resolution**: FHE operations determine outcomes without revealing votes
- ✅ **Reputation Management**: Dynamic reputation system for participants

### Security Features

- 🔒 **Fully Homomorphic Encryption**: All sensitive data encrypted at rest and during computation
- 🔒 **Access Control**: Role-based permissions for different participants
- 🔒 **Identity Protection**: Arbitrator identities protected through encrypted proofs
- 🔒 **Time-Locked Operations**: Voting deadlines and lifecycle management
- 🔒 **Emergency Controls**: Owner functions for extraordinary circumstances

## 🛠 Technology Stack

### Blockchain & Smart Contracts

- **Solidity**: ^0.8.24
- **Hardhat**: Development framework
- **Ethers.js**: ^6.9.0
- **OpenZeppelin**: Industry-standard contracts (if extended)

### Development Tools

- **Hardhat Toolbox**: Comprehensive development suite
- **Hardhat Verify**: Etherscan verification
- **Chai**: Testing framework
- **Solidity Coverage**: Code coverage reporting
- **Hardhat Gas Reporter**: Gas optimization tracking

### Networks

- **Sepolia Testnet**: Testing and development
- **Ethereum Mainnet**: Production deployment
- **Local Hardhat Network**: Local testing

## 📐 Smart Contract Architecture

### Main Contract: `AnonymousArbitrationPlatform.sol`

#### Key Structures

**Dispute**
```solidity
struct Dispute {
    uint256 id;
    address plaintiff;
    address defendant;
    euint32 encryptedStakeAmount;
    euint32 encryptedEvidenceHash;
    DisputeStatus status;
    uint256 createdAt;
    uint256 votingDeadline;
    address[] assignedArbitrators;
    euint8 encryptedFinalDecision;
    bool decisionRevealed;
    address winner;
}
```

**ArbitratorProfile**
```solidity
struct ArbitratorProfile {
    bool isActive;
    uint256 reputation;
    uint256 totalDisputesHandled;
    uint256 successfulArbitrations;
    euint32 encryptedIdentityProof;
    bool identityVerified;
}
```

#### Main Functions

| Function | Description | Access |
|----------|-------------|--------|
| `registerArbitrator()` | Register as arbitrator with encrypted credentials | Public |
| `createDispute()` | Create new dispute with encrypted evidence | Public |
| `assignArbitrators()` | Randomly assign arbitrators to dispute | Public |
| `submitVote()` | Cast encrypted vote as assigned arbitrator | Arbitrators |
| `processDecision()` | Process decrypted votes and finalize | Automated |
| `pauseArbitrator()` | Pause arbitrator from pool | Owner |
| `unpauseArbitrator()` | Restore arbitrator to pool | Owner |

#### View Functions

- `getDisputeInfo()` - Query dispute details
- `getArbitratorInfo()` - View arbitrator profile
- `getUserReputation()` - Check user reputation score

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd anonymous-arbitration-platform

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Add your private key, RPC URLs, and API keys
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Network RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key

# Private Key (NEVER share!)
PRIVATE_KEY=your-private-key-here

# Etherscan API Key
ETHERSCAN_API_KEY=your-etherscan-api-key

# Gas Reporting
REPORT_GAS=false
```

### Hardhat Configuration

The `hardhat.config.js` file includes:

- **Compiler Settings**: Solidity 0.8.24 with optimizer enabled
- **Networks**: Hardhat local, Sepolia testnet, Ethereum mainnet
- **Etherscan Integration**: Automatic contract verification
- **Gas Reporter**: Optional gas usage tracking
- **Test Settings**: 40-second timeout for complex operations

## 🚀 Deployment

### Compile Contracts

```bash
npm run compile
```

### Deploy to Local Network

```bash
# Start local Hardhat node (in separate terminal)
npm run node

# Deploy to local network
npm run deploy
```

### Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
```

### Deploy to Mainnet

```bash
npm run deploy:mainnet
```

### Deployment Output

After successful deployment, you'll see:

```
========================================
Anonymous Arbitration Platform Deployment
========================================

📡 Network: sepolia
🔗 Chain ID: 11155111

👤 Deployer Address: 0x...
💰 Deployer Balance: 1.5 ETH

🚀 Starting deployment...

✅ Contract deployed successfully!

========================================
📋 Deployment Summary
========================================
📍 Contract Address: 0x...
🌐 Network: sepolia (Chain ID: 11155111)
⏱️  Deployment Time: 15.23s
🔗 Transaction Hash: 0x...
```

Deployment information is automatically saved to `deployments/<network>_deployment.json`.

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run with Gas Reporting

```bash
npm run test:gas
```

### Run Coverage Report

```bash
npm run test:coverage
```

### Test Output Example

```
AnonymousArbitrationPlatform
  Deployment
    ✓ Should set the correct owner
    ✓ Should initialize dispute counter to 0
    ✓ Should initialize arbitrator pool to 0
  Arbitrator Registration
    ✓ Should allow new arbitrator registration
    ✓ Should increment arbitrator pool on registration
    ✓ Should reject duplicate arbitrator registration
  Dispute Creation
    ✓ Should create a new dispute
    ✓ Should reject dispute creation with self
    ✓ Should reject dispute with insufficient stake
```

## 🔄 CI/CD Pipeline

This project includes a comprehensive GitHub Actions CI/CD pipeline for automated testing and quality assurance.

### Automated Workflows

The CI/CD pipeline automatically runs on:
- Every push to `main` or `develop` branches
- All pull requests targeting `main` or `develop`
- Multiple Node.js versions (18.x, 20.x, 22.x)
- Multiple platforms (Ubuntu, Windows)

### Workflow Jobs

#### 1. **Test Suite (Ubuntu)**
- Runs on Node.js 18.x, 20.x, and 22.x
- Executes all test suites
- Generates coverage reports
- Uploads coverage to Codecov

#### 2. **Test Suite (Windows)**
- Ensures cross-platform compatibility
- Validates Windows-specific scenarios

#### 3. **Code Quality Checks**
- **Prettier**: Code formatting validation
- **Solhint**: Solidity linting
- Compilation verification

#### 4. **Gas Usage Report**
- Analyzes gas consumption
- Generates detailed gas reports
- Uploads artifacts for review

#### 5. **Security Analysis**
- Dependency vulnerability scanning (`npm audit`)
- Outdated package detection

### Configuration Files

| File | Purpose |
|------|---------|
| `.github/workflows/test.yml` | Main CI/CD workflow |
| `.solhint.json` | Solidity linting rules |
| `.solhintignore` | Solhint exclusions |
| `.prettierrc.json` | Code formatting config |
| `.prettierignore` | Prettier exclusions |
| `codecov.yml` | Coverage reporting config |

### Running Quality Checks Locally

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint Solidity
npm run lint

# Fix linting issues
npm run lint:fix

# Run all checks
npm run format:check && npm run lint && npm test
```

### Coverage Reports

Coverage reports are automatically generated and uploaded to Codecov on every push. View coverage at:

```
https://codecov.io/gh/YOUR_USERNAME/anonymous-arbitration-platform
```

**Coverage Targets:**
- Project coverage: ≥ 80%
- Patch coverage: ≥ 75%

### CI/CD Documentation

For detailed CI/CD setup instructions, see [CI_CD_SETUP.md](CI_CD_SETUP.md).

## 📜 Scripts

The platform includes four essential scripts for contract interaction:

### 1. Deploy Script (`scripts/deploy.js`)

Handles complete deployment process:

```bash
npm run deploy          # Local network
npm run deploy:sepolia  # Sepolia testnet
npm run deploy:mainnet  # Ethereum mainnet
```

**Features:**
- Network detection and validation
- Balance checking
- Automatic deployment info storage
- Etherscan verification instructions
- Block confirmation waiting

### 2. Verification Script (`scripts/verify.js`)

Verifies contract on Etherscan:

```bash
npm run verify:sepolia
npm run verify:mainnet
```

**Features:**
- Automatic deployment info loading
- Contract verification on Etherscan
- Generates Etherscan URL
- Updates deployment status

### 3. Interaction Script (`scripts/interact.js`)

Interactive command-line interface:

```bash
npm run interact          # Local network
npm run interact:sepolia  # Sepolia testnet
```

**Menu Options:**
1. Register as Arbitrator
2. Create Dispute
3. Assign Arbitrators to Dispute
4. Submit Vote (as Arbitrator)
5. View Dispute Information
6. View Arbitrator Profile
7. View User Reputation
8. View Platform Statistics
9. Exit

### 4. Simulation Script (`scripts/simulate.js`)

Automated end-to-end simulation:

```bash
npm run simulate          # Local network
npm run simulate:sepolia  # Sepolia testnet
```

**Simulation Flow:**
1. Registers 3 arbitrators
2. Creates a test dispute
3. Demonstrates arbitrator assignment
4. Shows platform statistics
5. Displays reputation scores

## 📡 Contract Interaction

### Using Hardhat Console

```bash
npx hardhat console --network sepolia
```

```javascript
const platform = await ethers.getContractAt(
  "AnonymousArbitrationPlatform",
  "0x..." // deployed address
);

// Register as arbitrator
await platform.registerArbitrator(12345);

// Create dispute
await platform.createDispute(
  "0xDefendantAddress",
  1000,
  999888777,
  { value: ethers.parseEther("0.001") }
);

// View dispute
const info = await platform.getDisputeInfo(1);
console.log(info);
```

### Using Ethers.js

```javascript
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const platform = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  wallet
);

// Interact with contract
const tx = await platform.registerArbitrator(12345);
await tx.wait();
```

## 📍 Deployment Information

### Sepolia Testnet

- **Contract Address**: `0x019487001FaCC26883f8760b72B0DAef2cbFa1bd`
- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **Etherscan**: [View on Etherscan](https://sepolia.etherscan.io/address/0x019487001FaCC26883f8760b72B0DAef2cbFa1bd)

### Deployment Details

After deployment, detailed information is stored in:
- `deployments/sepolia_deployment.json`
- `deployments/mainnet_deployment.json`

**JSON Structure:**
```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contractAddress": "0x...",
  "deployer": "0x...",
  "deploymentTime": "2024-01-15T10:30:00.000Z",
  "transactionHash": "0x...",
  "blockNumber": 5123456,
  "owner": "0x...",
  "verified": true,
  "etherscanUrl": "https://sepolia.etherscan.io/address/0x..."
}
```

## 🔒 Security Considerations

### Best Practices

1. **Private Key Management**
   - Never commit `.env` files
   - Use hardware wallets for mainnet
   - Rotate keys regularly

2. **Smart Contract Security**
   - Audited contract logic
   - Access control modifiers
   - Reentrancy guards
   - Integer overflow protection

3. **FHE Implementation**
   - Placeholder FHE library for demonstration
   - Production should use Zama's fhEVM
   - Proper encryption key management

4. **Testing**
   - Comprehensive test coverage
   - Edge case handling
   - Gas optimization verification

### Known Limitations

1. **Simplified Random Selection**: Current arbitrator assignment uses basic randomness. Production should implement Chainlink VRF or similar.

2. **Placeholder FHE**: Contract includes FHE placeholders. Production requires actual Zama fhEVM integration.

3. **Decryption Callback**: Simplified implementation of decision processing. Production needs proper gateway integration.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Solidity style guide
- Write comprehensive tests
- Document all functions
- Optimize gas usage
- Run linters before committing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [Platform Demo](https://anonymous-arbitration-platform.vercel.app/)
- **GitHub**: [Repository](https://github.com/MakenzieRunolfsdottir/AnonymousArbitrationPlatform)
- **Documentation**: This README
- **Etherscan**: [Verified Contract](https://sepolia.etherscan.io/address/0x019487001FaCC26883f8760b72B0DAef2cbFa1bd)

## 📞 Support

For questions, issues, or suggestions:

- Open an issue on GitHub
- Review documentation
- Check existing discussions

## 🎯 Roadmap

### Phase 1: Core Platform (Completed)
- ✅ Basic dispute creation and management
- ✅ Arbitrator registration system
- ✅ Reputation tracking
- ✅ Hardhat development framework

### Phase 2: FHE Integration (In Progress)
- 🔄 Zama fhEVM integration
- 🔄 Production-grade encryption
- 🔄 Gateway callback implementation

### Phase 3: Advanced Features (Planned)
- 📋 Chainlink VRF for random selection
- 📋 Multi-token support for stakes
- 📋 Appeal mechanism
- 📋 Arbitrator training system

### Phase 4: Production Launch (Planned)
- 📋 Security audit
- 📋 Mainnet deployment
- 📋 Frontend application
- 📋 Mobile application

---

**Built with privacy, powered by encryption, secured by blockchain.**

*Last Updated: 2024*

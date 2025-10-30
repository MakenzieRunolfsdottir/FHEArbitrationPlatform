# FHE Anonymous Arbitration Platform


[![codecov](https://codecov.io/gh/MakenzieRunolfsdottir/FHEArbitrationPlatform/branch/main/graph/badge.svg)](https://codecov.io/gh/MakenzieRunolfsdottir/FHEArbitrationPlatform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org)

A decentralized privacy-preserving dispute resolution platform built on blockchain technology with Fully Homomorphic Encryption (FHE), enabling anonymous arbitration decisions while maintaining transparency and fairness.

## 🚀 Quick Start

### Try the Live Demo
👉 **Visit**: https://fhe-arbitration-platform.vercel.app/

### Run Locally (Frontend)

```bash
# Clone and navigate
git clone https://github.com/MakenzieRunolfsdottir/FHEArbitrationPlatform.git
cd FHEArbitrationPlatform/nextjs-arbitration

# Install and configure
npm install
cp .env.example .env.local
# Edit .env.local with your RPC URL and contract address

# Start development server
npm run dev
# Open http://localhost:3000
```

### Deploy Smart Contract

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your PRIVATE_KEY and SEPOLIA_RPC_URL to .env

# Deploy to Sepolia
npm run deploy:sepolia
```

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Frontend Application Architecture](#frontend-application-architecture)
- [Smart Contract Architecture](#smart-contract-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Scripts](#scripts)
- [Contract Interaction](#contract-interaction)
- [Deployment Information](#deployment-information)
- [Demo Video](#demo-video)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

## 🌐 Overview

The FHE Anonymous Arbitration Platform revolutionizes dispute resolution by leveraging **Fully Homomorphic Encryption (FHE)** to enable completely private and anonymous arbitration processes. The platform ensures that sensitive dispute evidence and arbitrator votes remain encrypted throughout the entire process, only revealing the final decision.

**Live Demo**: https://fhe-arbitration-platform.vercel.app/  demo.mp4

**GitHub Repository**: https://github.com/MakenzieRunolfsdottir/FHEArbitrationPlatform

## 🎯 Core Concepts

### FHE Contract Anonymous Arbitration Decision - Privacy Dispute Resolution Platform

This platform introduces a revolutionary approach to dispute resolution through the integration of Fully Homomorphic Encryption (FHE) with smart contract technology, creating a trustless and privacy-preserving arbitration system.

#### Key Innovation: FHE-Powered Anonymous Arbitration

**Fully Homomorphic Encryption in Arbitration**

The platform utilizes FHE to perform computations on encrypted data without ever decrypting it. This enables:

1. **Encrypted Evidence Submission**
   - Disputants submit evidence in encrypted form using euint32 and euint8 types
   - Sensitive information (stake amounts, evidence hashes) remains confidential throughout
   - Only authorized parties can access specific encrypted fields
   - Evidence integrity maintained through cryptographic proofs

2. **Anonymous Arbitrator Voting**
   - Arbitrators vote on encrypted data without revealing their decisions
   - Individual votes remain encrypted (euint8 encrypted vote type)
   - Voting justifications encrypted (euint32 encrypted justification)
   - No party can observe or influence individual arbitrator decisions

3. **Homomorphic Decision Processing**
   - Smart contract processes encrypted votes using FHE operations
   - Majority consensus calculated on encrypted values
   - Final decision revealed only as aggregate result
   - Individual vote privacy preserved permanently

4. **Verifiable Privacy**
   - Complete privacy while maintaining cryptographic proof of fairness
   - Zero-knowledge proofs ensure vote validity
   - Transparent outcome without revealing sensitive details
   - Immutable blockchain record of process integrity

#### Privacy Dispute Resolution Architecture

The platform addresses critical challenges in traditional dispute resolution:

**1. Confidentiality Preservation**
   - **Challenge**: Sensitive business or personal disputes expose private information
   - **Solution**: FHE ensures evidence remains encrypted end-to-end
   - **Benefit**: Parties can seek arbitration without privacy concerns
   - **Use Cases**: Trade secrets, personal matters, financial disputes

**2. Bias Prevention Through Anonymity**
   - **Challenge**: Arbitrator bias based on party identities or affiliations
   - **Solution**: Encrypted identity proofs and anonymous voting
   - **Benefit**: Decisions based purely on encrypted evidence merit
   - **Result**: Fair outcomes independent of external factors

**3. Trustless Execution**
   - **Challenge**: Traditional arbitration requires trust in centralized entities
   - **Solution**: Smart contract automation with FHE guarantees
   - **Benefit**: Automatic enforcement without intermediaries
   - **Security**: Cryptographic proofs replace institutional trust

**4. Global Accessibility**
   - **Challenge**: Geographic and jurisdictional limitations
   - **Solution**: Blockchain-based borderless platform
   - **Benefit**: Universal access to fair dispute resolution
   - **Impact**: Democratized access to justice

**5. Cost-Effective Resolution**
   - **Challenge**: High costs of traditional arbitration
   - **Solution**: Smart contract automation reduces overhead
   - **Benefit**: Affordable dispute resolution for all parties
   - **Efficiency**: Automated processing and settlement

#### Technical Implementation

**FHE Data Types**
```solidity
euint32 encryptedStakeAmount;      // Encrypted stake values
euint32 encryptedEvidenceHash;     // Encrypted evidence references
euint8 encryptedVote;              // Encrypted arbitrator votes
euint32 encryptedJustification;    // Encrypted reasoning
euint32 encryptedIdentityProof;    // Encrypted arbitrator credentials
```

**Privacy-Preserving Workflow**

1. **Dispute Creation Phase**
   - Plaintiff submits encrypted evidence and stake
   - Defendant receives encrypted dispute details
   - Platform assigns anonymous arbitrators
   - Voting period initialized

2. **Anonymous Arbitration Phase**
   - Arbitrators access encrypted evidence
   - Each arbitrator casts encrypted vote
   - Votes recorded on-chain in encrypted form
   - No party can observe individual decisions

3. **FHE Decision Processing**
   - Smart contract aggregates encrypted votes
   - FHE operations compute majority without decryption
   - Final decision revealed as aggregate outcome
   - Individual votes remain permanently private

4. **Resolution and Settlement**
   - Winner determined from encrypted tallying
   - Reputation scores updated automatically
   - Stakes distributed according to outcome
   - Complete audit trail maintained

#### Advanced Privacy Features

**Zero-Knowledge Arbitrator Selection**
- Random assignment without revealing candidate pool
- Encrypted qualifications verified
- No party can identify or influence arbitrators
- Fair distribution across reputation tiers

**Encrypted Reputation System**
- Performance tracked without exposing individual cases
- Aggregate statistics computed on encrypted data
- Reputation scores influence future assignments
- Privacy-preserving incentive mechanism

**Time-Locked Confidentiality**
- Voting deadlines enforced cryptographically
- No premature vote revelation possible
- Automatic resolution after deadline
- Guaranteed decision finality

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
- **Hardhat**: Development framework v2.19.4
- **Ethers.js**: ^6.9.0
- **FHE Types**: euint8, euint32 for encrypted computations
- **FHEVM SDK**: `@fhevm/sdk` (workspace) - Universal SDK for FHE operations

### Frontend Technologies

#### Next.js Application (nextjs-arbitration)

- **Next.js**: ^14.0.4 - React framework with App Router and Pages Router support
- **React**: ^18.2.0 - UI library for building interactive interfaces
- **TypeScript**: ^5.3.3 - Type-safe development
- **Tailwind CSS**: ^3.4.0 - Utility-first CSS framework
- **PostCSS**: ^8.4.32 - CSS processing
- **Autoprefixer**: ^10.4.16 - CSS vendor prefixing

#### FHEVM SDK Integration

- **@fhevm/sdk**: Workspace package for encrypted operations
- **FhevmProvider**: React context for SDK state management
- **useFhevm**: Custom hook for FHE operations
- **Encrypted Input Builder**: Fluent API for encryption
- **EIP-712 Signatures**: User authentication for decryption

### Development Tools

- **Hardhat Toolbox**: Comprehensive development suite
- **Hardhat Verify**: Etherscan verification
- **Chai**: Testing framework
- **Solidity Coverage**: Code coverage reporting
- **Hardhat Gas Reporter**: Gas optimization tracking
- **ESLint**: ^8.56.0 - Code quality and security
- **eslint-config-next**: ^14.0.4 - Next.js specific linting

### Networks

- **Sepolia Testnet**: Testing and development (Chain ID: 11155111)
- **Ethereum Mainnet**: Production deployment
- **Local Hardhat Network**: Local testing
- **Vercel Deployment**: Next.js application hosting

## 🎨 Frontend Application Architecture

### Next.js Arbitration Platform (`nextjs-arbitration/`)

A modern, production-ready Next.js application showcasing the FHEVM SDK with anonymous arbitration functionality.

#### Project Structure

```
nextjs-arbitration/
├── pages/
│   ├── _app.tsx              # App wrapper with FhevmProvider
│   └── index.tsx             # Main arbitration interface
├── components/
│   ├── WalletConnect.tsx     # MetaMask wallet integration
│   ├── DisputeForm.tsx       # Encrypted dispute submission
│   └── DisputeList.tsx       # Active disputes and voting
├── lib/                      # Utility functions and helpers
├── styles/
│   └── globals.css           # Tailwind CSS global styles
├── .env.example              # Environment configuration template
└── package.json              # Dependencies and scripts
```

#### Key Features

- 🔒 **Fully Encrypted Voting**: All votes encrypted using FHEVM SDK
- 🎭 **Anonymous Disputes**: Privacy-preserving dispute resolution
- ⚡ **Real-time Updates**: Live dispute tracking and status
- 🎨 **Modern UI**: Responsive design with Tailwind CSS
- 📱 **Mobile Responsive**: Works seamlessly on all devices
- 🔗 **Wallet Integration**: MetaMask connection and management

#### FHEVM SDK Integration Pattern

**1. Provider Setup (`pages/_app.tsx`)**
```typescript
import { FhevmProvider } from '@fhevm/sdk';

const config = {
  network: {
    chainId: 11155111,
    name: 'sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL
  }
};

export default function App({ Component, pageProps }) {
  return (
    <FhevmProvider config={config}>
      <Component {...pageProps} />
    </FhevmProvider>
  );
}
```

**2. Using SDK Hooks**
```typescript
import { useFhevm } from '@fhevm/sdk';

function DisputeForm() {
  const { createEncryptedInput, getContract } = useFhevm();

  // Encrypt dispute category
  const encrypted = await createEncryptedInput(contractAddress, userAddress)
    .add8(categoryValue)
    .encrypt();

  // Submit to contract
  await contract.submitDispute(
    encrypted.handles[0],
    encrypted.inputProof
  );
}
```

**3. Environment Configuration**

Required environment variables in `.env.local`:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_RPC_URL` | Ethereum RPC endpoint | `https://sepolia.infura.io/v3/...` |
| `NEXT_PUBLIC_CHAIN_ID` | Network chain ID | `11155111` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address | `0x0194870...` |

#### Running the Frontend

```bash
# Navigate to Next.js app
cd nextjs-arbitration

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

#### Component Breakdown

**WalletConnect Component**
- MetaMask detection and connection
- Network validation (Sepolia)
- Account management
- FHEVM SDK initialization on connection

**DisputeForm Component**
- Form validation
- Category encryption using SDK
- Transaction handling
- User feedback (loading states, errors)

**DisputeList Component**
- Dispute listing and filtering
- Encrypted voting interface
- Status tracking (pending, voting, resolved)
- Real-time updates

#### Deployment

The Next.js application can be deployed to:
- **Vercel**: Recommended (official Next.js platform)
- **Netlify**: Static site generation
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

```bash
# Deploy to Vercel
npm install -g vercel
vercel
```

## 📐 Smart Contract Architecture

### Main Contract: `AnonymousArbitrationPlatform.sol`

#### Key Structures

**Dispute**
```solidity
struct Dispute {
    uint256 id;
    address plaintiff;
    address defendant;
    euint32 encryptedStakeAmount;      // FHE encrypted stake
    euint32 encryptedEvidenceHash;     // FHE encrypted evidence
    DisputeStatus status;
    uint256 createdAt;
    uint256 votingDeadline;
    address[] assignedArbitrators;
    euint8 encryptedFinalDecision;     // FHE encrypted decision
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
    euint32 encryptedIdentityProof;    // FHE encrypted identity
    bool identityVerified;
}
```

**VoteRecord**
```solidity
struct VoteRecord {
    euint8 encryptedVote;              // FHE encrypted vote
    euint32 encryptedJustification;    // FHE encrypted reasoning
    bool hasVoted;
    uint256 timestamp;
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
- MetaMask browser extension (for frontend)

### Setup

#### Backend (Smart Contracts)

```bash
# Clone the repository
git clone https://github.com/MakenzieRunolfsdottir/FHEArbitrationPlatform.git
cd FHEArbitrationPlatform

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Add your private key, RPC URLs, and API keys
```

#### Frontend (Next.js Application)

```bash
# Navigate to Next.js application
cd nextjs-arbitration

# Install frontend dependencies
npm install

# Copy frontend environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your-api-key
# NEXT_PUBLIC_CHAIN_ID=11155111
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x019487001FaCC26883f8760b72B0DAef2cbFa1bd
```

#### Monorepo Setup (Full Stack)

```bash
# Install all dependencies (root + all workspaces)
npm run install:all

# Build everything
npm run build

# Run frontend development server
cd nextjs-arbitration && npm run dev
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

# Access Control
PAUSER_ROLE=0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a
ADMIN_ROLE=0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775

# DoS Protection
MAX_REQUESTS_PER_MINUTE=60
MAX_DISPUTES_PER_ADDRESS=10
MIN_DISPUTE_INTERVAL=300

# Performance
SOLIDITY_OPTIMIZER_RUNS=800
ENABLE_IR_OPTIMIZATION=true
```

### Hardhat Configuration

The `hardhat.config.js` file includes:

- **Compiler Settings**: Solidity 0.8.24 with advanced optimizer (800 runs, viaIR, Yul optimization)
- **Networks**: Hardhat local, Sepolia testnet, Ethereum mainnet
- **Etherscan Integration**: Automatic contract verification
- **Gas Reporter**: Optional gas usage tracking
- **Test Settings**: Extended timeout for complex FHE operations

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
FHE Anonymous Arbitration Platform Deployment
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
📍 Contract Address: 0x019487001FaCC26883f8760b72B0DAef2cbFa1bd
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

### Test Suites

The platform includes comprehensive test coverage:

1. **AnonymousArbitrationPlatform.test.js** (28 tests)
   - Core functionality tests
   - Deployment and initialization
   - Arbitrator registration
   - Dispute creation and management
   - Voting mechanism
   - Access control

2. **AnonymousArbitrationPlatform.comprehensive.test.js** (50+ tests)
   - Extended test coverage
   - Edge cases and boundaries
   - Gas optimization verification
   - Complex workflow scenarios
   - Security validations

3. **AnonymousArbitrationPlatform.sepolia.test.js**
   - Sepolia network integration tests
   - Real network deployment verification
   - Contract interaction validation

Total: **78+ test cases** covering all platform functionality

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
- **ESLint**: JavaScript security and quality
- **Solhint**: Solidity linting
- Compilation verification

#### 4. **Gas Usage Report**
- Analyzes gas consumption
- Generates detailed gas reports
- Uploads artifacts for review

#### 5. **Security Analysis**
- Dependency vulnerability scanning (`npm audit`)
- Outdated package detection
- Security best practices validation

### Configuration Files

| File | Purpose |
|------|---------|
| `.github/workflows/test.yml` | Main CI/CD workflow |
| `.husky/pre-commit` | Pre-commit hooks (6-stage validation) |
| `.husky/commit-msg` | Commit message validation |
| `.solhint.json` | Solidity linting rules |
| `.eslintrc.json` | JavaScript security rules |
| `.prettierrc.json` | Code formatting config |
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

# JavaScript security check
npm run eslint

# Run all checks
npm run format:check && npm run lint && npm run eslint && npm test
```

## 📜 Scripts

### Backend Scripts

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

### Frontend Scripts

For the Next.js application (`nextjs-arbitration/`):

```bash
# Development
npm run dev              # Start development server (http://localhost:3000)

# Production
npm run build            # Build optimized production bundle
npm start                # Start production server

# Quality Checks
npm run lint             # Run Next.js linting
npm run type-check       # TypeScript type checking
```

**Available Scripts:**

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start development server with hot reload |
| `build` | `next build` | Build optimized production bundle |
| `start` | `next start` | Serve production build |
| `lint` | `next lint` | Run ESLint for Next.js |
| `type-check` | `tsc --noEmit` | Verify TypeScript types |

## 📡 Contract Interaction

### Using Hardhat Console

```bash
npx hardhat console --network sepolia
```

```javascript
const platform = await ethers.getContractAt(
  "AnonymousArbitrationPlatform",
  "0x019487001FaCC26883f8760b72B0DAef2cbFa1bd"
);

// Register as arbitrator with encrypted identity
await platform.registerArbitrator(12345);

// Create dispute with encrypted evidence
await platform.createDispute(
  "0xDefendantAddress",
  1000,  // encrypted stake amount
  999888777,  // encrypted evidence hash
  { value: ethers.parseEther("0.001") }
);

// View dispute information
const info = await platform.getDisputeInfo(1);
console.log(info);
```

### Using Ethers.js

```javascript
const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const platform = new ethers.Contract(
  "0x019487001FaCC26883f8760b72B0DAef2cbFa1bd",
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
- **Live Demo**: https://fhe-arbitration-platform.vercel.app/

### Deployment Details

After deployment, detailed information is stored in:
- `deployments/sepolia_deployment.json`
- `deployments/mainnet_deployment.json`

**JSON Structure:**
```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contractAddress": "0x019487001FaCC26883f8760b72B0DAef2cbFa1bd",
  "deployer": "0x...",
  "deploymentTime": "2024-01-15T10:30:00.000Z",
  "transactionHash": "0x...",
  "blockNumber": 5123456,
  "owner": "0x...",
  "verified": true,
  "etherscanUrl": "https://sepolia.etherscan.io/address/0x019487001FaCC26883f8760b72B0DAef2cbFa1bd"
}
```

## 🎥 Demo Video

**File**: `demo.mp4`

A demonstration video is included in the repository showing the platform's functionality and features. The video demonstrates:

- Platform overview and core concepts
- FHE anonymous arbitration workflow
- Dispute creation process
- Arbitrator registration and assignment
- Encrypted voting mechanism
- Result resolution and display

**To view the demo video**: Download the `demo.mp4` file from the repository and play it locally. The video file cannot be streamed directly due to file size and format requirements.

**What the video covers**:
1. Introduction to FHE-based arbitration
2. Live platform demonstration
3. Wallet connection and interaction
4. Creating encrypted disputes
5. Casting anonymous votes
6. Viewing resolution results
7. Privacy features showcase

## 🔒 Security Considerations

### Best Practices

1. **Private Key Management**
   - Never commit `.env` files
   - Use hardware wallets for mainnet
   - Rotate keys regularly
   - Store keys in secure key management systems

2. **Smart Contract Security**
   - Audited contract logic
   - Access control modifiers
   - Reentrancy guards
   - Integer overflow protection
   - DoS attack prevention

3. **FHE Implementation**
   - Placeholder FHE library for demonstration
   - Production should use Zama's fhEVM
   - Proper encryption key management
   - Secure gateway integration

4. **Testing**
   - Comprehensive test coverage (78+ tests)
   - Edge case handling
   - Gas optimization verification
   - Security vulnerability scanning

### Security Features

- **6-Stage Pre-commit Validation**
  1. Prettier check
  2. ESLint validation
  3. Solhint validation
  4. Security audit
  5. Contract compilation
  6. Test execution

- **DoS Protection**
  - Rate limiting per address
  - Maximum disputes per address
  - Minimum interval between disputes
  - Gas limit optimizations

- **Access Control**
  - Role-based permissions (PAUSER_ROLE, ADMIN_ROLE)
  - Owner-only emergency functions
  - Arbitrator verification
  - Dispute party validation

### Known Limitations

1. **Simplified Random Selection**: Current arbitrator assignment uses basic randomness. Production should implement Chainlink VRF or similar verifiable randomness.

2. **Placeholder FHE**: Contract includes FHE placeholders for demonstration. Production requires actual Zama fhEVM integration with proper gateway configuration.

3. **Decryption Callback**: Simplified implementation of decision processing. Production needs proper FHE gateway integration and callback handling.

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
- Ensure all CI/CD checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: https://fhe-arbitration-platform.vercel.app/
- **GitHub Repository**: https://github.com/MakenzieRunolfsdottir/FHEArbitrationPlatform
- **Bounty Project**: https://github.com/MakenzieRunolfsdottir/fhevm-react-template
- **Etherscan Contract**: https://sepolia.etherscan.io/address/0x019487001FaCC26883f8760b72B0DAef2cbFa1bd
- **Documentation**: This README and included guides

## 📞 Support

For questions, issues, or suggestions:

- Open an issue on GitHub
- Review documentation
- Check existing discussions
- Contact via GitHub profile

## 🎯 Roadmap

### Phase 1: Core Platform (Completed ✅)
- ✅ Basic dispute creation and management
- ✅ Arbitrator registration system
- ✅ Reputation tracking
- ✅ Hardhat development framework
- ✅ Comprehensive testing (78+ tests)
- ✅ CI/CD pipeline with security checks
- ✅ Gas optimization (800 runs, viaIR)
- ✅ **Next.js frontend application with FHEVM SDK**
- ✅ **Tailwind CSS responsive UI design**
- ✅ **MetaMask wallet integration**
- ✅ **TypeScript full-stack implementation**

### Phase 2: FHE Integration (In Progress 🔄)
- ✅ **FHEVM SDK integration (@fhevm/sdk)**
- ✅ **FhevmProvider React context pattern**
- ✅ **Encrypted input builder with fluent API**
- 🔄 Zama fhEVM production integration
- 🔄 Production-grade encryption
- 🔄 Gateway callback implementation
- 🔄 Enhanced privacy features

### Phase 3: Frontend Enhancement (In Progress 🔄)
- ✅ **Next.js 14 with App Router and Pages Router**
- ✅ **Component-based architecture (WalletConnect, DisputeForm, DisputeList)**
- ✅ **Real-time UI updates and status tracking**
- 🔄 Enhanced UX with loading states and error handling
- 📋 Admin dashboard for platform management
- 📋 Arbitrator analytics and performance metrics
- 📋 Mobile-optimized responsive design
- 📋 PWA (Progressive Web App) support

### Phase 4: Advanced Features (Planned 📋)
- 📋 Chainlink VRF for random selection
- 📋 Multi-token support for stakes
- 📋 Appeal mechanism
- 📋 Arbitrator training system
- 📋 Advanced reputation algorithms
- 📋 Multi-language support (i18n)
- 📋 Dark mode theme toggle

### Phase 5: Production Launch (Planned 📋)
- 📋 Security audit by reputable firm
- 📋 Mainnet deployment
- 📋 Mobile application (React Native)
- 📋 API for third-party integrations
- 📋 GraphQL API for complex queries
- 📋 WebSocket for real-time notifications

---

**Built with privacy, powered by encryption, secured by blockchain.**

**Enabling fair and anonymous dispute resolution through Fully Homomorphic Encryption.**

*© 2025 FHE Anonymous Arbitration Platform. All rights reserved.*

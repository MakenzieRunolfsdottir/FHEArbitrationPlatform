# Next.js Arbitration Platform - FHEVM SDK Showcase

This is a complete Next.js application demonstrating the FHEVM Universal SDK with an anonymous arbitration use case.

## Features

- 🔒 **Fully Encrypted Voting**: All votes encrypted using FHE
- 🎭 **Anonymous Disputes**: Privacy-preserving dispute resolution
- ⚡ **Real-time Updates**: Live dispute tracking
- 🎨 **Modern UI**: Built with Tailwind CSS
- 📱 **Responsive Design**: Works on all devices
- 🔗 **Wallet Integration**: MetaMask support

## Quick Start

### Prerequisites

- Node.js 18+
- MetaMask browser extension
- Sepolia testnet ETH

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Update .env.local with your configuration
# NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
nextjs-arbitration/
├── pages/
│   ├── _app.tsx          # App wrapper with FhevmProvider
│   └── index.tsx         # Main page
├── components/
│   ├── WalletConnect.tsx # Wallet connection UI
│   ├── DisputeForm.tsx   # Dispute submission form
│   └── DisputeList.tsx   # Active disputes list
├── styles/
│   └── globals.css       # Global styles
└── lib/                  # Utility functions
```

## FHEVM SDK Usage

### 1. Provider Setup

```typescript
// pages/_app.tsx
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

### 2. Using the Hook

```typescript
import { useFhevm } from '@fhevm/sdk';

function MyComponent() {
  const { init, createEncryptedInput, getContract } = useFhevm();

  // Initialize with wallet
  await init(provider, signer);

  // Encrypt input
  const encrypted = await createEncryptedInput(contractAddress, userAddress)
    .add8(voteValue)
    .encrypt();

  // Submit to contract
  const contract = getContract(contractAddress, abi);
  await contract.vote(disputeId, encrypted.handles[0], encrypted.inputProof);
}
```

### 3. Encryption Flow

```typescript
// Encrypt dispute category
const encrypted = await createEncryptedInput(contractAddress, userAddress)
  .add8(categoryValue)  // Add encrypted uint8
  .encrypt();

// Use in contract call
await contract.submitDispute(
  encrypted.handles[0],
  encrypted.inputProof
);
```

### 4. Decryption Flow

```typescript
import { useFhevm } from '@fhevm/sdk';

const { decrypt } = useFhevm();

// Decrypt result
const result = await decrypt({
  handle: encryptedHandle,
  contractAddress,
  userAddress,
  type: 'euint8'
});
```

## Key Components

### DisputeForm

Handles dispute submission with encrypted category values:
- Form validation
- Category encryption
- Transaction handling
- User feedback

### DisputeList

Displays active disputes and voting interface:
- Dispute listing
- Encrypted voting
- Status tracking
- Real-time updates

### WalletConnect

Manages wallet connection:
- MetaMask integration
- Connection status
- Account display
- FHEVM initialization

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_RPC_URL` | Ethereum RPC endpoint | Yes |
| `NEXT_PUBLIC_CHAIN_ID` | Network chain ID | Yes |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address | Yes |
| `NEXT_PUBLIC_GATEWAY_URL` | FHEVM gateway URL | No |
| `NEXT_PUBLIC_ACL_ADDRESS` | ACL contract address | No |

## Smart Contract Interface

```solidity
// Submit encrypted dispute
function submitDispute(
  bytes32 encryptedCategory,
  bytes calldata proof
) external returns (uint256);

// Vote on dispute
function vote(
  uint256 disputeId,
  bytes32 encryptedVote,
  bytes calldata proof
) external;

// Get dispute info
function getDispute(uint256 disputeId)
  external view returns (
    address submitter,
    uint256 timestamp,
    bool resolved
  );
```

## Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Other Platforms

This is a standard Next.js app and can be deployed to:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## Security Considerations

- All sensitive votes are encrypted with FHE
- EIP-712 signatures for user authentication
- No private keys stored in frontend
- Secure RPC communication
- Input validation

## Troubleshooting

### MetaMask not detected
- Ensure MetaMask extension is installed
- Check that you're using a supported browser

### Transaction fails
- Verify you have enough Sepolia ETH
- Check contract address is correct
- Ensure you're on Sepolia network

### FHEVM not initializing
- Check RPC URL is accessible
- Verify network configuration
- Check browser console for errors

## Learn More

- [FHEVM SDK Documentation](../../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zama FHEVM](https://docs.zama.ai/fhevm)

## License

MIT

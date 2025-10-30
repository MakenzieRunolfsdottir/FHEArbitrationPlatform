/**
 * Next.js App Component
 * Wraps the application with FHEVM Provider
 */

import type { AppProps } from 'next/app';
import { FhevmProvider } from '@fhevm/sdk';
import '@/styles/globals.css';

// FHEVM Configuration
const fhevmConfig = {
  network: {
    chainId: 11155111,
    name: 'sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia.publicnode.com'
  },
  gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL,
  aclAddress: process.env.NEXT_PUBLIC_ACL_ADDRESS,
  kmsVerifierAddress: process.env.NEXT_PUBLIC_KMS_VERIFIER_ADDRESS
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <FhevmProvider config={fhevmConfig}>
      <Component {...pageProps} />
    </FhevmProvider>
  );
}

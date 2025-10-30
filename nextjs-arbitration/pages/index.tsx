/**
 * Home Page - Anonymous Arbitration Platform Demo
 */

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useFhevm } from '@fhevm/sdk';
import Head from 'next/head';
import DisputeForm from '@/components/DisputeForm';
import DisputeList from '@/components/DisputeList';
import WalletConnect from '@/components/WalletConnect';

export default function Home() {
  const { client, init, isInitialized } = useFhevm();
  const [account, setAccount] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * Connect wallet and initialize FHEVM
   */
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this application');
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Initialize FHEVM client
      await init(provider, signer);

      setAccount(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect wallet
   */
  const disconnectWallet = () => {
    setAccount('');
  };

  return (
    <>
      <Head>
        <title>Anonymous Arbitration Platform - FHEVM SDK Demo</title>
        <meta name="description" content="Decentralized anonymous arbitration using FHEVM" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Anonymous Arbitration Platform
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Powered by FHEVM SDK - Privacy-Preserving Dispute Resolution
                </p>
              </div>

              <WalletConnect
                account={account}
                isConnecting={isConnecting}
                isInitialized={isInitialized}
                onConnect={connectWallet}
                onDisconnect={disconnectWallet}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!account ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-lg shadow-xl p-12 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-600 mb-8">
                  Connect your wallet to submit disputes, vote on arbitrations, and access
                  all platform features with end-to-end encryption.
                </p>

                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Platform Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        🔒 Fully Encrypted
                      </h4>
                      <p className="text-sm text-gray-600">
                        All votes and data encrypted with FHE
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        🎭 Anonymous Voting
                      </h4>
                      <p className="text-sm text-gray-600">
                        Vote without revealing your choice
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        ⚖️ Fair Arbitration
                      </h4>
                      <p className="text-sm text-gray-600">
                        Decentralized dispute resolution
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Dispute Submission Form */}
              <DisputeForm account={account} />

              {/* Active Disputes List */}
              <DisputeList account={account} />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p className="mb-2">
                Built with <span className="text-red-500">♥</span> using FHEVM Universal SDK
              </p>
              <p className="text-sm">
                Demonstrating framework-agnostic encrypted computation with Next.js
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

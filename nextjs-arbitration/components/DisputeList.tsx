/**
 * Dispute List Component
 * Displays active disputes and voting interface
 */

import { useState, useEffect } from 'react';
import { useFhevm } from '@fhevm/sdk';

interface DisputeListProps {
  account: string;
}

interface Dispute {
  id: number;
  title: string;
  status: 'pending' | 'voting' | 'resolved';
  votes: number;
  encrypted: boolean;
}

export default function DisputeList({ account }: DisputeListProps) {
  const { getContract, createEncryptedInput } = useFhevm();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [votingFor, setVotingFor] = useState<number | null>(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  const contractABI = [
    'function getDisputeCount() external view returns (uint256)',
    'function getDispute(uint256 disputeId) external view returns (tuple(address submitter, uint256 timestamp, bool resolved))',
    'function vote(uint256 disputeId, bytes32 encryptedVote, bytes calldata proof) external',
    'event VoteCast(uint256 indexed disputeId, address indexed voter)'
  ];

  useEffect(() => {
    loadDisputes();
  }, [account]);

  const loadDisputes = async () => {
    if (!contractAddress) {
      setIsLoading(false);
      return;
    }

    try {
      // Mock data for demonstration
      // In production, this would fetch from the contract
      const mockDisputes: Dispute[] = [
        {
          id: 1,
          title: 'Payment dispute for freelance work',
          status: 'voting',
          votes: 5,
          encrypted: true
        },
        {
          id: 2,
          title: 'Contract terms interpretation',
          status: 'pending',
          votes: 0,
          encrypted: true
        },
        {
          id: 3,
          title: 'Product quality complaint',
          status: 'resolved',
          votes: 12,
          encrypted: true
        }
      ];

      setDisputes(mockDisputes);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (disputeId: number, voteValue: number) => {
    if (!contractAddress) {
      alert('Contract address not configured');
      return;
    }

    setVotingFor(disputeId);

    try {
      // Encrypt the vote
      const encrypted = await createEncryptedInput(contractAddress, account)
        .add8(voteValue)
        .encrypt();

      // Get contract instance
      const contract = getContract(contractAddress, contractABI);

      // Submit encrypted vote
      const tx = await contract.vote(
        disputeId,
        encrypted.handles[0],
        encrypted.inputProof
      );

      console.log('Vote transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Vote confirmed:', receipt.hash);

      alert('Vote submitted successfully!');

      // Reload disputes
      await loadDisputes();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to submit vote');
    } finally {
      setVotingFor(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'voting':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-primary-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="ml-3 text-gray-600">Loading disputes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Disputes</h2>

      {disputes.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No disputes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by submitting a new dispute above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dispute.title}
                    </h3>
                    {dispute.encrypted && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        🔒 Encrypted
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Dispute #{dispute.id} • {dispute.votes} votes
                  </p>
                </div>

                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    dispute.status
                  )}`}
                >
                  {dispute.status}
                </span>
              </div>

              {dispute.status === 'voting' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700 mb-3">Cast your encrypted vote:</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVote(dispute.id, 1)}
                      disabled={votingFor === dispute.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {votingFor === dispute.id ? 'Voting...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleVote(dispute.id, 0)}
                      disabled={votingFor === dispute.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {votingFor === dispute.id ? 'Voting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              )}

              {dispute.status === 'resolved' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      ✓ This dispute has been resolved through arbitration
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

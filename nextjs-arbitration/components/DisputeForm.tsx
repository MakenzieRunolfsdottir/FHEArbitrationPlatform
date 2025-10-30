/**
 * Dispute Submission Form
 * Allows users to submit encrypted disputes
 */

import { useState } from 'react';
import { useFhevm } from '@fhevm/sdk';
import { ethers } from 'ethers';

interface DisputeFormProps {
  account: string;
}

export default function DisputeForm({ account }: DisputeFormProps) {
  const { createEncryptedInput, getContract } = useFhevm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '0'
  });

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
  const contractABI = [
    'function submitDispute(bytes32 encryptedCategory, bytes calldata proof) external returns (uint256)',
    'event DisputeSubmitted(uint256 indexed disputeId, address indexed submitter)'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contractAddress) {
      alert('Contract address not configured');
      return;
    }

    setIsSubmitting(true);

    try {
      // Encrypt the category value
      const encrypted = await createEncryptedInput(contractAddress, account)
        .add8(Number(formData.category))
        .encrypt();

      // Get contract instance
      const contract = getContract(contractAddress, contractABI);

      // Submit dispute with encrypted data
      const tx = await contract.submitDispute(
        encrypted.handles[0],
        encrypted.inputProof
      );

      console.log('Transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);

      alert('Dispute submitted successfully!');

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '0'
      });
    } catch (error) {
      console.error('Error submitting dispute:', error);
      alert('Failed to submit dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit New Dispute</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Dispute Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Brief description of the dispute"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Detailed description of the dispute and relevant context"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category (Encrypted) 🔒
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="0">General</option>
            <option value="1">Commercial</option>
            <option value="2">Personal</option>
            <option value="3">Technical</option>
            <option value="4">Legal</option>
          </select>
          <p className="mt-2 text-sm text-gray-500">
            This value will be encrypted using FHE before submission
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Privacy Notice</h3>
              <p className="mt-1 text-sm text-blue-700">
                Your dispute category will be encrypted using Fully Homomorphic Encryption.
                Arbitrators can vote without seeing individual votes.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !contractAddress}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Submitting...
            </span>
          ) : (
            'Submit Dispute'
          )}
        </button>
      </form>
    </div>
  );
}

/**
 * Wallet Connect Component
 * Displays wallet connection status and controls
 */

interface WalletConnectProps {
  account: string;
  isConnecting: boolean;
  isInitialized: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletConnect({
  account,
  isConnecting,
  isInitialized,
  onConnect,
  onDisconnect
}: WalletConnectProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (account) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-sm text-gray-600">
            {isInitialized ? 'FHEVM Ready' : 'Initializing...'}
          </span>
        </div>

        <div className="bg-gray-100 rounded-lg px-4 py-2">
          <p className="text-sm font-mono font-medium text-gray-900">
            {formatAddress(account)}
          </p>
        </div>

        <button
          onClick={onDisconnect}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

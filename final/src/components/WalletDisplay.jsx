import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, History } from 'lucide-react';
import walletService from '../services/walletService';

const WalletDisplay = () => {
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await walletService.getWallet();
      setWallet(data);
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setError(err.message || 'Failed to load wallet');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchWallet}
          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          Coin Wallet
        </h3>
        <button
          onClick={fetchWallet}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Balance */}
        <div>
          <p className="text-sm text-gray-600 mb-1">Current Balance</p>
          <p className="text-3xl font-bold text-gray-900">
            {wallet?.balance || 0} <span className="text-lg text-gray-500">coins</span>
          </p>
        </div>

        {/* Total Earned */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span>Total Earned: {wallet?.total_earned || 0} coins</span>
        </div>

        {/* Recent Transactions */}
        {wallet?.transactions && wallet.transactions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Transactions</h4>
            <div className="space-y-2 max-h-[140px] overflow-y-auto">
              {wallet.transactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {tx.doubt_id?.subject || 'Doubt solved'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.doubt_type} • Rating: {tx.rating}/5 • Avg: {tx.average_rating?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">+{tx.amount}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletDisplay;


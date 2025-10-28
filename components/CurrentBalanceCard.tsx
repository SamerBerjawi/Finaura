import React from 'react';
import { formatCurrency } from '../utils';
import Card from './Card';
import { Currency } from '../types';

interface CurrentBalanceCardProps {
  balance: number;
  currency: Currency;
  title?: string;
}

const CurrentBalanceCard: React.FC<CurrentBalanceCardProps> = ({ balance, currency, title = "Current Balance" }) => {
  return (
    <Card className="flex flex-col justify-between h-full bg-gradient-to-br from-blue-400 to-indigo-600 dark:from-blue-500 dark:to-indigo-700 text-white">
      <div>
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20">
            <span className="material-symbols-outlined text-3xl text-white">
              account_balance_wallet
            </span>
          </div>
          <div className="text-right">
            <h3 className="text-base font-medium text-white/80">{title}</h3>
            <p className="text-2xl font-semibold mt-1 text-white">{formatCurrency(balance, currency)}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs text-right mt-1 text-white/80">As of today</p>
      </div>
    </Card>
  );
};

export default CurrentBalanceCard;
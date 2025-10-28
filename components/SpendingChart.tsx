import React from 'react';
import { formatCurrency } from '../utils';
import Card from './Card';

interface NetBalanceCardProps {
  netBalance: number;
  totalIncome: number;
  duration: string;
}

const NetBalanceCard: React.FC<NetBalanceCardProps> = ({ netBalance, totalIncome, duration }) => {
  const cardClasses = 'bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 text-white';

  const progress = totalIncome > 0 ? Math.max(0, Math.min(100, (netBalance / totalIncome) * 100)) : 0;
  
  return (
    <Card className={`flex flex-col justify-between h-full ${cardClasses}`}>
      <div>
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20">
            <span className="material-symbols-outlined text-3xl text-white">
              scale
            </span>
          </div>
          <div className="text-right">
            <h3 className="text-base font-medium text-white/80">Net Balance</h3>
            <p className="text-2xl font-semibold mt-1">{formatCurrency(netBalance, 'EUR')}</p>
            <p className="text-sm font-medium mt-1 text-white/80">
                {duration} Period
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4">
         <div className="w-full bg-white/20 rounded-full h-2.5">
          <div
            className="bg-white h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-right mt-1 text-white/80">{progress.toFixed(0)}% of income remaining</p>
      </div>
    </Card>
  );
};

export default NetBalanceCard;

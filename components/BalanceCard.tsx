import React from 'react';
import { formatCurrency } from '../utils';
import Card from './Card';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface BalanceCardProps {
  title: string;
  amount: number;
  change?: string;
  changeType?: 'positive' | 'negative';
  sparklineData: { value: number }[];
}

const BalanceCard: React.FC<BalanceCardProps> = ({ title, amount, change, changeType, sparklineData }) => {
  const isPositive = changeType === 'positive';
  
  // Define gradient and text classes based on the type
  const cardClasses = isPositive
    ? 'bg-gradient-to-br from-emerald-400 to-teal-600 dark:from-emerald-500 dark:to-teal-700'
    : 'bg-gradient-to-br from-rose-400 to-red-600 dark:from-rose-500 dark:to-red-700';

  const textPrimary = 'text-white';
  const textSecondary = 'text-white/80';

  // The Card component's default gradient will be overridden by cardClasses.
  // The default text colors will be overridden by the text-white on the Card and the specific text classes inside.
  return (
    <Card className={`flex flex-col justify-between h-full ${cardClasses} text-white`}>
      <div>
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/20`}>
            <span className={`material-symbols-outlined text-3xl ${textPrimary}`}>
              {isPositive ? 'arrow_upward' : 'arrow_downward'}
            </span>
          </div>
          <div className="text-right">
            <h3 className={`text-base font-medium ${textSecondary}`}>{title}</h3>
            <p className={`text-2xl font-semibold mt-1 ${textPrimary}`}>{formatCurrency(amount, 'EUR')}</p>
            {change && (
              <p className={`text-sm font-medium mt-1 ${textSecondary}`}>
                {change}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="h-16 -mb-6 -mx-6 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <Line
              type="natural"
              dataKey="value"
              stroke="#FFFFFF"
              strokeOpacity={0.8}
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default BalanceCard;

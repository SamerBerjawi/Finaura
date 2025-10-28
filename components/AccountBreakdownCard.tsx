import React from 'react';
import Card from './Card';
import { formatCurrency } from '../utils';

interface BreakdownItem {
    name: string;
    value: number;
    color: string;
}

interface AccountBreakdownCardProps {
    title: string;
    totalValue: number;
    breakdownData: BreakdownItem[];
}

const AccountBreakdownCard: React.FC<AccountBreakdownCardProps> = ({ title, totalValue, breakdownData }) => {
    return (
        <Card>
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-4">{title} &middot; {formatCurrency(totalValue, 'EUR')}</h3>
            
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-neu-inset-light dark:shadow-neu-inset-dark">
                {breakdownData.map(item => {
                    const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                    return (
                        <div
                            key={item.name}
                            className="h-full"
                            style={{
                                width: `${percentage}%`,
                                backgroundColor: item.color,
                            }}
                            title={`${item.name}: ${percentage.toFixed(1)}%`}
                        />
                    );
                })}
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                {breakdownData.map(item => {
                    const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                    return (
                        <div key={item.name} className="flex items-center text-sm">
                            <div className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                            <span className="text-light-text dark:text-dark-text truncate">{item.name}</span>
                            <span className="ml-auto font-medium text-light-text-secondary dark:text-dark-text-secondary">{percentage.toFixed(1)}%</span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default AccountBreakdownCard;

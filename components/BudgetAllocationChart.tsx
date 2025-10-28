import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Budget, Category } from '../types';
import { formatCurrency } from '../utils';
import Card from './Card';

interface BudgetAllocationChartProps {
  budgets: Budget[];
  expenseCategories: Category[];
}

const BudgetAllocationChart: React.FC<BudgetAllocationChartProps> = ({ budgets, expenseCategories }) => {
  const chartData = budgets.map(budget => {
    const category = expenseCategories.find(c => c.name === budget.categoryName);
    return {
      name: budget.categoryName,
      value: budget.amount,
      color: category?.color || '#A0AEC0',
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-light-card dark:bg-dark-card p-3 rounded-lg shadow-lg border border-black/5 dark:border-white/5">
          <p className="font-semibold">{`${payload[0].name}`}</p>
          <p style={{ color: payload[0].payload.color }}>
            {`Budget: ${formatCurrency(payload[0].value, 'EUR')}`}
          </p>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {`(${(payload[0].percent * 100).toFixed(0)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-4">Budget Allocation</h3>
      {budgets.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary">
          <p>No budgets to display.</p>
        </div>
      ) : (
        <div className="flex-grow" style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default BudgetAllocationChart;

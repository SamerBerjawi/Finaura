import React, { useState, useMemo } from 'react';
import { Budget, Category, Transaction, Account } from '../types';
import { BTN_PRIMARY_STYLE, LIQUID_ACCOUNT_TYPES } from '../constants';
import Card from '../components/Card';
import { formatCurrency, convertToEur } from '../utils';
import BudgetProgressCard from '../components/BudgetProgressCard';
import BudgetModal from '../components/BudgetModal';

interface BudgetingProps {
  budgets: Budget[];
  transactions: Transaction[];
  expenseCategories: Category[];
  saveBudget: (budgetData: Omit<Budget, 'id'> & { id?: string }) => void;
  deleteBudget: (id: string) => void;
  accounts: Account[];
}

// Helper to find a parent category by a transaction's category name
const findParentCategory = (categoryName: string, categories: Category[]): Category | undefined => {
  for (const parent of categories) {
    if (parent.name === categoryName) return parent;
    if (parent.subCategories.some(sub => sub.name === categoryName)) return parent;
  }
  return undefined;
};

const Budgeting: React.FC<BudgetingProps> = ({ budgets, transactions, expenseCategories, saveBudget, deleteBudget, accounts }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleMonthChange = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const { totalBudgeted, totalSpent, spendingByCategory } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const liquidAccountIds = new Set(
      accounts.filter(acc => LIQUID_ACCOUNT_TYPES.includes(acc.type)).map(acc => acc.id)
    );

    const relevantTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= startDate && txDate <= endDate && t.type === 'expense' && !t.transferId && liquidAccountIds.has(t.accountId);
    });

    const spending: Record<string, number> = {};
    for (const tx of relevantTransactions) {
      const parentCategory = findParentCategory(tx.category, expenseCategories);
      if (parentCategory) {
        spending[parentCategory.name] = (spending[parentCategory.name] || 0) + Math.abs(convertToEur(tx.amount, tx.currency));
      }
    }
    
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = Object.values(spending).reduce((sum, amount) => sum + amount, 0);

    return { totalBudgeted, totalSpent, spendingByCategory: spending };
  }, [currentDate, transactions, budgets, expenseCategories, accounts]);

  const handleOpenModal = (budget?: Budget) => {
    setEditingBudget(budget || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const totalRemaining = totalBudgeted - totalSpent;
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const overallProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  let overallProgressBarColor = 'bg-primary-500';
  if (overallProgress > 100) overallProgressBarColor = 'bg-red-500';
  else if (overallProgress > 80) overallProgressBarColor = 'bg-yellow-500';

  return (
    <div className="space-y-8">
      {isModalOpen && (
        <BudgetModal 
          onClose={handleCloseModal}
          onSave={saveBudget}
          budgetToEdit={editingBudget}
          existingBudgets={budgets}
          expenseCategories={expenseCategories.filter(c => !c.parentId)} // Only allow parent categories for budgets
        />
      )}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Budgeting</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Track your spending against your monthly budgets.</p>
        </div>
        <button onClick={() => handleOpenModal()} className={BTN_PRIMARY_STYLE}>
          Create New Budget
        </button>
      </header>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"><span className="material-symbols-outlined">chevron_left</span></button>
          <h3 className="text-xl font-semibold text-center">{monthName}</h3>
          <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"><span className="material-symbols-outlined">chevron_right</span></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-base text-light-text-secondary dark:text-dark-text-secondary">Total Budgeted</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBudgeted, 'EUR')}</p>
          </div>
          <div>
            <p className="text-base text-light-text-secondary dark:text-dark-text-secondary">Total Spent</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSpent, 'EUR')}</p>
          </div>
          <div>
            <p className="text-base text-light-text-secondary dark:text-dark-text-secondary">Remaining</p>
            <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totalRemaining, 'EUR')}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary">Overall Progress</span>
            <span className="font-semibold text-light-text dark:text-dark-text">{overallProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-light-bg dark:bg-dark-bg rounded-full h-3 shadow-neu-inset-light dark:shadow-neu-inset-dark">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${overallProgressBarColor}`}
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            ></div>
          </div>
        </div>
      </Card>

      <h3 className="text-xl font-semibold text-light-text dark:text-dark-text">Category Breakdown</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map(budget => {
          const categoryDetails = expenseCategories.find(c => c.name === budget.categoryName);
          if (!categoryDetails) return null;

          return (
            <BudgetProgressCard 
              key={budget.id}
              category={categoryDetails}
              budgeted={budget.amount}
              spent={spendingByCategory[budget.categoryName] || 0}
              onEdit={() => handleOpenModal(budget)}
            />
          );
        })}
      </div>
       {budgets.length === 0 && (
         <Card>
            <div className="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
              <span className="material-symbols-outlined text-5xl mb-2">savings</span>
              <p className="font-semibold">No budgets created yet.</p>
              <p className="text-sm">Click "Create New Budget" to get started.</p>
            </div>
         </Card>
      )}
    </div>
  );
};

export default Budgeting;

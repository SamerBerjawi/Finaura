import React, { useState, useMemo } from 'react';
import { RecurringTransaction, Account, Category } from '../types';
import Card from '../components/Card';
import { BTN_PRIMARY_STYLE } from '../constants';
import { formatCurrency, convertToEur } from '../utils';
import RecurringTransactionModal from '../components/RecurringTransactionModal';

interface ScheduleProps {
    recurringTransactions: RecurringTransaction[];
    saveRecurringTransaction: (recurringData: Omit<RecurringTransaction, 'id'> & { id?: string }) => void;
    deleteRecurringTransaction: (id: string) => void;
    accounts: Account[];
    incomeCategories: Category[];
    expenseCategories: Category[];
}

const RecurringTransactionItem: React.FC<{
    item: RecurringTransaction;
    accountName: string;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ item, accountName, onEdit, onDelete }) => {
    const isIncome = item.type === 'income';
    const frequencyMap = {
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly'
    };
    
    const dueDate = new Date(item.nextDueDate);
    const day = dueDate.getUTCDate(); // Use UTC to avoid timezone shifts
    const month = dueDate.toLocaleString('default', { month: 'short' }).toUpperCase();

    return (
        <div className="flex items-center justify-between p-4 group">
            <div className="flex items-center gap-4">
                 <div className="flex-shrink-0 text-center bg-light-bg dark:bg-dark-bg rounded-lg p-2 w-16 shadow-sm">
                    <p className="text-xs font-semibold text-primary-500">{month}</p>
                    <p className="text-2xl font-bold text-light-text dark:text-dark-text">{day}</p>
                </div>
                <div>
                    <p className="font-semibold text-lg text-light-text dark:text-dark-text">{item.description}</p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {accountName} &bull; {frequencyMap[item.frequency]}
                        {item.dueDateOfMonth && (item.frequency === 'monthly' || item.frequency === 'yearly') ? ` on day ${item.dueDateOfMonth}` : ''}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <p className={`font-semibold text-base ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(convertToEur(item.amount, item.currency), 'EUR')}
                </p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button onClick={onEdit} className="text-light-text-secondary dark:text-dark-text-secondary p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                        <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button onClick={onDelete} className="text-red-500/80 p-2 rounded-full hover:bg-red-500/10">
                        <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const Schedule: React.FC<ScheduleProps> = ({ recurringTransactions, saveRecurringTransaction, deleteRecurringTransaction, accounts, incomeCategories, expenseCategories }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);

    const accountMap = React.useMemo(() => accounts.reduce((acc, current) => {
        acc[current.id] = current.name;
        return acc;
    }, {} as Record<string, string>), [accounts]);
    
    const { summary, groups } = useMemo(() => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const dateIn7Days = new Date(today);
        dateIn7Days.setDate(today.getDate() + 7);
        const dateIn30Days = new Date(today);
        dateIn30Days.setDate(today.getDate() + 30);

        let income30 = 0;
        let expense30 = 0;

        const next7Days: RecurringTransaction[] = [];
        const next30Days: RecurringTransaction[] = [];
        const later: RecurringTransaction[] = [];

        recurringTransactions
            .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
            .forEach(item => {
                const dueDate = new Date(item.nextDueDate);

                if (dueDate <= dateIn30Days) {
                    const amount = convertToEur(item.amount, item.currency);
                    if (item.type === 'income') income30 += amount;
                    else expense30 += amount;
                }

                if (dueDate <= dateIn7Days) {
                    next7Days.push(item);
                } else if (dueDate <= dateIn30Days) {
                    next30Days.push(item);
                } else {
                    later.push(item);
                }
            });

        return {
            summary: {
                income: income30,
                expenses: expense30,
                net: income30 - expense30,
            },
            groups: {
                next7Days,
                next30Days,
                later,
            }
        };
    }, [recurringTransactions]);


    const handleAddClick = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (item: RecurringTransaction) => {
        setEditingTransaction(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSaveAndClose = (data: Omit<RecurringTransaction, 'id'> & { id?: string }) => {
        saveRecurringTransaction(data);
        handleCloseModal();
    };
    
    const renderGroup = (title: string, items: RecurringTransaction[]) => {
        if (items.length === 0) return null;
        
        return (
            <div key={title}>
                <h3 className="text-xl font-semibold mb-2 text-light-text dark:text-dark-text">{title}</h3>
                <Card>
                    <div className="divide-y divide-black/5 dark:divide-white/5 -m-4">
                        {items.map(item => (
                            <RecurringTransactionItem
                                key={item.id}
                                item={item}
                                accountName={accountMap[item.accountId] || 'Unknown Account'}
                                onEdit={() => handleEditClick(item)}
                                onDelete={() => deleteRecurringTransaction(item.id)}
                            />
                        ))}
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {isModalOpen && (
                <RecurringTransactionModal 
                    onClose={handleCloseModal}
                    onSave={handleSaveAndClose}
                    accounts={accounts}
                    incomeCategories={incomeCategories}
                    expenseCategories={expenseCategories}
                    recurringTransactionToEdit={editingTransaction}
                />
            )}
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Scheduled Transactions</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Manage your recurring payments and income.</p>
                </div>
                <button onClick={handleAddClick} className={BTN_PRIMARY_STYLE}>
                    Add Recurring
                </button>
            </header>

            <Card>
                <h3 className="text-xl font-semibold mb-4">Next 30 Days Forecast</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-base text-green-500">Income</p>
                        <p className="text-2xl font-bold">{formatCurrency(summary.income, 'EUR')}</p>
                    </div>
                    <div>
                        <p className="text-base text-red-500">Expenses</p>
                        <p className="text-2xl font-bold">{formatCurrency(summary.expenses, 'EUR')}</p>
                    </div>
                     <div>
                        <p className="text-base text-light-text-secondary dark:text-dark-text-secondary">Net Cash Flow</p>
                        <p className={`text-2xl font-bold ${summary.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(summary.net, 'EUR')}
                        </p>
                    </div>
                </div>
            </Card>
            
            <div className="space-y-6">
                 {renderGroup('Next 7 Days', groups.next7Days)}
                 {renderGroup('Next 30 Days', groups.next30Days)}
                 {renderGroup('Later', groups.later)}
                 
                 {recurringTransactions.length === 0 && (
                     <Card>
                        <div className="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
                            <span className="material-symbols-outlined text-5xl mb-2">event_repeat</span>
                            <p className="font-semibold">You have no scheduled transactions.</p>
                            <p className="text-sm">Click "Add Recurring" to set one up.</p>
                        </div>
                     </Card>
                 )}
            </div>
        </div>
    );
};

export default Schedule;
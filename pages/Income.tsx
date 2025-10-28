import React, { useState, useMemo } from 'react';
import { INPUT_BASE_STYLE, SELECT_WRAPPER_STYLE, SELECT_ARROW_STYLE, BTN_PRIMARY_STYLE, BTN_SECONDARY_STYLE } from '../constants';
import { Transaction, Category, Account } from '../types';
import Card from '../components/Card';
import { formatCurrency, fuzzySearch, convertToEur } from '../utils';
import AddTransactionModal from '../components/AddTransactionModal';
import BulkCategorizeModal from '../components/BulkCategorizeModal';
import Modal from '../components/Modal';

// Props will be similar to Transactions.tsx
interface IncomeProps {
  transactions: Transaction[];
  saveTransaction: (transactions: (Omit<Transaction, 'id'> & { id?: string })[], idsToDelete?: string[]) => void;
  deleteTransactions: (transactionIds: string[]) => void;
  accounts: Account[];
  incomeCategories: Category[];
  expenseCategories: Category[];
}

// Transaction row needs account name
interface DisplayTransaction extends Transaction {
    accountName?: string;
}

const findCategory = (name: string, categories: Category[]): Category | undefined => {
    for (const cat of categories) {
        if (cat.name === name) return cat;
        if (cat.subCategories.length > 0) {
            const found = findCategory(name, cat.subCategories);
            if (found) return found;
        }
    }
    return undefined;
};


const Income: React.FC<IncomeProps> = ({ transactions, saveTransaction, deleteTransactions, accounts, incomeCategories, expenseCategories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [accountFilter, setAccountFilter] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCategorizeModalOpen, setIsCategorizeModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const accountMap = useMemo(() => 
    accounts.reduce((acc, current) => {
      acc[current.id] = current.name;
      return acc;
    }, {} as { [key: string]: string }), 
  [accounts]);

  const incomeTransactions = useMemo(() => {
      return transactions
        .filter(t => t.type === 'income')
        .map(t => ({...t, accountName: accountMap[t.accountId]}));
  }, [transactions, accountMap]);

  const filteredTransactions = useMemo(() => {
    const startDateTime = startDate ? new Date(startDate) : null;
    if (startDateTime) startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = endDate ? new Date(endDate) : null;
    if (endDateTime) endDateTime.setHours(23, 59, 59, 999);
    
    const transactionList = incomeTransactions.filter(tx => {
        const matchAccount = !accountFilter || tx.accountName === accountFilter;
        
        const matchSearch = (
            fuzzySearch(searchTerm, tx.description) ||
            fuzzySearch(searchTerm, tx.merchant || '') ||
            fuzzySearch(searchTerm, tx.category) ||
            fuzzySearch(searchTerm, tx.accountName || '')
        );
        
        const txDateTime = new Date(tx.date).getTime();
        const matchStartDate = !startDateTime || txDateTime >= startDateTime.getTime();
        const matchEndDate = !endDateTime || txDateTime <= endDateTime.getTime();

        return matchAccount && matchSearch && matchStartDate && matchEndDate;
      });
    
    return transactionList.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'date-desc':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  }, [searchTerm, accountFilter, sortBy, startDate, endDate, incomeTransactions]);
  
  const isAllSelected = useMemo(() => {
      if (filteredTransactions.length === 0) return false;
      return filteredTransactions.every(tx => selectedIds.has(tx.id));
  }, [filteredTransactions, selectedIds]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        const allIds = new Set(filteredTransactions.map(tx => tx.id));
        setSelectedIds(allIds);
    } else {
        setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (transactionId: string) => {
      const newSelection = new Set(selectedIds);
      if (newSelection.has(transactionId)) {
          newSelection.delete(transactionId);
      } else {
          newSelection.add(transactionId);
      }
      setSelectedIds(newSelection);
  };
  
  const handleOpenCategorizeModal = () => {
    setIsCategorizeModalOpen(true);
  };

  const handleSaveBulkCategory = (newCategoryName: string) => {
      const transactionUpdates: (Omit<Transaction, 'id'> & { id: string })[] = [];
      const selectedRegularTxIds = Array.from(selectedIds);

      const categoryDetails = findCategory(newCategoryName, incomeCategories);
      if (!categoryDetails) {
          console.error("Could not find details for new category:", newCategoryName);
          setIsCategorizeModalOpen(false);
          setSelectedIds(new Set());
          return;
      }

      for (const txId of selectedRegularTxIds) {
          const originalTx = transactions.find(t => t.id === txId);
          if (originalTx) {
              transactionUpdates.push({ 
                  ...originalTx, 
                  category: newCategoryName,
              });
          }
      }
      
      if (transactionUpdates.length > 0) {
          saveTransaction(transactionUpdates);
      }
      
      setIsCategorizeModalOpen(false);
      setSelectedIds(new Set());
  };
  
  const handleOpenDeleteModal = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    const idsToDelete: string[] = Array.from(selectedIds);
    if (idsToDelete.length > 0) {
        deleteTransactions(idsToDelete);
    }
    
    setIsDeleteConfirmOpen(false);
    setSelectedIds(new Set());
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setTransactionModalOpen(true);
  };

  const handleOpenEditModal = (transaction: DisplayTransaction) => {
    const originalTransaction = transactions.find(t => t.id === transaction.id);
    if (originalTransaction) {
        setEditingTransaction(originalTransaction);
        setTransactionModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setTransactionModalOpen(false);
    setEditingTransaction(null);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  
  const labelStyle = "block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1";
  
  return (
    <div className="space-y-8">
      {isTransactionModalOpen && (
        <AddTransactionModal 
          onClose={handleCloseModal}
          onSave={(toSave, toDelete) => {
            saveTransaction(toSave, toDelete);
            handleCloseModal();
          }}
          accounts={accounts}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          transactionToEdit={editingTransaction}
          transactions={transactions}
          initialType="income"
        />
      )}
      {isCategorizeModalOpen && (
          <BulkCategorizeModal
              onClose={() => setIsCategorizeModalOpen(false)}
              onSave={handleSaveBulkCategory}
              incomeCategories={incomeCategories}
              expenseCategories={[]} // Only allow changing to other income categories
          />
      )}
      {isDeleteConfirmOpen && (
          <Modal onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Are you sure you want to delete {selectedIds.size} transaction(s)? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4 pt-6">
                  <button type="button" onClick={() => setIsDeleteConfirmOpen(false)} className={BTN_SECONDARY_STYLE}>
                      Cancel
                  </button>
                  <button type="button" onClick={handleConfirmBulkDelete} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-card hover:bg-red-600 transition-all duration-200">
                      Delete
                  </button>
              </div>
          </Modal>
      )}
      <header className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Income</h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">View and manage all your income.</p>
        </div>
        <button onClick={handleOpenAddModal} className={BTN_PRIMARY_STYLE}>
            Add Income
        </button>
      </header>

      <Card>
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search-input" className={labelStyle}>Search</label>
                <input
                    id="search-input"
                    type="text"
                    placeholder="Description, category, account..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={INPUT_BASE_STYLE}
                />
              </div>
              <div>
                 <label htmlFor="account-filter" className={labelStyle}>Account</label>
                 <div className={SELECT_WRAPPER_STYLE}>
                    <select
                      id="account-filter"
                      value={accountFilter || ''}
                      onChange={(e) => setAccountFilter(e.target.value || null)}
                      className={INPUT_BASE_STYLE}
                    >
                      <option value="">All Accounts</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.name}>{acc.name}</option>
                      ))}
                    </select>
                    <div className={SELECT_ARROW_STYLE}>
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </div>
              </div>
              <div>
                <label htmlFor="sort-by" className={labelStyle}>Sort By</label>
                <div className={SELECT_WRAPPER_STYLE}>
                    <select
                      id="sort-by"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={INPUT_BASE_STYLE}
                    >
                      <option value="date-desc">Date (Newest)</option>
                      <option value="date-asc">Date (Oldest)</option>
                      <option value="amount-desc">Amount (High-Low)</option>
                      <option value="amount-asc">Amount (Low-High)</option>
                    </select>
                    <div className={SELECT_ARROW_STYLE}>
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start-date" className={labelStyle}>From</label>
                    <input
                        id="start-date"
                        type="text"
                        onFocus={(e) => e.target.type = 'date'}
                        onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                        placeholder="From Date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className={INPUT_BASE_STYLE}
                    />
                </div>
                <div>
                    <label htmlFor="end-date" className={labelStyle}>To</label>
                    <input
                        id="end-date"
                        type="text"
                        onFocus={(e) => e.target.type = 'date'}
                        onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                        placeholder="To Date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className={INPUT_BASE_STYLE}
                    />
                </div>
            </div>
        </div>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="p-4">
                  <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary-500 bg-transparent border-gray-400 focus:ring-primary-500"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      aria-label="Select all transactions"
                  />
                </th>
                <th className="p-4 text-sm uppercase font-semibold text-light-text-secondary dark:text-dark-text-secondary">Date</th>
                <th className="p-4 text-sm uppercase font-semibold text-light-text-secondary dark:text-dark-text-secondary">Account</th>
                <th className="p-4 text-sm uppercase font-semibold text-light-text-secondary dark:text-dark-text-secondary">Merchant</th>
                <th className="p-4 text-sm uppercase font-semibold text-light-text-secondary dark:text-dark-text-secondary">Category</th>
                <th className="p-4 text-sm uppercase font-semibold text-light-text-secondary dark:text-dark-text-secondary">Description</th>
                <th className="p-4 text-sm uppercase font-semibold text-light-text-secondary dark:text-dark-text-secondary text-right">Amount</th>
                <th className="p-4 text-sm uppercase font-semibold text-light-text-secondary dark:text-dark-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => {
                const category = findCategory(tx.category, incomeCategories);
                const categoryColor = category?.color || '#A0AEC0';
                
                return (
                <tr key={tx.id} className="border-b border-black/5 dark:border-white/5 last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 group">
                  <td className="p-4">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-primary-500 bg-transparent border-gray-400 focus:ring-primary-500"
                        checked={selectedIds.has(tx.id)}
                        onChange={() => handleSelectOne(tx.id)}
                        aria-label={`Select transaction ${tx.description}`}
                    />
                  </td>
                  <td className="p-4 text-base text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">{formatDate(tx.date)}</td>
                  <td className="p-4 text-base text-light-text dark:text-dark-text">{tx.accountName}</td>
                  <td className="p-4 text-base text-light-text dark:text-dark-text">{tx.merchant || '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: categoryColor }}></div>
                        <p className="font-medium text-base text-light-text dark:text-dark-text">{tx.category}</p>
                    </div>
                  </td>
                  <td className="p-4 text-base text-light-text-secondary dark:text-dark-text-secondary">{tx.description}</td>
                  <td className={`p-4 font-semibold text-right whitespace-nowrap text-base text-green-500`}>
                    {formatCurrency(convertToEur(tx.amount, tx.currency), 'EUR')}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleOpenEditModal(tx)} className="text-light-text-secondary dark:text-dark-text-secondary p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
            <p>No income transactions found for the selected filters.</p>
          </div>
        )}
        {selectedIds.size > 0 && (
            <div className="sticky bottom-4 inset-x-4 mx-auto max-w-xl z-20">
                <div className="bg-light-card dark:bg-dark-card p-3 rounded-xl shadow-lg border border-black/10 dark:border-white/10 flex items-center justify-between">
                    <p className="font-semibold">{selectedIds.size} selected</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleOpenCategorizeModal}
                            className="flex items-center gap-1 p-2 rounded-lg text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
                            title="Categorize"
                        >
                            <span className="material-symbols-outlined text-base">sell</span>
                            Categorize
                        </button>
                         <button
                            onClick={handleOpenDeleteModal}
                            className="flex items-center gap-1 p-2 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-500/10"
                        >
                            <span className="material-symbols-outlined text-base">delete</span>
                            Delete
                        </button>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5"
                            title="Clear selection"
                        >
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                    </div>
                </div>
            </div>
        )}
      </Card>
    </div>
  );
};

export default Income;
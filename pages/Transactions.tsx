
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { INPUT_BASE_STYLE, SELECT_WRAPPER_STYLE, SELECT_ARROW_STYLE, BTN_PRIMARY_STYLE, BTN_SECONDARY_STYLE, SELECT_STYLE } from '../constants';
import { Transaction, Category, Account, DisplayTransaction, Tag } from '../types';
import Card from '../components/Card';
import { formatCurrency, fuzzySearch, convertToEur, arrayToCSV, downloadCSV } from '../utils';
import AddTransactionModal from '../components/AddTransactionModal';
import BulkCategorizeModal from '../components/BulkCategorizeModal';
import BulkEditTransactionsModal from '../components/BulkEditTransactionsModal';
import Modal from '../components/Modal';

interface TransactionsProps {
  transactions: Transaction[];
  saveTransaction: (transactions: (Omit<Transaction, 'id'> & { id?: string })[], idsToDelete?: string[]) => void;
  deleteTransactions: (transactionIds: string[]) => void;
  accounts: Account[];
  accountFilter: string | null;
  setAccountFilter: (accountName: string | null) => void;
  incomeCategories: Category[];
  expenseCategories: Category[];
  tags: Tag[];
  tagFilter: string | null;
  setTagFilter: (tagId: string | null) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, saveTransaction, deleteTransactions, accounts, accountFilter, setAccountFilter, incomeCategories, expenseCategories, tags, tagFilter, setTagFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCategorizeModalOpen, setIsCategorizeModalOpen] = useState(false);
  const [isBulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            searchInputRef.current?.focus();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const allCategories = useMemo(() => [...incomeCategories, ...expenseCategories], [incomeCategories, expenseCategories]);

  const getCategoryDetails = (name: string, categories: Category[]): { icon?: string; color?: string } => {
    for (const cat of categories) {
        if (cat.name === name) return { icon: cat.icon, color: cat.color };
        if (cat.subCategories.length > 0) {
            const found = getCategoryDetails(name, cat.subCategories);
            if (found.icon) return found;
        }
    }
    return {};
  };

  const accountMap = useMemo(() => 
    accounts.reduce((acc, current) => {
      acc[current.id] = current.name;
      return acc;
    }, {} as { [key: string]: string }), 
  [accounts]);

  const displayTransactions = useMemo(() => {
    const processedTransferIds = new Set<string>();
    const result: DisplayTransaction[] = [];
    
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const tx of sortedTransactions) {
        if (tx.transferId) {
            if (processedTransferIds.has(tx.transferId)) continue;
            
            const pair = sortedTransactions.find(t => t.transferId === tx.transferId && t.id !== tx.id);
            processedTransferIds.add(tx.transferId);

            if (pair) {
                const expensePart = tx.amount < 0 ? tx : pair;
                const incomePart = tx.amount > 0 ? tx : pair;
                result.push({
                    ...expensePart,
                    id: `transfer-${expensePart.transferId}`,
                    originalId: expensePart.id,
                    amount: Math.abs(expensePart.amount),
                    isTransfer: true,
                    type: 'expense',
                    fromAccountName: accountMap[expensePart.accountId],
                    toAccountName: accountMap[incomePart.accountId],
                    category: 'Transfer',
                    description: 'Account Transfer'
                });
            } else {
                result.push({ ...tx, accountName: accountMap[tx.accountId] });
            }
        } else {
            result.push({ ...tx, accountName: accountMap[tx.accountId] });
        }
    }
    return result;
  }, [transactions, accountMap]);


  const filteredTransactions = useMemo(() => {
    const startDateTime = startDate ? new Date(startDate) : null;
    if (startDateTime) startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = endDate ? new Date(endDate) : null;
    if (endDateTime) endDateTime.setHours(23, 59, 59, 999);
    
    const transactionList = displayTransactions.filter(tx => {
        const matchAccount = !accountFilter || (tx.isTransfer ? tx.fromAccountName === accountFilter || tx.toAccountName === accountFilter : tx.accountName === accountFilter);
        
        const matchSearch = (
            !searchTerm ||
            fuzzySearch(searchTerm, tx.description) ||
            fuzzySearch(searchTerm, tx.category) ||
            fuzzySearch(searchTerm, tx.accountName || '') ||
            fuzzySearch(searchTerm, tx.fromAccountName || '') ||
            fuzzySearch(searchTerm, tx.toAccountName || '') ||
            fuzzySearch(searchTerm, tx.merchant || '')
        );

        let matchType = true;
        if (typeFilter === 'expense') {
            matchType = !tx.isTransfer && tx.type === 'expense';
        } else if (typeFilter === 'income') {
            matchType = !tx.isTransfer && tx.type === 'income';
        } else if (typeFilter === 'transfer') {
            matchType = !!tx.isTransfer;
        }
        
        const txDateTime = new Date(tx.date.replace(/-/g, '/')).getTime();
        const matchStartDate = !startDateTime || txDateTime >= startDateTime.getTime();
        const matchEndDate = !endDateTime || txDateTime <= endDateTime.getTime();

        const matchTag = !tagFilter || (tx.tagIds && tx.tagIds.includes(tagFilter));

        return matchAccount && matchTag && matchSearch && matchType && matchStartDate && matchEndDate;
      });
    
    return transactionList.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date.replace(/-/g, '/')).getTime() - new Date(b.date.replace(/-/g, '/')).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'date-desc':
        default:
          return new Date(b.date.replace(/-/g, '/')).getTime() - new Date(a.date.replace(/-/g, '/')).getTime();
      }
    });

  }, [searchTerm, accountFilter, sortBy, typeFilter, startDate, endDate, displayTransactions, tagFilter]);
  
    const groupedTransactions = useMemo(() => {
        const groups: Record<string, { transactions: DisplayTransaction[]; total: number }> = {};

        filteredTransactions.forEach(tx => {
            const date = tx.date;
            if (!groups[date]) {
                groups[date] = { transactions: [], total: 0 };
            }
            groups[date].transactions.push(tx);
        });

        for (const date in groups) {
            let dailyTotal = 0;
            groups[date].transactions.forEach(tx => {
                let amount = tx.amount;
                let currency = tx.currency;

                if (tx.isTransfer) {
                    if (accountFilter) {
                        const fromAccount = accounts.find(a => a.name === tx.fromAccountName);
                        const toAccount = accounts.find(a => a.name === tx.toAccountName);

                        if (accountFilter === tx.fromAccountName) {
                            amount = -tx.amount;
                            if (fromAccount) currency = fromAccount.currency;
                        } else if (accountFilter === tx.toAccountName) {
                            amount = tx.amount;
                            if (toAccount) currency = toAccount.currency;
                        } else {
                            amount = 0;
                        }
                    } else {
                        amount = 0;
                    }
                }
                dailyTotal += convertToEur(amount, currency);
            });
            groups[date].total = dailyTotal;
        }

        return groups;
    }, [filteredTransactions, accountFilter, accounts]);
  
  const containsTransfer = useMemo(() => {
    return Array.from(selectedIds).some((id: string) => id.startsWith('transfer-'));
  }, [selectedIds]);

  const isAllSelected = useMemo(() => {
      if (filteredTransactions.length === 0) return false;
      return filteredTransactions.every(tx => selectedIds.has(tx.id));
  }, [filteredTransactions, selectedIds]);
  
    const selectedTransactions = useMemo(() => {
        const regularTxIds = Array.from(selectedIds).filter((id: string) => !id.startsWith('transfer-'));
        return transactions.filter(t => regularTxIds.includes(t.id));
    }, [selectedIds, transactions]);

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
    if (containsTransfer) return;
    setIsCategorizeModalOpen(true);
  };

  const handleSaveBulkCategory = (newCategoryName: string) => {
      const transactionUpdates: (Omit<Transaction, 'id'> & { id: string })[] = [];
      const selectedRegularTxIds = Array.from(selectedIds).filter((id: string) => !id.startsWith('transfer-'));

      const categoryDetails = getCategoryDetails(newCategoryName, allCategories);
      if (!categoryDetails) {
          console.error("Could not find details for new category:", newCategoryName);
          setIsCategorizeModalOpen(false);
          setSelectedIds(new Set());
          return;
      }
      
      const newType = allCategories.find(c => c.name === newCategoryName)?.classification || 'expense';

      for (const txId of selectedRegularTxIds) {
          const originalTx = transactions.find(t => t.id === txId);
          if (originalTx) {
              const newAmount = newType === 'income' ? Math.abs(originalTx.amount) : -Math.abs(originalTx.amount);
              transactionUpdates.push({ 
                  ...originalTx, 
                  category: newCategoryName,
                  type: newType,
                  amount: newAmount,
              });
          }
      }
      
      if (transactionUpdates.length > 0) {
          saveTransaction(transactionUpdates);
      }
      
      setIsCategorizeModalOpen(false);
      setSelectedIds(new Set());
  };
  
    const handleSaveBulkEdits = (updatedTransactions: Transaction[]) => {
        saveTransaction(updatedTransactions);
        setBulkEditModalOpen(false);
        setSelectedIds(new Set());
    };

  const handleOpenDeleteModal = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    const idsToDelete: string[] = [];
    selectedIds.forEach((id: string) => {
        if (id.startsWith('transfer-')) {
            const transferId = id.replace('transfer-', '');
            const pair = transactions.filter(t => t.transferId === transferId);
            pair.forEach(p => idsToDelete.push(p.id));
        } else {
            idsToDelete.push(id);
        }
    });

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
    const idToFind = transaction.isTransfer ? transaction.originalId : transaction.id;
    const originalTransaction = transactions.find(t => t.id === idToFind);
    if (originalTransaction) {
        setEditingTransaction(originalTransaction);
        setTransactionModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
        alert("No transactions to export.");
        return;
    }
    const dataForExport = filteredTransactions.map(tx => {
        const { id, originalId, accountId, transferId, recurringSourceId, importId, sureId, ...rest } = tx;
        return {
            date: rest.date,
            description: rest.description,
            merchant: rest.merchant,
            amount: rest.amount,
            currency: rest.currency,
            category: rest.category,
            type: rest.isTransfer ? 'transfer' : rest.type,
            account: rest.accountName || (rest.isTransfer ? `${rest.fromAccountName} -> ${rest.toAccountName}` : 'N/A'),
            tags: rest.tagIds?.map(tid => tags.find(t=>t.id === tid)?.name).join(' | ') || ''
        };
    });
    const csv = arrayToCSV(dataForExport);
    downloadCSV(csv, `crystal-transactions-${new Date().toISOString().split('T')[0]}.csv`);
  };
  
  const formatGroupDate = (dateString: string) => {
    const date = new Date(dateString.replace(/-/g, '/'));
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  }
  
  const labelStyle = "block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1";
  const newTypeFilterOptions: { label: string; value: 'all' | 'income' | 'expense' | 'transfer' }[] = [
    { label: 'All transactions', value: 'all' },
    { label: 'Expenses', value: 'expense' },
    { label: 'Income', value: 'income' },
    { label: 'Transfers', value: 'transfer' },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
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
          tags={tags}
        />
      )}
      {isCategorizeModalOpen && (
          <BulkCategorizeModal
              onClose={() => setIsCategorizeModalOpen(false)}
              onSave={handleSaveBulkCategory}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
          />
      )}
       {isBulkEditModalOpen && (
          <BulkEditTransactionsModal
            isOpen={isBulkEditModalOpen}
            onClose={() => setBulkEditModalOpen(false)}
            onSave={handleSaveBulkEdits}
            transactionsToEdit={selectedTransactions}
            accounts={accounts}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
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
                  <button type="button" onClick={handleConfirmBulkDelete} className="bg-semantic-red text-white font-semibold py-2 px-4 rounded-lg shadow-card hover:bg-red-600 transition-all duration-200">
                      Delete
                  </button>
              </div>
          </Modal>
      )}
      {isFiltersOpen && (
        <Modal onClose={() => setIsFiltersOpen(false)} title="Filters & Sort">
            <div className="space-y-4">
                <div>
                    <label htmlFor="account-filter" className={labelStyle}>Account</label>
                    <div className={SELECT_WRAPPER_STYLE}>
                        <select id="account-filter" value={accountFilter || ''} onChange={(e) => setAccountFilter(e.target.value || null)} className={INPUT_BASE_STYLE}>
                            <option value="">All Accounts</option>
                            {accounts.map(acc => (<option key={acc.id} value={acc.name}>{acc.name}</option>))}
                        </select>
                        <div className={SELECT_ARROW_STYLE}><span className="material-symbols-outlined">expand_more</span></div>
                    </div>
                </div>
                <div>
                    <label htmlFor="sort-by" className={labelStyle}>Sort By</label>
                    <div className={SELECT_WRAPPER_STYLE}>
                        <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={INPUT_BASE_STYLE}>
                            <option value="date-desc">Date (Newest)</option>
                            <option value="date-asc">Date (Oldest)</option>
                            <option value="amount-desc">Amount (High-Low)</option>
                            <option value="amount-asc">Amount (Low-High)</option>
                        </select>
                        <div className={SELECT_ARROW_STYLE}><span className="material-symbols-outlined">expand_more</span></div>
                    </div>
                </div>
            </div>
        </Modal>
      )}

      <header className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Transaction history</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">View your team's trades and transactions.</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handleExport} className={BTN_SECONDARY_STYLE}>
                <span className="material-symbols-outlined text-base">download</span>
                Export
            </button>
            <button onClick={handleOpenAddModal} className={`${BTN_PRIMARY_STYLE} bg-[#6D28D9] hover:bg-[#5B21B6]`}>
                <span className="material-symbols-outlined text-base">add</span>
                Add transaction
            </button>
        </div>
      </header>
      
      <div>
        <div className="border-b border-light-separator dark:border-dark-separator">
            <nav className="-mb-px flex space-x-6">
                {newTypeFilterOptions.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setTypeFilter(opt.value)}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                            typeFilter === opt.value
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </nav>
        </div>

        <div className="mt-6 flex justify-between items-center gap-4">
            <div className="relative flex-grow max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary pointer-events-none">search</span>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${INPUT_BASE_STYLE} pl-10 pr-12 h-11`}
                />
                <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                    <kbd className="inline-flex items-center rounded border border-gray-200 dark:border-gray-600 px-2 text-sm font-sans font-medium text-gray-400 dark:text-gray-500">
                        ⌘K
                    </kbd>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-light-separator dark:border-dark-separator h-11 px-3 bg-light-card dark:bg-dark-card">
                    <span className="material-symbols-outlined text-light-text-secondary dark:text-dark-text-secondary text-base">calendar_today</span>
                    <input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent focus:outline-none text-sm text-light-text dark:text-dark-text" placeholder="From"/>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">-</span>
                    <input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent focus:outline-none text-sm text-light-text dark:text-dark-text" placeholder="To"/>
                </div>
                <button onClick={() => setIsFiltersOpen(true)} className={`${BTN_SECONDARY_STYLE} h-11 flex items-center gap-2`}>
                    <span className="material-symbols-outlined text-base">filter_list</span>
                    Filters
                </button>
            </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 relative">
        <Card className="p-0 h-full flex flex-col">
            <div className="px-4 py-3 border-b border-light-separator dark:border-dark-separator flex items-center gap-4 text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0">
                <input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} className="w-4 h-4 rounded text-primary-500 bg-transparent border-gray-400 focus:ring-primary-500" aria-label="Select all transactions"/>
                <div className="grid grid-cols-[auto_minmax(0,1fr)_240px_140px_auto] items-center gap-x-4 w-full">
                    <div className="w-1.5 h-10"></div>
                    <span>Transaction</span>
                    <span className="text-left">Account</span>
                    <span className="text-right">Amount</span>
                    <span className="w-10"></span>
                </div>
            </div>
            <div className="overflow-y-auto flex-grow">
                 {Object.keys(groupedTransactions).length > 0 ? Object.entries(groupedTransactions).map(([date, group]) => {
                    const typedGroup = group as { transactions: DisplayTransaction[]; total: number };
                    return (
                    <div key={date}>
                        <div className="px-6 py-3 border-b border-t border-light-separator dark:border-dark-separator bg-light-bg dark:bg-dark-bg/50">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-base text-light-text dark:text-dark-text">{formatGroupDate(date)}</span>
                                <span className={`font-semibold text-base ${typedGroup.total > 0 ? 'text-semantic-green' : typedGroup.total < 0 ? 'text-semantic-red' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}>{formatCurrency(typedGroup.total, 'EUR', { showPlusSign: true })}</span>
                            </div>
                        </div>
                        <div className="divide-y divide-light-separator/50 dark:divide-dark-separator/50">
                            {typedGroup.transactions.map(tx => {
                                let amount = tx.amount;
                                let amountColor = tx.type === 'income' ? 'text-semantic-green' : 'text-semantic-red';

                                if (tx.isTransfer) {
                                    amountColor = 'text-light-text dark:text-dark-text';
                                    if (accountFilter) {
                                        if (accountFilter === tx.fromAccountName) { amount = -tx.amount; amountColor = 'text-semantic-red'; } 
                                        else if (accountFilter === tx.toAccountName) { amount = tx.amount; amountColor = 'text-semantic-green'; }
                                    }
                                }
                                
                                const categoryDetails = getCategoryDetails(tx.category, allCategories);
                                const categoryColor = tx.isTransfer ? '#64748B' : (categoryDetails.color || '#A0AEC0');
                                
                                return (
                                <div key={tx.id} className="grid grid-cols-[auto_minmax(0,1fr)_240px_140px_auto] items-center gap-x-4 group hover:bg-light-fill dark:hover:bg-dark-fill cursor-pointer" onClick={() => handleOpenEditModal(tx)}>
                                    <div className="flex items-center gap-3 px-4">
                                        <input type="checkbox" className="w-4 h-4 rounded text-primary-500 bg-transparent border-gray-400 focus:ring-primary-500" checked={selectedIds.has(tx.id)} onChange={(e) => { e.stopPropagation(); handleSelectOne(tx.id); }} onClick={e => e.stopPropagation()} aria-label={`Select transaction ${tx.description}`}/>
                                        <div className="w-1.5 h-10 flex-shrink-0 rounded-full" style={{backgroundColor: categoryColor}}></div>
                                    </div>
                                    <div className="py-3 min-w-0">
                                        <p className="font-semibold text-light-text dark:text-dark-text truncate">{tx.description}</p>
                                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">{tx.merchant}</p>
                                        {tx.tagIds && tx.tagIds.length > 0 && (<div className="flex flex-wrap gap-1 mt-1.5">{tx.tagIds.map(tagId => { const tag = tags.find(t => t.id === tagId); if (!tag) return null; return (<span key={tag.id} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${tag.color}30`, color: tag.color }}>{tag.name}</span>);})}</div>)}
                                    </div>
                                    <div className="text-sm text-left text-light-text-secondary dark:text-dark-text-secondary truncate">
                                        {tx.isTransfer ? ( <div className="flex items-center justify-start gap-1 truncate"><span className="truncate">{tx.fromAccountName}</span><span className="material-symbols-outlined text-base">arrow_forward</span><span className="truncate">{tx.toAccountName}</span></div>) : tx.accountName}
                                    </div>
                                    <div className={`font-mono font-semibold text-right text-base whitespace-nowrap ${amountColor}`}>
                                        {tx.isTransfer && !accountFilter ? '-/+ ' + formatCurrency(convertToEur(Math.abs(amount), tx.currency), 'EUR') : formatCurrency(convertToEur(amount, tx.currency), 'EUR', { showPlusSign: true })}
                                    </div>
                                    <div className="px-4 text-right">
                                        <button onClick={(e) => {e.stopPropagation(); handleOpenEditModal(tx)}} className="text-light-text-secondary dark:text-dark-text-secondary p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-base">edit</span></button>
                                    </div>
                                </div>
                                )})}
                        </div>
                    </div>
                    );
                }) : (
                    <div className="flex flex-col items-center justify-center h-full text-light-text-secondary dark:text-dark-text-secondary">
                        <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                        <p className="font-semibold text-lg">No Transactions Found</p>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </Card>
        {selectedIds.size > 0 && (
            <div className="absolute bottom-4 inset-x-4 mx-auto max-w-2xl z-20">
                <div className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-black/10 dark:border-white/10 flex items-center justify-between">
                    <p className="font-semibold">{selectedIds.size} selected</p>
                    <div className="flex items-center gap-2">
                        <button onClick={handleOpenCategorizeModal} disabled={containsTransfer} className="flex items-center gap-1 p-2 rounded-lg text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed" title={containsTransfer ? "Cannot categorize transfers" : "Categorize"}><span className="material-symbols-outlined text-base">sell</span>Categorize</button>
                        <button onClick={() => setBulkEditModalOpen(true)} disabled={containsTransfer} className="flex items-center gap-1 p-2 rounded-lg text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed" title={containsTransfer ? "Cannot bulk edit transfers" : "Edit"}><span className="material-symbols-outlined text-base">edit</span>Edit</button>
                        <button onClick={handleOpenDeleteModal} className="flex items-center gap-1 p-2 rounded-lg text-sm font-semibold text-semantic-red hover:bg-semantic-red/10"><span className="material-symbols-outlined text-base">delete</span>Delete</button>
                        <button onClick={() => setSelectedIds(new Set())} className="p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-black/5 dark:hover:bg-white/5" title="Clear selection"><span className="material-symbols-outlined text-base">close</span></button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;

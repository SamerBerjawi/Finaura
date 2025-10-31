import { useState, useMemo } from 'react';
import { Transaction, Account } from '../types';
import { convertToEur } from '../utils';
import { v4 as uuidv4 } from 'uuid';

export type Suggestion = {
  expenseTx: Transaction;
  incomeTx: Transaction;
  id: string; // [tx1.id, tx2.id].sort().join('|')
};

export const useTransactionMatcher = (
    transactions: Transaction[], 
    accounts: Account[], 
    saveTransaction: (transactionsToSave: (Omit<Transaction, 'id'> & { id?: string })[], idsToDelete?: string[]) => void
) => {
  const [ignoredSuggestionIds, setIgnoredSuggestionIds] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    const potentialMatches: Suggestion[] = [];
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    
    // Only consider recent transactions for performance and relevance
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const candidates = transactions.filter(tx => !tx.transferId && new Date(tx.date) >= twoWeeksAgo);
    
    const expenses = candidates.filter(tx => tx.type === 'expense');
    const incomes = candidates.filter(tx => tx.type === 'income');

    for (const expense of expenses) {
      for (const income of incomes) {
        // Basic checks
        if (expense.accountId === income.accountId) continue;

        const suggestionId = [expense.id, income.id].sort().join('|');
        if (potentialMatches.some(p => p.id === suggestionId) || ignoredSuggestionIds.includes(suggestionId)) continue;
        
        // Amount check (compare in EUR)
        const expenseAmount = Math.abs(convertToEur(expense.amount, expense.currency));
        const incomeAmount = convertToEur(income.amount, income.currency);
        const amountDifference = Math.abs(expenseAmount - incomeAmount);

        // Date check (within +/- 1 day)
        const expenseDate = new Date(expense.date);
        const incomeDate = new Date(income.date);
        const dateDifference = Math.abs(expenseDate.getTime() - incomeDate.getTime());

        if (amountDifference < 0.01 && dateDifference <= ONE_DAY_MS) {
          potentialMatches.push({
            expenseTx: expense,
            incomeTx: income,
            id: suggestionId,
          });
        }
      }
    }
    
    return potentialMatches;
  }, [transactions, ignoredSuggestionIds]);

  const confirmMatch = (suggestion: Suggestion) => {
    const transferId = `xfer-${uuidv4()}`;
    const fromAccount = accounts.find(a => a.id === suggestion.expenseTx.accountId);
    const toAccount = accounts.find(a => a.id === suggestion.incomeTx.accountId);

    const expenseUpdate = {
      ...suggestion.expenseTx,
      category: 'Transfer',
      transferId,
      description: `Transfer to ${toAccount?.name || 'account'}`
    };
    const incomeUpdate = {
      ...suggestion.incomeTx,
      category: 'Transfer',
      transferId,
      description: `Transfer from ${fromAccount?.name || 'account'}`
    };
    
    saveTransaction([expenseUpdate, incomeUpdate]);
    
    // The suggestion will disappear on next render because the transactions now have a transferId
    setIgnoredSuggestionIds(prev => [...prev, suggestion.id]);
  };

  const dismissSuggestion = (suggestion: Suggestion) => {
    setIgnoredSuggestionIds(prev => [...prev, suggestion.id]);
  };

  const confirmAllMatches = () => {
    const transactionsToUpdate: (Omit<Transaction, 'id'> & { id: string })[] = [];
    const suggestionIdsToIgnore: string[] = [];

    suggestions.forEach(suggestion => {
        const transferId = `xfer-${uuidv4()}`;
        const fromAccount = accounts.find(a => a.id === suggestion.expenseTx.accountId);
        const toAccount = accounts.find(a => a.id === suggestion.incomeTx.accountId);

        transactionsToUpdate.push({
            ...suggestion.expenseTx,
            category: 'Transfer',
            transferId,
            description: `Transfer to ${toAccount?.name || 'account'}`
        });
        transactionsToUpdate.push({
            ...suggestion.incomeTx,
            category: 'Transfer',
            transferId,
            description: `Transfer from ${fromAccount?.name || 'account'}`
        });
        suggestionIdsToIgnore.push(suggestion.id);
    });
    
    if (transactionsToUpdate.length > 0) {
        saveTransaction(transactionsToUpdate);
    }
    
    setIgnoredSuggestionIds(prev => [...prev, ...suggestionIdsToIgnore]);
  };

  const dismissAllSuggestions = () => {
    const suggestionIdsToIgnore = suggestions.map(s => s.id);
    setIgnoredSuggestionIds(prev => [...prev, ...suggestionIdsToIgnore]);
  };


  return { suggestions, confirmMatch, dismissSuggestion, confirmAllMatches, dismissAllSuggestions };
};
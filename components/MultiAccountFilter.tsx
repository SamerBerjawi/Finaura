import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Account } from '../types';
import { LIQUID_ACCOUNT_TYPES } from '../constants';

interface MultiAccountFilterProps {
  accounts: Account[];
  selectedAccountIds: string[];
  setSelectedAccountIds: (ids: string[]) => void;
}

const MultiAccountFilter: React.FC<MultiAccountFilterProps> = ({ accounts, selectedAccountIds, setSelectedAccountIds }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const { liquidAccounts, otherAccounts } = useMemo(() => {
    const liquid: Account[] = [];
    const other: Account[] = [];
    accounts.forEach(acc => {
      if (LIQUID_ACCOUNT_TYPES.includes(acc.type)) {
        liquid.push(acc);
      } else {
        other.push(acc);
      }
    });
    return { liquidAccounts: liquid, otherAccounts: other };
  }, [accounts]);

  const handleToggle = (accountId: string) => {
    if (selectedAccountIds.includes(accountId)) {
      setSelectedAccountIds(selectedAccountIds.filter(id => id !== accountId));
    } else {
      setSelectedAccountIds([...selectedAccountIds, accountId]);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAccountIds(accounts.map(a => a.id));
    } else {
      setSelectedAccountIds([]);
    }
  };
  
  const handleSelectAllLiquid = () => {
    setSelectedAccountIds(liquidAccounts.map(a => a.id));
  };


  const allSelected = accounts.length > 0 && selectedAccountIds.length === accounts.length;
  const buttonText = () => {
    if (selectedAccountIds.length === accounts.length) return "All Accounts";
    if (selectedAccountIds.length === 1) {
        const selectedAccount = accounts.find(a => a.id === selectedAccountIds[0]);
        return selectedAccount ? selectedAccount.name : "1 Account";
    }
    if (selectedAccountIds.length === 0) return "No Accounts";
    return `${selectedAccountIds.length} Accounts`;
  };

  const AccountCheckbox: React.FC<{ account: Account }> = ({ account }) => (
      <label key={account.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
          <input
              type="checkbox"
              checked={selectedAccountIds.includes(account.id)}
              onChange={() => handleToggle(account.id)}
              className="w-4 h-4 rounded text-primary-500 bg-transparent border-gray-400 focus:ring-primary-500"
          />
          <span className="text-sm">{account.name}</span>
      </label>
  );

  return (
    <div className="relative h-10" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-light-bg dark:bg-dark-bg text-sm font-semibold text-light-text dark:text-dark-text rounded-md pl-3 pr-2 border border-gray-200 dark:border-dark-border focus:outline-none focus:ring-1 focus:ring-primary-500 transition-shadow duration-200 h-full w-full"
      >
        <span className="truncate">{buttonText()}</span>
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-light-card dark:bg-dark-card rounded-lg shadow-lg border border-black/5 dark:border-white/10 z-10 p-2">
          <div className="max-h-80 overflow-y-auto space-y-1">
            <div className="flex items-center justify-between p-2">
              <label className="flex items-center gap-2 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-primary-500 bg-transparent border-gray-400 focus:ring-primary-500"
                />
                <span>Select All</span>
              </label>
              <button 
                onClick={handleSelectAllLiquid}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Select Liquid Only
              </button>
            </div>
            <hr className="border-black/10 dark:border-white/10 my-1" />
            
            {liquidAccounts.length > 0 && (
              <div>
                <h4 className="px-2 py-1 text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary uppercase">Liquid Accounts</h4>
                {liquidAccounts.map(account => <AccountCheckbox key={account.id} account={account} />)}
              </div>
            )}
            
            {otherAccounts.length > 0 && (
              <div className="mt-2">
                <h4 className="px-2 py-1 text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary uppercase">Other Assets & Liabilities</h4>
                {otherAccounts.map(account => <AccountCheckbox key={account.id} account={account} />)}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default MultiAccountFilter;
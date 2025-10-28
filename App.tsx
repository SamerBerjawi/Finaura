import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Budgeting from './pages/Budgeting';
import Forecasting from './pages/Forecasting';
import Settings from './pages/Settings';
import Schedule from './pages/Schedule';
import PaymentPlan from './pages/PaymentPlan';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import PersonalInfo from './pages/PersonalInfo';
import DataManagement from './pages/DataImportExport';
import Preferences from './pages/Preferences';
import EnableBankingSettingsPage from './pages/EnableBankingSettings';
import AccountDetail from './pages/AccountDetail';
import Investments from './pages/Investments';
import Tasks from './pages/Tasks';
import Warrants from './pages/Warrants';
import { Page, Theme, Category, User, Transaction, Account, RecurringTransaction, WeekendAdjustment, FinancialGoal, Budget, ImportExportHistoryItem, AppPreferences, RemoteAccount, AccountType, EnableBankingSettings, Backup, InvestmentTransaction, Task, Warrant, ScraperConfig } from './types';
import { MOCK_INCOME_CATEGORIES, MOCK_EXPENSE_CATEGORIES, MOCK_TRANSACTIONS, MOCK_ACCOUNTS, MOCK_RECURRING_TRANSACTIONS, MOCK_FINANCIAL_GOALS, MOCK_BUDGETS, MOCK_IMPORT_EXPORT_HISTORY, MOCK_INVESTMENT_TRANSACTIONS } from './constants';
import { v4 as uuidv4 } from 'uuid';
import EnableBankingConnectModal from './components/EnableBankingConnectModal';
import EnableBankingLinkAccountsModal from './components/EnableBankingLinkAccountsModal';
import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import ChatFab from './components/ChatFab';
import Chatbot from './components/Chatbot';
import { convertToEur, CONVERSION_RATES } from './utils';

const MOCK_ENABLE_BANKING_TRANSACTIONS: Record<string, Omit<Transaction, 'id' | 'accountId' | 'currency'>[]> = {
    'eb-acc-1': [
        { date: new Date().toISOString().split('T')[0], description: 'Netflix Subscription', merchant: 'Netflix', amount: -15.99, category: 'Streaming', type: 'expense' },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Amazon Purchase', merchant: 'Amazon', amount: -89.50, category: 'Shopping', type: 'expense' },
    ],
    'eb-acc-2': [
         { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], description: 'Interest Payment', merchant: 'ING', amount: 12.34, category: 'Income', type: 'income' },
    ],
    'manual-sync-eb-acc-1': [
        { date: new Date().toISOString().split('T')[0], description: 'Spotify', merchant: 'Spotify', amount: -9.99, category: 'Streaming', type: 'expense' },
    ]
};

const MOCK_TASKS: Task[] = [
    { id: 'task-1', title: 'Review quarterly budget', description: 'Go over Q2 expenses and adjust Q3 budget accordingly.', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'To Do', priority: 'High', reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { id: 'task-2', title: 'Call bank about credit card fee', description: '', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'To Do', priority: 'Medium' },
    { id: 'task-3', title: 'Research investment options', description: 'Look into new ETFs for the investment portfolio.', dueDate: '', status: 'In Progress', priority: 'Medium' },
    { id: 'task-4', title: 'Pay electricity bill', description: 'Due by the end of the month.', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'To Do', priority: 'High', reminderDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { id: 'task-5', title: 'File tax documents', description: 'Gather all necessary documents for annual tax filing.', status: 'Done', priority: 'Low', dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { id: 'task-6', title: 'Update personal info', description: 'Ensure address and contact details are up to date.', dueDate: '', status: 'To Do', priority: 'Low' },
];

const MOCK_WARRANTS: Warrant[] = [
    { id: 'warr-1', isin: 'NL0015001WR5', name: 'Prosus Warrants 2023 H2', grantDate: '2023-12-15', quantity: 100, grantPrice: 10.00 },
    { id: 'warr-2', isin: 'NL0015001WR5', name: 'Prosus Warrants 2024 H1', grantDate: '2024-06-15', quantity: 120, grantPrice: 10.00 },
    { id: 'warr-3', isin: 'BE0974344568', name: 'AB InBev Warrants 2024 H1', grantDate: '2024-05-20', quantity: 50, grantPrice: 10.00 },
];

const MOCK_SCRAPER_CONFIGS: ScraperConfig[] = [
    {
        id: 'NL0015001WR5',
        resource: {
            url: 'https://www.ariva.de/NL0015001WR5',
            method: 'GET',
            authType: 'none',
            verifySsl: true,
            timeout: 10,
            encoding: 'UTF-8',
        },
        options: {
            select: 'td.first',
            index: 1,
            attribute: '',
        }
    }
];

const getBankAccountsFunctionDeclaration: FunctionDeclaration = {
  name: 'get_bank_accounts',
  parameters: {
    type: Type.OBJECT,
    description: 'Gets a list of bank accounts from the connected institution.',
    properties: {
      accounts: {
        type: Type.ARRAY,
        description: 'A list of bank accounts.',
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: 'Unique account ID, prefixed with eb-acc-' },
            name: { type: Type.STRING, description: 'Account name or label' },
            balance: { type: Type.NUMBER, description: 'Current account balance' },
            currency: { type: Type.STRING, description: 'ISO currency code (e.g., EUR, USD)' },
            institution: { type: Type.STRING, description: 'The financial institution name' },
            type: { type: Type.STRING, description: 'The type of account (e.g., Checking, Savings)' },
            last4: { type: Type.STRING, description: 'The last 4 digits of the account number' },
          },
          required: ['id', 'name', 'balance', 'currency', 'institution', 'type', 'last4'],
        },
      },
    },
    required: ['accounts'],
  },
};

interface FinancialData {
    accounts: Account[];
    transactions: Transaction[];
    investmentTransactions: InvestmentTransaction[];
    recurringTransactions: RecurringTransaction[];
    financialGoals: FinancialGoal[];
    budgets: Budget[];
    tasks: Task[];
    warrants: Warrant[];
    scraperConfigs: ScraperConfig[];
    importExportHistory: ImportExportHistoryItem[];
    incomeCategories: Category[];
    expenseCategories: Category[];
    preferences: AppPreferences;
    enableBankingSettings: EnableBankingSettings;
    backups: Backup[];
}

const initialFinancialData: FinancialData = {
    accounts: [],
    transactions: [],
    investmentTransactions: [],
    recurringTransactions: [],
    financialGoals: [],
    budgets: [],
    tasks: [],
    warrants: [],
    scraperConfigs: [],
    importExportHistory: [],
    incomeCategories: MOCK_INCOME_CATEGORIES, // Keep default categories
    expenseCategories: MOCK_EXPENSE_CATEGORIES,
    preferences: {
        currency: 'EUR (€)',
        language: 'English (en)',
        timezone: '(+01:00) Brussels',
        dateFormat: 'DD/MM/YYYY',
        defaultPeriod: 'Current Year',
        defaultAccountOrder: 'Name (A-Z)',
        country: 'Belgium',
    },
    enableBankingSettings: {
        autoSyncEnabled: true,
        syncFrequency: 'daily',
    },
    backups: [],
};


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState<'signIn' | 'signUp'>('signIn');

  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accountFilter, setAccountFilter] = useState<string | null>(null);
  const [viewingAccountId, setViewingAccountId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || 'system'
  );
  
  const [user, setUser] = useState<User | null>(null);

  // All financial data states, initialized to be empty
  const [preferences, setPreferences] = useState<AppPreferences>(initialFinancialData.preferences);
  const [enableBankingSettings, setEnableBankingSettings] = useState<EnableBankingSettings>(initialFinancialData.enableBankingSettings);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(initialFinancialData.incomeCategories);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(initialFinancialData.expenseCategories);
  const [transactions, setTransactions] = useState<Transaction[]>(initialFinancialData.transactions);
  const [investmentTransactions, setInvestmentTransactions] = useState<InvestmentTransaction[]>(initialFinancialData.investmentTransactions);
  const [accounts, setAccounts] = useState<Account[]>(initialFinancialData.accounts);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>(initialFinancialData.recurringTransactions);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(initialFinancialData.financialGoals);
  const [budgets, setBudgets] = useState<Budget[]>(initialFinancialData.budgets);
  const [tasks, setTasks] = useState<Task[]>(initialFinancialData.tasks);
  const [warrants, setWarrants] = useState<Warrant[]>(initialFinancialData.warrants);
  const [scraperConfigs, setScraperConfigs] = useState<ScraperConfig[]>(initialFinancialData.scraperConfigs);
  const [importExportHistory, setImportExportHistory] = useState<ImportExportHistoryItem[]>(initialFinancialData.importExportHistory);
  
  // State for Bank Sync Flow
  const [isConnectModalOpen, setConnectModalOpen] = useState(false);
  const [isLinkModalOpen, setLinkModalOpen] = useState(false);
  const [isConnectingToBank, setIsConnectingToBank] = useState(false);
  const [remoteAccounts, setRemoteAccounts] = useState<RemoteAccount[]>([]);

  // State for Backups
  const [backups, setBackups] = useState<Backup[]>([]);

  // State for AI Chat
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Seed mock data for the initial user if it doesn't exist
  useEffect(() => {
    const USERS_KEY = 'finua_users';
    const mockUserEmail = 'austin.hammond@example.com';
    const mockUserDataKey = `finua_data_${mockUserEmail}`;

    const allUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');

    if (!allUsers[mockUserEmail]) {
        allUsers[mockUserEmail] = {
            firstName: 'Austin',
            lastName: 'Hammond',
            email: mockUserEmail,
            profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            password: 'password123', // For simulation
        };
        localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    }

    if (!localStorage.getItem(mockUserDataKey)) {
        const mockData: FinancialData = {
            ...initialFinancialData,
            accounts: MOCK_ACCOUNTS,
            transactions: MOCK_TRANSACTIONS,
            investmentTransactions: MOCK_INVESTMENT_TRANSACTIONS,
            recurringTransactions: MOCK_RECURRING_TRANSACTIONS,
            financialGoals: MOCK_FINANCIAL_GOALS,
            budgets: MOCK_BUDGETS,
            tasks: MOCK_TASKS,
            warrants: MOCK_WARRANTS,
            scraperConfigs: MOCK_SCRAPER_CONFIGS,
            importExportHistory: MOCK_IMPORT_EXPORT_HISTORY,
        };
        localStorage.setItem(mockUserDataKey, JSON.stringify(mockData));
    }
  }, []);

  // Persist data to localStorage on change. This ensures user data is saved automatically.
  useEffect(() => {
    if (isAuthenticated && user) {
        const key = `finua_data_${user.email}`;
        const dataToSave: FinancialData = {
            accounts, transactions, investmentTransactions, recurringTransactions,
            financialGoals, budgets, tasks, warrants, scraperConfigs, importExportHistory, incomeCategories,
            expenseCategories, preferences, enableBankingSettings, backups
        };
        localStorage.setItem(key, JSON.stringify(dataToSave));
    }
  }, [
    isAuthenticated, user, accounts, transactions, investmentTransactions,
    recurringTransactions, financialGoals, budgets, tasks, warrants, scraperConfigs, importExportHistory,
    incomeCategories, expenseCategories, preferences, enableBankingSettings, backups
  ]);

  const loadUserData = (data: FinancialData, userData: User) => {
    setAccounts(data.accounts || []);
    setTransactions(data.transactions || []);
    setInvestmentTransactions(data.investmentTransactions || []);
    setRecurringTransactions(data.recurringTransactions || []);
    setFinancialGoals(data.financialGoals || []);
    setBudgets(data.budgets || []);
    setTasks(data.tasks || []);
    setWarrants(data.warrants || []);
    setScraperConfigs(data.scraperConfigs || []);
    setImportExportHistory(data.importExportHistory || []);
    setIncomeCategories(data.incomeCategories || MOCK_INCOME_CATEGORIES);
    setExpenseCategories(data.expenseCategories || MOCK_EXPENSE_CATEGORIES);
    setPreferences(data.preferences || initialFinancialData.preferences);
    setEnableBankingSettings(data.enableBankingSettings || initialFinancialData.enableBankingSettings);
    setBackups(data.backups || []);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Auth handlers
  const handleSignIn = (email: string, password: string) => {
    const allUsers = JSON.parse(localStorage.getItem('finua_users') || '{}');
    const userData = allUsers[email];
    
    if (userData && userData.password === password) {
        const dataKey = `finua_data_${email}`;
        const storedData = JSON.parse(localStorage.getItem(dataKey) || '{}');
        loadUserData(storedData, userData);
    } else {
        alert('Invalid email or password.');
    }
  };

  const handleSignUp = (newUserData: Pick<User, 'firstName' | 'lastName' | 'email'> & { password: string }) => {
    const allUsers = JSON.parse(localStorage.getItem('finua_users') || '{}');
    if (allUsers[newUserData.email]) {
        alert('An account with this email already exists.');
        return;
    }
    
    const userProfile: User = {
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        email: newUserData.email,
        profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    };
    
    allUsers[newUserData.email] = { ...userProfile, password: newUserData.password };
    localStorage.setItem('finua_users', JSON.stringify(allUsers));

    const dataKey = `finua_data_${newUserData.email}`;
    localStorage.setItem(dataKey, JSON.stringify(initialFinancialData));
    
    loadUserData(initialFinancialData, userProfile);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    // Reset all states to initial empty state to ensure no data leaks between sessions
    setAccounts(initialFinancialData.accounts);
    setTransactions(initialFinancialData.transactions);
    setInvestmentTransactions(initialFinancialData.investmentTransactions);
    setRecurringTransactions(initialFinancialData.recurringTransactions);
    setFinancialGoals(initialFinancialData.financialGoals);
    setBudgets(initialFinancialData.budgets);
    setTasks(initialFinancialData.tasks);
    setWarrants(initialFinancialData.warrants);
    setScraperConfigs(initialFinancialData.scraperConfigs);
    setImportExportHistory(initialFinancialData.importExportHistory);
    setIncomeCategories(initialFinancialData.incomeCategories);
    setExpenseCategories(initialFinancialData.expenseCategories);
    setPreferences(initialFinancialData.preferences);
    setEnableBankingSettings(initialFinancialData.enableBankingSettings);
    setBackups(initialFinancialData.backups);
    
    setAuthPage('signIn');
  };


  const handleSaveTransaction = (
    transactionDataArray: (Omit<Transaction, 'id'> & { id?: string })[],
    transactionIdsToDelete: string[] = []
  ) => {
    const balanceChanges: Record<string, number> = {}; // Stores changes in EUR
    const transactionsToUpdate: Transaction[] = [];
    const transactionsToAdd: Transaction[] = [];

    // Part 1: Calculate balance changes from deletions
    if (transactionIdsToDelete.length > 0) {
        const currentTransactions = transactions; // Use a snapshot of current state
        const transactionsToDelete = currentTransactions.filter(t => transactionIdsToDelete.includes(t.id));
        transactionsToDelete.forEach(tx => {
            const changeInEur = convertToEur(tx.amount, tx.currency);
            balanceChanges[tx.accountId] = (balanceChanges[tx.accountId] || 0) - changeInEur;
        });
    }

    // Part 2: Process transactions to save/update
    transactionDataArray.forEach(transactionData => {
        if (transactionData.id && transactions.some(t => t.id === transactionData.id)) {
            const updatedTx = { ...transactions.find(t => t.id === transactionData.id), ...transactionData } as Transaction;
            const originalTx = transactions.find(t => t.id === updatedTx.id);

            if (originalTx) {
                // Revert original transaction amount from its account
                const originalChangeInEur = convertToEur(originalTx.amount, originalTx.currency);
                balanceChanges[originalTx.accountId] = (balanceChanges[originalTx.accountId] || 0) - originalChangeInEur;
                
                // Apply new transaction amount to its account (which might be new)
                const updatedChangeInEur = convertToEur(updatedTx.amount, updatedTx.currency);
                balanceChanges[updatedTx.accountId] = (balanceChanges[updatedTx.accountId] || 0) + updatedChangeInEur;
                transactionsToUpdate.push(updatedTx);
            }
        } else {
            const newTx: Transaction = {
                ...transactionData,
                category: transactionData.category || 'Transfer', // Default category for transfers
                id: `txn-${uuidv4()}`
            } as Transaction;
            const newChangeInEur = convertToEur(newTx.amount, newTx.currency);
            balanceChanges[newTx.accountId] = (balanceChanges[newTx.accountId] || 0) + newChangeInEur;
            transactionsToAdd.push(newTx);
        }
    });

    // Part 3: Apply combined state updates
    setTransactions(prev => {
        let intermediateState = prev;
        // First, filter out deleted transactions if any
        if (transactionIdsToDelete.length > 0) {
            intermediateState = prev.filter(t => !transactionIdsToDelete.includes(t.id));
        }
        
        // Then, apply updates
        const updatedTransactions = intermediateState.map(t => {
            const foundUpdate = transactionsToUpdate.find(ut => ut.id === t.id);
            return foundUpdate ? foundUpdate : t;
        });

        // Finally, add new transactions
        return [...updatedTransactions, ...transactionsToAdd];
    });

    setAccounts(prevAccounts => 
        prevAccounts.map(account => {
            if (balanceChanges[account.id]) {
                // Convert the EUR change back to the account's native currency
                const changeInAccountCurrency = balanceChanges[account.id] / (CONVERSION_RATES[account.currency] || 1);
                const newBalance = account.balance + changeInAccountCurrency;
                return {
                    ...account,
                    balance: parseFloat(newBalance.toFixed(account.currency === 'BTC' ? 8 : 2))
                };
            }
            return account;
        })
    );
  };

  const handleDeleteTransactions = (transactionIds: string[]) => {
    if (transactionIds.length > 0) {
      handleSaveTransaction([], transactionIds);
    }
  };
  
  const handleSaveInvestmentTransaction = (
    invTxData: Omit<InvestmentTransaction, 'id'> & { id?: string },
    cashTxData?: Omit<Transaction, 'id'>
  ) => {
      if (invTxData.id) { 
           // For simplicity, editing an investment transaction won't automatically update a previously linked cash transaction.
           setInvestmentTransactions(prev => prev.map(t => t.id === invTxData.id ? {...t, ...invTxData} as InvestmentTransaction : t));
      } else { // Adding new
          const newInvTx = { ...invTxData, id: `inv-txn-${uuidv4()}` } as InvestmentTransaction;
          setInvestmentTransactions(prev => [...prev, newInvTx]);
          if (cashTxData) {
              handleSaveTransaction([cashTxData]);
          }
      }
  };

  const handleDeleteInvestmentTransaction = (id: string) => {
      // Deleting an investment transaction will not automatically delete its linked cash transaction for simplicity.
      setInvestmentTransactions(prev => prev.filter(t => t.id !== id));
  };


  const handleSaveRecurringTransaction = (recurringData: Omit<RecurringTransaction, 'id'> & { id?: string }) => {
    if (recurringData.id) {
        // Update
        setRecurringTransactions(prev => prev.map(rt => rt.id === recurringData.id ? { ...rt, ...recurringData } as RecurringTransaction : rt));
    } else {
        // Add
        const newRecurringTx: RecurringTransaction = {
            ...recurringData,
            id: `rec-${uuidv4()}`,
        } as RecurringTransaction;
        setRecurringTransactions(prev => [...prev, newRecurringTx]);
    }
  };

  const handleDeleteRecurringTransaction = (id: string) => {
    setRecurringTransactions(prev => prev.filter(rt => rt.id !== id));
  };
  
  const handleSaveFinancialGoal = (goalData: Omit<FinancialGoal, 'id'> & { id?: string }) => {
    if (goalData.id) {
        setFinancialGoals(prev => prev.map(g => g.id === goalData.id ? { ...g, ...goalData } as FinancialGoal : g));
    } else {
        const newGoal: FinancialGoal = { ...goalData, id: `goal-${uuidv4()}` } as FinancialGoal;
        setFinancialGoals(prev => [...prev, newGoal]);
    }
  };

  const handleDeleteFinancialGoal = (id: string) => {
    setFinancialGoals(prev => prev.filter(g => g.id !== id));
  };
  
  const handleSaveBudget = (budgetData: Omit<Budget, 'id'> & { id?: string }) => {
    if (budgetData.id) {
        setBudgets(prev => prev.map(b => b.id === budgetData.id ? { ...b, ...budgetData } as Budget : b));
    } else {
        const newBudget: Budget = { ...budgetData, id: `bud-${uuidv4()}` } as Budget;
        setBudgets(prev => [...prev, newBudget]);
    }
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'> & { id?: string }) => {
    if (taskData.id) {
        setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } as Task : t));
    } else {
        const newTask: Task = { ...taskData, id: `task-${uuidv4()}` } as Task;
        setTasks(prev => [...prev, newTask]);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleSaveWarrant = (warrantData: Omit<Warrant, 'id'> & { id?: string }) => {
    if (warrantData.id) {
        setWarrants(prev => prev.map(w => w.id === warrantData.id ? { ...w, ...warrantData } as Warrant : w));
    } else {
        const newWarrant: Warrant = { ...warrantData, id: `warr-${uuidv4()}` } as Warrant;
        setWarrants(prev => [...prev, newWarrant]);
    }
  };

  const handleDeleteWarrant = (warrantId: string) => {
      setWarrants(prev => prev.filter(w => w.id !== warrantId));
  };

  const handleSaveScraperConfig = (config: ScraperConfig) => {
    setScraperConfigs(prev => {
        const existingIndex = prev.findIndex(c => c.id === config.id);
        if (existingIndex > -1) {
            const newConfigs = [...prev];
            newConfigs[existingIndex] = config;
            return newConfigs;
        }
        return [...prev, config];
    });
  };
  
  const handlePublishImport = (
    items: any[],
    dataType: 'accounts' | 'transactions',
    fileName: string,
    originalData?: Record<string, any>[],
    errors?: Record<number, Record<string, string>>
  ) => {
    const historyId = `hist-${uuidv4()}`;

    setImportExportHistory(prev => [
      {
        id: historyId,
        type: 'import',
        dataType,
        fileName,
        date: new Date().toISOString(),
        status: 'In Progress',
        itemCount: items.length,
        importedData: originalData,
        errors: errors,
      },
      ...prev,
    ]);

    setTimeout(() => {
        try {
            if (dataType === 'accounts') {
                setAccounts(prev => [...prev, ...items as Account[]]);
            } else if (dataType === 'transactions') {
                const transactionsToImport = (items as Omit<Transaction, 'id'>[]).map(tx => ({
                    ...tx,
                    importId: historyId
                }));
                handleSaveTransaction(transactionsToImport);
            }
            setImportExportHistory(prev => prev.map(h => 
                h.id === historyId ? { ...h, status: 'Complete' } : h
            ));
        } catch (error) {
             setImportExportHistory(prev => prev.map(h => 
                h.id === historyId ? { ...h, status: 'Failed' } : h
            ));
        }
    }, 1500);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setImportExportHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleDeleteImportedTransactions = (importId: string) => {
    const transactionsToDelete = transactions.filter(t => t.importId === importId);
    if (transactionsToDelete.length > 0) {
        handleDeleteTransactions(transactionsToDelete.map(t => t.id));
    }
    handleDeleteHistoryItem(importId);
  };
  
  const handleInitiateBankConnection = () => {
    setConnectModalOpen(true);
  };
  
  const handleStartConnectionApi = async () => {
    setConnectModalOpen(false);
    setIsConnectingToBank(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "The user wants to connect to their bank. Call the function to fetch their bank accounts. The response should include a checking account from 'KBC Bank' and a savings account from 'ING'.",
            config: {
                tools: [{ functionDeclarations: [getBankAccountsFunctionDeclaration] }],
            },
        });

        const functionCall = response.functionCalls?.[0];

        if (functionCall?.name === 'get_bank_accounts' && functionCall.args?.accounts) {
            const receivedAccounts: RemoteAccount[] = functionCall.args.accounts as RemoteAccount[];
            setRemoteAccounts(receivedAccounts);
            setLinkModalOpen(true);
        } else {
            console.error("Gemini did not return the expected function call or account data.");
            alert("Sorry, we couldn't retrieve the bank accounts. Please try again.");
        }
    } catch (error) {
        console.error("Error connecting to bank API:", error);
        alert("An error occurred while connecting to the bank. Please check your connection and try again.");
    } finally {
        setIsConnectingToBank(false);
    }
  };

  const handleLinkAndSync = (links: Record<string, string>) => {
    const accountsToUpdate: Account[] = [];
    const accountsToAdd: Omit<Account, 'id'>[] = [];
    const transactionsToSync: Omit<Transaction, 'id'>[] = [];
    const now = new Date().toISOString();

    for (const remoteAccountId in links) {
        const finuaId = links[remoteAccountId];
        const remoteAccount = remoteAccounts.find(ra => ra.id === remoteAccountId);
        if (!remoteAccount) continue;

        let targetAccountId: string;

        if (finuaId === 'CREATE_NEW') {
            const newAccount: Omit<Account, 'id'> = {
                name: remoteAccount.name,
                type: remoteAccount.type as AccountType,
                balance: remoteAccount.balance,
                currency: remoteAccount.currency,
                last4: remoteAccount.last4,
                enableBankingId: remoteAccount.id,
                enableBankingInstitution: remoteAccount.institution,
                lastSync: now,
            };
            targetAccountId = `acc-${uuidv4()}`; // Temp ID for transaction association
            accountsToAdd.push({ ...newAccount, id: targetAccountId } as Account);
        } else {
            targetAccountId = finuaId;
            const existingAccount = accounts.find(a => a.id === finuaId);
            if (existingAccount) {
                accountsToUpdate.push({
                    ...existingAccount,
                    balance: remoteAccount.balance, // Overwrite balance from bank
                    enableBankingId: remoteAccount.id,
                    enableBankingInstitution: remoteAccount.institution,
                    lastSync: now,
                });
            }
        }

        // Add mock transactions for this newly linked account
        const newTxs = MOCK_ENABLE_BANKING_TRANSACTIONS[remoteAccountId] || [];
        newTxs.forEach(tx => {
            transactionsToSync.push({
                ...tx,
                accountId: targetAccountId,
                currency: remoteAccount.currency,
            });
        });
    }

    setAccounts(prev => {
        const updated = prev.map(acc => {
            const foundUpdate = accountsToUpdate.find(u => u.id === acc.id);
            return foundUpdate ? foundUpdate : acc;
        });
        return [...updated, ...(accountsToAdd as Account[])];
    });

    if (transactionsToSync.length > 0) {
        // We call handleSaveTransaction but without balance updates, as we already set the new balance.
        // For this simulation, we'll just add them.
        setTransactions(prev => [...prev, ...transactionsToSync.map(t => ({ ...t, id: `txn-${uuidv4()}` }))]);
    }
    
    setLinkModalOpen(false);
    setRemoteAccounts([]);
    alert(`Successfully linked ${Object.keys(links).length} accounts and synced ${transactionsToSync.length} new transactions!`);
  };

  const handleUnlinkAccount = (accountId: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, enableBankingId: undefined, enableBankingInstitution: undefined, lastSync: undefined }
        : acc
    ));
  };
  
  const handleManualSync = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account || !account.enableBankingId) return;

    const newTxs = MOCK_ENABLE_BANKING_TRANSACTIONS[`manual-sync-${account.enableBankingId}`] || [];
    if (newTxs.length > 0) {
      const transactionsToSync = newTxs.map(tx => ({
        ...tx,
        accountId: account.id,
        currency: account.currency,
      }));
      setTransactions(prev => [...prev, ...transactionsToSync.map(t => ({...t, id: `txn-${uuidv4()}`}))]);
      alert(`Successfully synced ${transactionsToSync.length} new transactions for ${account.name}.`);
    } else {
      alert(`No new transactions to sync for ${account.name}.`);
    }

    setAccounts(prev => prev.map(acc => 
      acc.id === accountId 
        ? { ...acc, lastSync: new Date().toISOString() } 
        : acc
    ));
  };
  
  const handleResetAccount = () => {
    // This will clear data for the CURRENT user
    if (user) {
        loadUserData(initialFinancialData, user);
    }
  };

  const handleResetAndPreload = () => {
    // This action doesn't fit the new multi-user model well. 
    // It's better to log in as the mock user.
    // For now, it will just reset the current user's data.
    alert("This action is disabled. To see sample data, sign in with 'austin.hammond@example.com'.");
    handleResetAccount();
  };
  
    const handleCreateBackup = () => {
        const backupData = {
            accounts: [...accounts],
            transactions: [...transactions],
            investmentTransactions: [...investmentTransactions],
            budgets: [...budgets],
            recurringTransactions: [...recurringTransactions],
            incomeCategories: [...incomeCategories],
            expenseCategories: [...expenseCategories],
            financialGoals: [...financialGoals],
            importExportHistory: [...importExportHistory],
            scraperConfigs: [...scraperConfigs],
        };

        const newBackup: Backup = {
            id: `backup-${uuidv4()}`,
            date: new Date().toISOString(),
            data: JSON.parse(JSON.stringify(backupData)), // Deep copy
        };
        
        setBackups(prev => {
            const updatedBackups = [newBackup, ...prev];
            if (updatedBackups.length > 5) {
                return updatedBackups.slice(0, 5); // Keep only the 5 most recent
            }
            return updatedBackups;
        });
    };
    
    const handleRestoreBackup = (backupId: string) => {
        const backupToRestore = backups.find(b => b.id === backupId);
        if (backupToRestore && user) {
            const { data } = backupToRestore;
            loadUserData(data as FinancialData, user);
        }
    };
    
    const handleDeleteBackup = (backupId: string) => {
        setBackups(prev => prev.filter(b => b.id !== backupId));
    };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auth guard
  if (!isAuthenticated || !user) {
    if (authPage === 'signIn') {
      return <SignIn onSignIn={handleSignIn} onNavigateToSignUp={() => setAuthPage('signUp')} />;
    } else {
      return <SignUp onSignUp={handleSignUp} onNavigateToSignIn={() => setAuthPage('signIn')} />;
    }
  }

  const renderPage = () => {
    const allCategories = [...incomeCategories, ...expenseCategories];
    const viewingAccount = viewingAccountId ? accounts.find(a => a.id === viewingAccountId) : null;

    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard user={user} transactions={transactions} accounts={accounts} saveTransaction={handleSaveTransaction} incomeCategories={incomeCategories} expenseCategories={expenseCategories} />;
      case 'Accounts':
        return <Accounts accounts={accounts} transactions={transactions} setAccounts={setAccounts} setCurrentPage={setCurrentPage} setAccountFilter={setAccountFilter} onStartConnection={handleInitiateBankConnection} setViewingAccountId={setViewingAccountId} saveTransaction={handleSaveTransaction} />;
      case 'Transactions':
        return <Transactions transactions={transactions} saveTransaction={handleSaveTransaction} deleteTransactions={handleDeleteTransactions} accounts={accounts} accountFilter={accountFilter} setAccountFilter={setAccountFilter} incomeCategories={incomeCategories} expenseCategories={expenseCategories} />;
      case 'Budget':
        return <Budgeting budgets={budgets} transactions={transactions} expenseCategories={expenseCategories} saveBudget={handleSaveBudget} deleteBudget={handleDeleteBudget} accounts={accounts} />;
      case 'Forecasting':
        return <Forecasting accounts={accounts} transactions={transactions} recurringTransactions={recurringTransactions} financialGoals={financialGoals} saveFinancialGoal={handleSaveFinancialGoal} deleteFinancialGoal={handleDeleteFinancialGoal} expenseCategories={expenseCategories} />;
      case 'Investments':
        return <Investments 
            investmentAccounts={accounts.filter(a => a.type === 'Investment' || a.type === 'Crypto')}
            cashAccounts={accounts.filter(a => a.type === 'Checking' || a.type === 'Savings')}
            investmentTransactions={investmentTransactions}
            saveInvestmentTransaction={handleSaveInvestmentTransaction}
            deleteInvestmentTransaction={handleDeleteInvestmentTransaction}
        />;
      case 'Warrants':
        return <Warrants warrants={warrants} saveWarrant={handleSaveWarrant} deleteWarrant={handleDeleteWarrant} scraperConfigs={scraperConfigs} saveScraperConfig={handleSaveScraperConfig} />;
      case 'Schedule':
        return <Schedule recurringTransactions={recurringTransactions} saveRecurringTransaction={handleSaveRecurringTransaction} deleteRecurringTransaction={handleDeleteRecurringTransaction} accounts={accounts} incomeCategories={incomeCategories} expenseCategories={expenseCategories} />;
      case 'Payment Plan':
        return <PaymentPlan />;
      case 'Tasks':
        return <Tasks tasks={tasks} saveTask={handleSaveTask} deleteTask={handleDeleteTask} />;
      case 'Settings':
        return <Settings />;
      case 'Categories':
        return <Categories incomeCategories={incomeCategories} setIncomeCategories={setIncomeCategories} expenseCategories={expenseCategories} setExpenseCategories={setExpenseCategories} />;
      case 'Tags':
        return <Tags />;
      case 'Personal Info':
        return <PersonalInfo user={user} setUser={setUser} />;
      case 'Data Management':
        return <DataManagement 
            accounts={accounts} 
            transactions={transactions} 
            budgets={budgets} 
            recurringTransactions={recurringTransactions} 
            allCategories={allCategories} 
            history={importExportHistory} 
            onPublishImport={handlePublishImport} 
            onDeleteHistoryItem={handleDeleteHistoryItem} 
            onDeleteImportedTransactions={handleDeleteImportedTransactions} 
            onResetAccount={handleResetAccount} 
            onResetAndPreload={handleResetAndPreload} 
            backups={backups}
            onCreateBackup={handleCreateBackup}
            onRestoreBackup={handleRestoreBackup}
            onDeleteBackup={handleDeleteBackup}
        />;
      case 'Preferences':
        return <Preferences preferences={preferences} setPreferences={setPreferences} theme={theme} setTheme={setTheme} />;
      case 'Enable Banking':
        return <EnableBankingSettingsPage linkedAccounts={accounts.filter(a => a.enableBankingId)} settings={enableBankingSettings} setSettings={setEnableBankingSettings} onStartConnection={handleInitiateBankConnection} onUnlinkAccount={handleUnlinkAccount} onManualSync={handleManualSync} />;
      case 'AccountDetail':
        if (viewingAccount) {
            return <AccountDetail account={viewingAccount} transactions={transactions} allCategories={allCategories} setCurrentPage={setCurrentPage} saveTransaction={handleSaveTransaction} />;
        }
        return <Dashboard user={user} transactions={transactions} accounts={accounts} saveTransaction={handleSaveTransaction} incomeCategories={incomeCategories} expenseCategories={expenseCategories} />; // Fallback
      default:
        return <Dashboard user={user} transactions={transactions} accounts={accounts} saveTransaction={handleSaveTransaction} incomeCategories={incomeCategories} expenseCategories={expenseCategories} />;
    }
  };

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        theme={theme}
        isSidebarCollapsed={isSidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          user={user}
          setSidebarOpen={setSidebarOpen}
          theme={theme}
          setTheme={setTheme}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>

      {/* New Chatbot components */}
      <ChatFab onClick={() => setIsChatOpen(true)} />
      <Chatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        financialData={{
          accounts,
          transactions,
          budgets,
          financialGoals,
          recurringTransactions,
        }}
      />

      {/* Modals and Overlays */}
      {isConnectingToBank && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center text-white">
          <div className="flex items-center gap-4 bg-dark-card p-4 rounded-lg">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 * 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Connecting to Bank...</span>
          </div>
        </div>
      )}
      {isConnectModalOpen && <EnableBankingConnectModal onClose={() => setConnectModalOpen(false)} onConnect={handleStartConnectionApi} isConnecting={isConnectingToBank} />}
      {isLinkModalOpen && <EnableBankingLinkAccountsModal onClose={() => setLinkModalOpen(false)} remoteAccounts={remoteAccounts} existingAccounts={accounts} onLinkAndSync={handleLinkAndSync} />}
    </div>
  );
};

export default App;

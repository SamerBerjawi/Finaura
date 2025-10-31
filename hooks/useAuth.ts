import { useState, useCallback } from 'react';
import { User, FinancialData } from '../types';
import { MOCK_INCOME_CATEGORIES, MOCK_EXPENSE_CATEGORIES } from '../constants';

// --- User Data Structure in localStorage ---
// key: 'finaura_users'
// value: { [email: string]: { user: User; passwordHash: string } }

// key: `finaura_session`
// value: { email: string }

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
    incomeCategories: MOCK_INCOME_CATEGORIES,
    expenseCategories: MOCK_EXPENSE_CATEGORIES,
    billsAndPayments: [],
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
};


const getUsersFromStorage = (): Record<string, { user: User; passwordHash: string }> => {
  try {
    const usersJson = localStorage.getItem('finaura_users');
    return usersJson ? JSON.parse(usersJson) : {};
  } catch {
    return {};
  }
};

const saveUsersToStorage = (users: Record<string, { user: User; passwordHash: string }>) => {
  localStorage.setItem('finaura_users', JSON.stringify(users));
};

const getFinancialDataForUser = (email: string): FinancialData => {
    try {
        const dataJson = localStorage.getItem(`finaura_data_${email}`);
        return dataJson ? JSON.parse(dataJson) : initialFinancialData;
    } catch {
        return initialFinancialData;
    }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processSuccessfulAuth = useCallback((userData: User): FinancialData => {
    localStorage.setItem('finaura_session', JSON.stringify({ email: userData.email }));
    setUser(userData);
    setIsAuthenticated(true);
    return getFinancialDataForUser(userData.email);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('finaura_session');
    setUser(null);
    setIsAuthenticated(false);
  }, []);
  
  const checkAuthStatus = useCallback(async (): Promise<FinancialData | null> => {
    setIsLoading(true);
    try {
      const sessionJson = localStorage.getItem('finaura_session');
      if (sessionJson) {
        const session = JSON.parse(sessionJson);
        const users = getUsersFromStorage();
        if (users[session.email]) {
          const loadedData = processSuccessfulAuth(users[session.email].user);
          setIsLoading(false);
          return loadedData;
        }
      }
    } catch (e) {
      console.error("Auth check failed", e);
    }
    signOut();
    setIsLoading(false);
    return null;
  }, [processSuccessfulAuth, signOut]);

  const signIn = useCallback(async (email: string, password: string): Promise<FinancialData | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const users = getUsersFromStorage();
      const userData = users[email.toLowerCase()];
      // Use simple base64 for local "hashing" - NOT for production web apps.
      if (userData && userData.passwordHash === btoa(password)) {
        userData.user.lastLogin = new Date().toISOString();
        saveUsersToStorage(users);
        return processSuccessfulAuth(userData.user);
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [processSuccessfulAuth]);

  const signUp = useCallback(async (newUserData: { firstName: string, lastName: string, email: string, password: string }): Promise<FinancialData | null> => {
    setIsLoading(true);
    setError(null);
    try {
        const users = getUsersFromStorage();
        const email = newUserData.email.toLowerCase();
        if (users[email]) {
            setError('An account with this email already exists.');
            setIsLoading(false);
            return null;
        }

        const user: User = {
            firstName: newUserData.firstName,
            lastName: newUserData.lastName,
            email: email,
            profilePictureUrl: `https://i.pravatar.cc/150?u=${email}`,
            role: 'Administrator', // First user is always admin
            is2FAEnabled: false,
            status: 'Active',
            lastLogin: new Date().toISOString(),
        };

        users[email] = {
            user,
            passwordHash: btoa(newUserData.password) // Simple base64 "hashing"
        };
        saveUsersToStorage(users);
        
        localStorage.setItem(`finaura_data_${email}`, JSON.stringify(initialFinancialData));

        return processSuccessfulAuth(user);
    } catch (err) {
      setError('An unexpected error occurred during sign up.');
    } finally {
        setIsLoading(false);
    }
    return null;
  }, [processSuccessfulAuth]);
  
  const updateUser = useCallback((email: string, updates: Partial<User>) => {
      const users = getUsersFromStorage();
      if (users[email]) {
          const updatedUser = { ...users[email].user, ...updates };
          users[email].user = updatedUser;
          saveUsersToStorage(users);
          setUser(updatedUser); // Update active user state
      }
  }, []);
  
  const changePassword = useCallback((email: string, current: string, newPass: string): boolean => {
      const users = getUsersFromStorage();
      if (users[email] && users[email].passwordHash === btoa(current)) {
          users[email].passwordHash = btoa(newPass);
          saveUsersToStorage(users);
          return true;
      }
      return false;
  }, []);

  return { user, setUser: updateUser, isAuthenticated, isLoading, error, signIn, signUp, signOut, checkAuthStatus, setError, changePassword };
};
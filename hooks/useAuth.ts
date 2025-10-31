import { useState, useEffect, useCallback } from 'react';
import { User, FinancialData } from '../types';
import { getApiBaseUrl } from '../utils';
import { MOCK_INCOME_CATEGORIES, MOCK_EXPENSE_CATEGORIES } from '../constants';

// --- Development Flag ---
// Set to true to bypass the login screen and use a mock user.
// This is for development purposes only.
const DEV_MODE_BYPASS_AUTH = true;
// ------------------------

const MOCK_USER: User = {
    firstName: 'Dev',
    lastName: 'User',
    email: 'dev@finaura.app',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=dev@finaura.app',
    role: 'Administrator',
    phone: '123-456-7890',
    address: '123 Dev Street, Codeville',
    is2FAEnabled: false,
    status: 'Active',
    lastLogin: new Date().toISOString(),
};


const API_BASE_URL = getApiBaseUrl();

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

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(DEV_MODE_BYPASS_AUTH ? MOCK_USER : null);
  const [isAuthenticated, setIsAuthenticated] = useState(DEV_MODE_BYPASS_AUTH);
  const [isLoading, setIsLoading] = useState(!DEV_MODE_BYPASS_AUTH);
  const [error, setError] = useState<string | null>(null);

  const processSuccessfulAuth = useCallback((token: string, userData: User, financialData: FinancialData) => {
    localStorage.setItem('finaura_token', token);
    const normalizedUser = {
      ...userData,
      firstName: userData.first_name || userData.firstName,
      lastName: userData.last_name || userData.lastName,
      profilePictureUrl: userData.profile_picture_url || userData.profilePictureUrl,
      is2FAEnabled: userData.is_2fa_enabled !== undefined ? userData.is_2fa_enabled : userData.is2FAEnabled,
    };
    setUser(normalizedUser);
    setIsAuthenticated(true);
    return financialData || initialFinancialData;
  }, []);

  const signOut = useCallback(() => {
    if (DEV_MODE_BYPASS_AUTH) {
        alert("Sign out is disabled in development mode. To log out, set the 'DEV_MODE_BYPASS_AUTH' flag to false in hooks/useAuth.ts.");
        return;
    }
    localStorage.removeItem('finaura_token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);
  
  const checkAuthStatus = useCallback(async () => {
    if (DEV_MODE_BYPASS_AUTH) {
        setIsLoading(false);
        try {
            const item = window.localStorage.getItem('finaura_dev_data');
            return item ? JSON.parse(item) : initialFinancialData;
        } catch (e) {
            console.error("Failed to load dev data from localStorage", e);
            return initialFinancialData;
        }
    }

    setIsLoading(true);
    const token = localStorage.getItem('finaura_token');
    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const { user: userData, financialData } = await res.json();
          return processSuccessfulAuth(token, userData, financialData);
        } else {
          signOut();
        }
      } catch (err) {
        console.error('Auth check failed', err);
        signOut();
      }
    }
    setIsLoading(false);
    return null;
  }, [processSuccessfulAuth, signOut]);

  const signIn = useCallback(async (email: string, password: string): Promise<FinancialData | null> => {
    if (DEV_MODE_BYPASS_AUTH) {
        console.log("Sign in is disabled in development mode.");
        return Promise.resolve(initialFinancialData);
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const { token, user: userData, financialData } = await res.json();
        return processSuccessfulAuth(token, userData, financialData);
      } else {
        const { message } = await res.json();
        setError(message || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Failed to sign in. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [processSuccessfulAuth]);

  const signUp = useCallback(async (newUserData: { firstName: string, lastName: string, email: string, password: string }): Promise<FinancialData | null> => {
    if (DEV_MODE_BYPASS_AUTH) {
        console.log("Sign up is disabled in development mode.");
        return Promise.resolve(initialFinancialData);
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData),
      });
      if (res.ok) {
        const { token, user: userData, financialData } = await res.json();
        return processSuccessfulAuth(token, userData, financialData);
      } else {
        const { message } = await res.json();
        setError(message || 'Failed to sign up.');
      }
    } catch (err) {
      setError('Failed to sign up. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [processSuccessfulAuth]);
  
  return { user, isAuthenticated, isLoading, error, signIn, signUp, signOut, checkAuthStatus, setError };
};
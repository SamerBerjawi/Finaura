import React from 'react';
import { Account, Transaction, Category, Page, AccountType, Currency, Theme, RecurrenceFrequency, RecurringTransaction, WeekendAdjustment, FinancialGoal, Budget, ImportExportHistoryItem, InvestmentTransaction } from './types';
import { v4 as uuidv4 } from 'uuid';


export function FinuaLogo({ theme }: { theme: Theme }) {
  return (
    <div className="flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="#6366F1"/>
            <path d="M20 10L28 28L12 28L20 10Z" fill="#FBBF24"/>
        </svg>
    </div>
  );
}

// Common Styles
export const BTN_PRIMARY_STYLE = "bg-primary-500 text-white font-semibold py-2 px-4 rounded-lg shadow-card hover:bg-primary-600 transition-all duration-200";
export const BTN_SECONDARY_STYLE = "bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text font-semibold py-2 px-4 rounded-lg shadow-card hover:bg-gray-50 dark:hover:bg-dark-border transition-colors duration-200";
export const BTN_DANGER_STYLE = "text-red-500 hover:text-red-400 font-semibold py-2 px-4 rounded-lg hover:bg-red-500/10 transition-colors";
export const INPUT_BASE_STYLE = "w-full appearance-none bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded-lg py-2 px-4 border border-gray-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow duration-200";
export const SELECT_WRAPPER_STYLE = "relative w-full";
export const SELECT_ARROW_STYLE = "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-light-text-secondary dark:text-dark-text-secondary";

export interface NavItem {
  name: Page;
  icon: React.ReactElement;
  subItems?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', icon: <span className="material-symbols-outlined">dashboard</span> },
  { name: 'Accounts', icon: <span className="material-symbols-outlined">wallet</span> },
  { name: 'Transactions', icon: <span className="material-symbols-outlined">receipt_long</span> },
  { name: 'Budget', icon: <span className="material-symbols-outlined">pie_chart</span> },
  { name: 'Forecasting', icon: <span className="material-symbols-outlined">trending_up</span> },
  { name: 'Investments', icon: <span className="material-symbols-outlined">show_chart</span> },
  { name: 'Warrants', icon: <span className="material-symbols-outlined">verified</span> },
  { name: 'Schedule', icon: <span className="material-symbols-outlined">calendar_month</span> },
  { name: 'Payment Plan', icon: <span className="material-symbols-outlined">credit_score</span> },
  { name: 'Tasks', icon: <span className="material-symbols-outlined">task_alt</span> },
  { 
    name: 'Settings', 
    icon: <span className="material-symbols-outlined">settings</span>,
    subItems: [
      { name: 'Preferences', icon: <span className="material-symbols-outlined">tune</span> },
      { name: 'Personal Info', icon: <span className="material-symbols-outlined">person</span> },
      { name: 'Categories', icon: <span className="material-symbols-outlined">category</span> },
      { name: 'Tags', icon: <span className="material-symbols-outlined">label</span> },
      { name: 'Enable Banking', icon: <span className="material-symbols-outlined">sync</span> },
      { name: 'Data Management', icon: <span className="material-symbols-outlined">settings_backup_restore</span> },
    ]
  },
];

export const ASSET_TYPES: AccountType[] = ['Checking', 'Savings', 'Investment', 'Crypto', 'Property', 'Vehicle', 'Other Assets'];
export const DEBT_TYPES: AccountType[] = ['Credit Card', 'Loan', 'Other Liabilities'];
export const ALL_ACCOUNT_TYPES: AccountType[] = [...ASSET_TYPES, ...DEBT_TYPES];
export const LIQUID_ACCOUNT_TYPES: AccountType[] = ['Checking', 'Savings', 'Credit Card'];
export const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'BTC', 'RON'];
export const FREQUENCIES: { value: RecurrenceFrequency, label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
];

export const WEEKEND_ADJUSTMENTS: { value: WeekendAdjustment, label: string }[] = [
    { value: 'on', label: 'On the exact day' },
    { value: 'before', label: 'Friday before' },
    { value: 'after', label: 'Monday after' },
];

export const ACCOUNT_TYPE_STYLES: { [key in AccountType]: { icon: string; color: string } } = {
    'Checking': { icon: 'account_balance', color: 'text-blue-500' },
    'Savings': { icon: 'savings', color: 'text-green-500' },
    'Credit Card': { icon: 'credit_card', color: 'text-orange-500' },
    'Investment': { icon: 'trending_up', color: 'text-purple-500' },
    'Loan': { icon: 'request_quote', color: 'text-red-500' },
    'Property': { icon: 'home', color: 'text-yellow-500' },
    'Crypto': { icon: 'currency_bitcoin', color: 'text-amber-500' },
    'Vehicle': { icon: 'directions_car', color: 'text-cyan-500' },
    'Other Assets': { icon: 'category', color: 'text-lime-500' },
    'Other Liabilities': { icon: 'receipt_long', color: 'text-pink-500' },
};

export const MOCK_INCOME_CATEGORIES: Category[] = [
    { id: 'inc-1', name: 'Salary', color: '#10B981', icon: 'work', classification: 'income', subCategories: [{ id: 'inc-1a', name: 'Fixed Salary', color: '#10B981', icon: 'work', classification: 'income', subCategories: [], parentId: 'inc-1' }, { id: 'inc-1b', name: 'Bonus Salary', color: '#10B981', icon: 'work', classification: 'income', subCategories: [], parentId: 'inc-1' }] },
    { id: 'inc-2', name: 'Refunds & Payback', color: '#F59E0B', icon: 'assignment_return', classification: 'income', subCategories: [] },
    { id: 'inc-3', name: 'Meal Vouchers', color: '#3B82F6', icon: 'restaurant_menu', classification: 'income', subCategories: [] },
    { id: 'inc-4', name: 'Income', color: '#84CC16', icon: 'attach_money', classification: 'income', subCategories: [] },
    { id: 'inc-5', name: 'Investment Income', color: '#6366F1', icon: 'show_chart', classification: 'income', subCategories: [] }
];

export const MOCK_EXPENSE_CATEGORIES: Category[] = [
    { id: 'exp-1', name: 'Housing', color: '#EF4444', icon: 'house', classification: 'expense', subCategories: [{ id: 'exp-1a', name: 'Mortgage', color: '#EF4444', icon: 'house', classification: 'expense', subCategories: [], parentId: 'exp-1' }, { id: 'exp-1b', name: 'Maintenance & Repairs', color: '#EF4444', icon: 'construction', classification: 'expense', subCategories: [], parentId: 'exp-1' }] },
    { id: 'exp-2', name: 'Food & Groceries', color: '#F97316', icon: 'shopping_cart', classification: 'expense', subCategories: [{ id: 'exp-2a', name: 'Supermarket', color: '#F97316', icon: 'shopping_cart', classification: 'expense', subCategories: [], parentId: 'exp-2' }, { id: 'exp-2b', name: 'Dining Out', color: '#F97316', icon: 'restaurant', classification: 'expense', subCategories: [], parentId: 'exp-2' }, { id: 'exp-2c', name: 'Cafes & Snacks', color: '#F97316', icon: 'local_cafe', classification: 'expense', subCategories: [], parentId: 'exp-2' }, { id: 'exp-2d', name: 'Delivery & Takeaway', color: '#F97316', icon: 'delivery_dining', classification: 'expense', subCategories: [], parentId: 'exp-2' }] },
    { id: 'exp-3', name: 'Transportation', color: '#3B82F6', icon: 'commute', classification: 'expense', subCategories: [{ id: 'exp-3a', name: 'Public Transport', color: '#3B82F6', icon: 'train', classification: 'expense', subCategories: [], parentId: 'exp-3' }, { id: 'exp-3b', name: 'Ride-Hailing', color: '#3B82F6', icon: 'local_taxi', classification: 'expense', subCategories: [], parentId: 'exp-3' }, { id: 'exp-3c', name: 'EV Charging / Fuel', color: '#3B82F6', icon: 'ev_station', classification: 'expense', subCategories: [], parentId: 'exp-3' }, { id: 'exp-3d', name: 'Parking & Tolls', color: '#3B82F6', icon: 'local_parking', classification: 'expense', subCategories: [], parentId: 'exp-3' }, { id: 'exp-3e', name: 'Transportation (Car Rental, Train)', color: '#3B82F6', icon: 'directions_car', classification: 'expense', subCategories: [], parentId: 'exp-3' }] },
    { id: 'exp-4', name: 'Shopping', color: '#8B5CF6', icon: 'shopping_bag', classification: 'expense', subCategories: [] },
    { id: 'exp-5', name: 'Bills & Utilities', color: '#0EA5E9', icon: 'receipt_long', classification: 'expense', subCategories: [{ id: 'exp-5a', name: 'Internet & TV', color: '#0EA5E9', icon: 'router', classification: 'expense', subCategories: [], parentId: 'exp-5' }, { id: 'exp-5b', name: 'Utilities (Gas, Water, Electricity)', color: '#0EA5E9', icon: 'bolt', classification: 'expense', subCategories: [], parentId: 'exp-5' }] },
    { id: 'exp-6', name: 'Entertainment', color: '#EC4899', icon: 'movie', classification: 'expense', subCategories: [{ id: 'exp-6a', name: 'Streaming', color: '#EC4899', icon: 'subscriptions', classification: 'expense', subCategories: [], parentId: 'exp-6' }, { id: 'exp-6b', name: 'Concerts & Events', color: '#EC4899', icon: 'local_activity', classification: 'expense', subCategories: [], parentId: 'exp-6' }, { id: 'exp-6c', name: 'Hobbies & Sports', color: '#EC4899', icon: 'sports_soccer', classification: 'expense', subCategories: [], parentId: 'exp-6' }] },
    { id: 'exp-7', name: 'Health & Wellness', color: '#10B981', icon: 'healing', classification: 'expense', subCategories: [{ id: 'exp-7a', name: 'Fitness', color: '#10B981', icon: 'fitness_center', classification: 'expense', subCategories: [], parentId: 'exp-7' }, { id: 'exp-7b', name: 'Health Insurance', color: '#10B981', icon: 'health_and_safety', classification: 'expense', subCategories: [], parentId: 'exp-7' }, { id: 'exp-7c', name: 'Medical (Doctor, Dentist, Pharmacy)', color: '#10B981', icon: 'medication', classification: 'expense', subCategories: [], parentId: 'exp-7' }] },
    { id: 'exp-8', name: 'Travel', color: '#F59E0B', icon: 'flight_takeoff', classification: 'expense', subCategories: [{ id: 'exp-8a', name: 'Flights', color: '#F59E0B', icon: 'flight', classification: 'expense', subCategories: [], parentId: 'exp-8' }, { id: 'exp-8b', name: 'Accommodation', color: '#F59E0B', icon: 'hotel', classification: 'expense', subCategories: [], parentId: 'exp-8' }, { id: 'exp-8c', name: 'Activities & Tours', color: '#F59E0B', icon: 'tour', classification: 'expense', subCategories: [], parentId: 'exp-8' }] },
    { id: 'exp-9', name: 'Personal', color: '#64748B', icon: 'person', classification: 'expense', subCategories: [{ id: 'exp-9a', name: 'Personal Care', color: '#64748B', icon: 'spa', classification: 'expense', subCategories: [], parentId: 'exp-9' }, { id: 'exp-9b', name: 'Gifts & Donations', color: '#64748B', icon: 'card_giftcard', classification: 'expense', subCategories: [], parentId: 'exp-9' }, { id: 'exp-9c', name: 'Pet Care', color: '#64748B', icon: 'pets', classification: 'expense', subCategories: [], parentId: 'exp-9' }] },
    { id: 'exp-10', name: 'Finances', color: '#A855F7', icon: 'account_balance', classification: 'expense', subCategories: [{ id: 'exp-10a', name: 'Bank Fees', color: '#A855F7', icon: 'price_check', classification: 'expense', subCategories: [], parentId: 'exp-10' }, { id: 'exp-10b', name: 'Retirement Contribution', color: '#A855F7', icon: 'savings', classification: 'expense', subCategories: [], parentId: 'exp-10' }, { id: 'exp-10c', name: 'Investments', color: '#A855F7', icon: 'show_chart', classification: 'expense', subCategories: [], parentId: 'exp-10' }] },
    { id: 'exp-11', name: 'Miscellaneous', color: '#78716C', icon: 'category', classification: 'expense', subCategories: [{ id: 'exp-11a', name: 'Services', color: '#78716C', icon: 'miscellaneous_services', classification: 'expense', subCategories: [], parentId: 'exp-11' }, { id: 'exp-11b', name: 'Visa', color: '#78716C', icon: 'airplanemode_active', classification: 'expense', subCategories: [], parentId: 'exp-11' }, { id: 'exp-11c', name: 'Electronics & Gadgets', color: '#78716C', icon: 'devices', classification: 'expense', subCategories: [], parentId: 'exp-11' }, { id: 'exp-11d', name: 'Uncategorized', color: '#78716C', icon: 'help', classification: 'expense', subCategories: [], parentId: 'exp-11' }] }
];

const adjustForWeekend = (date: Date, adjustment: WeekendAdjustment): Date => {
    const adjustedDate = new Date(date.getTime());
    const day = adjustedDate.getDay(); // Sunday - 0, Saturday - 6
    if (adjustment === 'on') return adjustedDate;

    if (day === 0) { // Sunday
        if (adjustment === 'before') adjustedDate.setDate(adjustedDate.getDate() - 2);
        if (adjustment === 'after') adjustedDate.setDate(adjustedDate.getDate() + 1);
    } else if (day === 6) { // Saturday
        if (adjustment === 'before') adjustedDate.setDate(adjustedDate.getDate() - 1);
        if (adjustment === 'after') adjustedDate.setDate(adjustedDate.getDate() + 2);
    }
    return adjustedDate;
};


const generateMockData = () => {
    const today = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(today.getFullYear() - 3);

    const initialAccounts: Account[] = [
        { id: '0163d353-d627-42d0-9bda-d83eb76fb0b1', name: 'Bitcoin', type: 'Crypto', balance: 0.01, currency: 'BTC', icon: ACCOUNT_TYPE_STYLES['Crypto'].icon },
        { id: '0cadcbe9-40bd-4a33-8db6-cd6ab1886d75', name: 'Bolero', type: 'Investment', balance: 5000.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Investment'].icon },
        { id: '0facb6b6-c01d-47fa-b112-de7e9bf343f3', name: 'KBC Savings', type: 'Savings', balance: 2500.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Savings'].icon },
        { id: '1e41ab1f-a417-44a3-a354-1a2f4f050d82', name: 'KBC Joint', type: 'Checking', balance: 1200.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Checking'].icon },
        { id: '25ac52fa-0259-41e3-bf0c-54ef10bac8fd', name: 'House', type: 'Property', balance: 180000.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Property'].icon },
        { id: '2ee803c3-68cb-48d4-be3e-85b3aa9856d6', name: 'KBC Spare Change SS', type: 'Investment', balance: 50.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Investment'].icon },
        { id: '46ea1f67-22e6-48b2-8c61-24d8e0ec8e40', name: 'Pluxee', type: 'Checking', balance: 20.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Checking'].icon },
        { id: '4d73ec6d-6589-4988-b39a-69a56d057e13', name: 'Cash', type: 'Checking', balance: 50.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Checking'].icon },
        { id: '6815abf2-09a4-4cbd-8418-fb243b055494', name: 'Mortgage', type: 'Loan', balance: -250000.00, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Loan'].icon },
        { id: '68562129-6b20-4190-b37e-a3c46a7638df', name: 'KBC Pension Funds', type: 'Investment', balance: 1500.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Investment'].icon },
        { id: '6b62dcfc-0f1a-475f-9b58-aa502d295baa', name: 'Warrants', type: 'Investment', balance: 20000.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Investment'].icon },
        { id: '73a8b4c0-a478-4e8f-9d6b-a171bf12ea33', name: 'KBC Spare Change SB', type: 'Investment', balance: 50.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Investment'].icon },
        { id: '95bf5d4f-e7d4-46c9-904b-98eddba5f4f1', name: 'Revolut Bold Stack Portfolio', type: 'Investment', balance: 100.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Investment'].icon },
        { id: 'b6f06622-fdeb-4a82-8533-1c3e2e1aa69a', name: 'Revolut', type: 'Checking', balance: 10.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Checking'].icon },
        { id: 'd5966015-ac27-409a-aea7-ebcec1388b4f', name: 'KBC Credit Card', type: 'Credit Card', balance: 0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Credit Card'].icon },
        { id: 'e88eba91-ae06-4f80-ac6a-efa1d3edb007', name: 'KBC Checking', type: 'Checking', balance: 3500.0, currency: 'EUR', icon: ACCOUNT_TYPE_STYLES['Checking'].icon }
    ];

    const recurringTemplates: Omit<RecurringTransaction, 'id'|'nextDueDate'>[] = [
        { accountId: '6815abf2-09a4-4cbd-8418-fb243b055494', toAccountId: '1e41ab1f-a417-44a3-a354-1a2f4f050d82', description: 'Monthly Mortgage Payment', amount: 2156.68, type: 'income', category: 'Mortgage', currency: 'EUR', frequency: 'monthly', startDate: threeYearsAgo.toISOString().split('T')[0], weekendAdjustment: 'on', dueDateOfMonth: 2 },
        { accountId: 'e88eba91-ae06-4f80-ac6a-efa1d3edb007', description: 'Salary', amount: 4460, type: 'income', category: 'Fixed Salary', currency: 'EUR', frequency: 'monthly', startDate: threeYearsAgo.toISOString().split('T')[0], weekendAdjustment: 'before', dueDateOfMonth: 24 },
        { accountId: 'd5966015-ac27-409a-aea7-ebcec1388b4f', description: 'Apple Music', amount: 16.99, type: 'expense', category: 'Streaming', currency: 'EUR', frequency: 'monthly', startDate: threeYearsAgo.toISOString().split('T')[0], weekendAdjustment: 'on', dueDateOfMonth: 22 },
        { accountId: 'd5966015-ac27-409a-aea7-ebcec1388b4f', description: 'Netflix', amount: 15.99, type: 'expense', category: 'Streaming', currency: 'EUR', frequency: 'monthly', startDate: threeYearsAgo.toISOString().split('T')[0], weekendAdjustment: 'on', dueDateOfMonth: 5 },
        { accountId: '1e41ab1f-a417-44a3-a354-1a2f4f050d82', description: 'Internet & TV', amount: 65, type: 'expense', category: 'Internet & TV', currency: 'EUR', frequency: 'monthly', startDate: threeYearsAgo.toISOString().split('T')[0], weekendAdjustment: 'after', dueDateOfMonth: 15 },
        { accountId: 'e88eba91-ae06-4f80-ac6a-efa1d3edb007', description: 'Gym Membership', amount: 39.99, type: 'expense', category: 'Fitness', currency: 'EUR', frequency: 'monthly', startDate: threeYearsAgo.toISOString().split('T')[0], weekendAdjustment: 'on', dueDateOfMonth: 7 },
    ];

    let allTransactions: Transaction[] = [];

    recurringTemplates.forEach(template => {
        let cursorDate = new Date(template.startDate);
        if(template.dueDateOfMonth) cursorDate.setDate(template.dueDateOfMonth);

        while (cursorDate <= today) {
            const adjustedDate = adjustForWeekend(new Date(cursorDate), template.weekendAdjustment);

            const acc = initialAccounts.find(a => a.id === template.accountId);
            if (acc) {
                 allTransactions.push({
                    id: `txn-${uuidv4()}`,
                    accountId: template.accountId,
                    date: adjustedDate.toISOString().split('T')[0],
                    description: template.description,
                    amount: template.type === 'expense' ? -template.amount : template.amount,
                    category: template.category!,
                    type: template.type as 'income' | 'expense',
                    currency: acc.currency,
                });
            }
            
            switch (template.frequency) {
                case 'monthly': cursorDate.setMonth(cursorDate.getMonth() + (template.frequencyInterval || 1)); break;
                default: cursorDate.setMonth(cursorDate.getMonth() + 1); break;
            }
        }
    });
    
    const spendingAccounts = ['1e41ab1f-a417-44a3-a354-1a2f4f050d82', 'e88eba91-ae06-4f80-ac6a-efa1d3edb007', 'd5966015-ac27-409a-aea7-ebcec1388b4f', 'b6f06622-fdeb-4a82-8533-1c3e2e1aa69a', '46ea1f67-22e6-48b2-8c61-24d8e0ec8e40'];
    const expenseCats = MOCK_EXPENSE_CATEGORIES.filter(c => ['Food & Groceries', 'Transportation', 'Shopping', 'Entertainment', 'Personal'].includes(c.name)).flatMap(c => c.subCategories.length > 0 ? c.subCategories : c);

    let cursorDate = new Date(threeYearsAgo);
    while (cursorDate <= today) {
        if (Math.random() < 0.4) {
            allTransactions.push({
                id: `txn-${uuidv4()}`,
                accountId: spendingAccounts[Math.floor(Math.random() * spendingAccounts.length)],
                date: new Date(cursorDate).toISOString().split('T')[0],
                description: ['Groceries', 'Supermarket', 'Lunch', 'Coffee Run'][Math.floor(Math.random()*4)],
                amount: -(Math.random() * 80 + 5),
                category: 'Food & Groceries',
                type: 'expense',
                currency: 'EUR'
            });
        }
        if (Math.random() < 0.15) {
             const cat = expenseCats[Math.floor(Math.random() * expenseCats.length)];
             allTransactions.push({
                id: `txn-${uuidv4()}`,
                accountId: spendingAccounts[Math.floor(Math.random() * spendingAccounts.length)],
                date: new Date(cursorDate).toISOString().split('T')[0],
                description: ['Online Order', 'Clothing', 'Train Ticket', 'Movie Night'][Math.floor(Math.random()*4)],
                amount: -(Math.random() * 200 + 15),
                category: cat.name,
                type: 'expense',
                currency: 'EUR'
            });
        }
        if (Math.random() < 0.01) {
            const bigCategories = ['Travel', 'Electronics & Gadgets', 'Maintenance & Repairs'];
            allTransactions.push({
                id: `txn-${uuidv4()}`,
                accountId: spendingAccounts[Math.floor(Math.random() * 2)],
                date: new Date(cursorDate).toISOString().split('T')[0],
                description: ['Flight tickets', 'New Laptop', 'Car Repair'][Math.floor(Math.random()*3)],
                amount: -(Math.random() * 1000 + 300),
                category: bigCategories[Math.floor(Math.random() * bigCategories.length)],
                type: 'expense',
                currency: 'EUR'
            });
        }
        if (Math.random() < 0.02) {
             allTransactions.push({
                id: `txn-${uuidv4()}`,
                accountId: 'e88eba91-ae06-4f80-ac6a-efa1d3edb007',
                date: new Date(cursorDate).toISOString().split('T')[0],
                description: ['Tax Refund', 'Sold item online'][Math.floor(Math.random()*2)],
                amount: (Math.random() * 500 + 50),
                category: 'Refunds & Payback',
                type: 'income',
                currency: 'EUR'
            });
        }
        cursorDate.setDate(cursorDate.getDate() + 1);
    }
    
    let generatedInvestmentTransactions: InvestmentTransaction[] = [];
    const stocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 130 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 90 },
        { symbol: 'TSLA', name: 'Tesla, Inc.', basePrice: 150 },
        { symbol: 'MSFT', name: 'Microsoft Corporation', basePrice: 250 },
    ];
    let btcPrice = 20000;
    
    for (let i = 12; i > 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i * 3);
        
        const stock = stocks[Math.floor(Math.random() * stocks.length)];
        const priceFluctuation = 1 + (Math.random() - 0.3) * 0.5;
        const purchasePrice = stock.basePrice * priceFluctuation * (1 + (12-i)*0.05);
        generatedInvestmentTransactions.push({
            id: `inv-txn-${uuidv4()}`,
            accountId: '0cadcbe9-40bd-4a33-8db6-cd6ab1886d75',
            symbol: stock.symbol, name: stock.name,
            quantity: Math.random() * 5 + 1,
            price: purchasePrice,
            date: date.toISOString().split('T')[0],
            type: 'buy'
        });

        btcPrice = btcPrice * (1 + (Math.random() - 0.2) * 0.6);
        generatedInvestmentTransactions.push({
             id: `inv-txn-${uuidv4()}`,
            accountId: '0163d353-d627-42d0-9bda-d83eb76fb0b1',
            symbol: 'BTC', name: 'Bitcoin',
            quantity: Math.random() * 0.1 + 0.01,
            price: btcPrice,
            date: date.toISOString().split('T')[0],
            type: 'buy'
        });
    }

    const finalAccounts = JSON.parse(JSON.stringify(initialAccounts));
    const accountBalances: Record<string, number> = finalAccounts.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr.balance;
        return acc;
    }, {});
    
    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    allTransactions.forEach(tx => {
        if (accountBalances[tx.accountId] !== undefined) {
             accountBalances[tx.accountId] += tx.amount;
        }
    });

    finalAccounts.forEach((acc: Account) => {
        acc.balance = parseFloat(accountBalances[acc.id].toFixed(acc.currency === 'BTC' ? 8 : 2));
    });

    const finalRecurringTransactions = recurringTemplates.map((template, i) => {
        let nextDueDate = new Date(template.startDate);
        if(template.dueDateOfMonth) nextDueDate.setDate(template.dueDateOfMonth);

        while (nextDueDate <= today) {
             switch (template.frequency) {
                case 'monthly': nextDueDate.setMonth(nextDueDate.getMonth() + (template.frequencyInterval || 1)); break;
                default: nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
            }
        }
        return {
            ...template,
            id: `rec-${i+1}`,
            nextDueDate: nextDueDate.toISOString().split('T')[0]
        } as RecurringTransaction;
    });

    return {
        MOCK_ACCOUNTS: finalAccounts,
        MOCK_TRANSACTIONS: allTransactions,
        MOCK_INVESTMENT_TRANSACTIONS: generatedInvestmentTransactions,
        MOCK_RECURRING_TRANSACTIONS: finalRecurringTransactions,
    };
};

const { 
    MOCK_ACCOUNTS, 
    MOCK_TRANSACTIONS, 
    MOCK_INVESTMENT_TRANSACTIONS, 
    MOCK_RECURRING_TRANSACTIONS 
} = generateMockData();

export { MOCK_ACCOUNTS, MOCK_TRANSACTIONS, MOCK_INVESTMENT_TRANSACTIONS, MOCK_RECURRING_TRANSACTIONS };


export const MOCK_FINANCIAL_GOALS: FinancialGoal[] = [
    { id: 'goal-1', name: 'Vacation to Japan', type: 'one-time', transactionType: 'expense', amount: 5000, currentAmount: 1250, date: '2026-04-01', currency: 'EUR' },
    { id: 'goal-2', name: 'Emergency Fund', type: 'one-time', transactionType: 'expense', amount: 10000, currentAmount: 4000, date: '2027-01-01', currency: 'EUR' },
    { id: 'goal-3', name: 'New Car Downpayment', type: 'one-time', transactionType: 'expense', amount: 8000, currentAmount: 7500, date: '2025-12-01', currency: 'EUR' },
];

export const MOCK_BUDGETS: Budget[] = [
    { id: 'bud-1', categoryName: 'Food & Groceries', amount: 800, period: 'monthly', currency: 'EUR' },
    { id: 'bud-2', categoryName: 'Shopping', amount: 400, period: 'monthly', currency: 'EUR' },
    { id: 'bud-3', categoryName: 'Transportation', amount: 250, period: 'monthly', currency: 'EUR' },
];

export const MOCK_IMPORT_EXPORT_HISTORY: ImportExportHistoryItem[] = [
    { id: 'hist-1', type: 'import', dataType: 'transactions', fileName: 'import_oct23_2025.csv', date: '2025-10-23T11:57:00Z', status: 'Complete', itemCount: 152 },
    { id: 'hist-2', type: 'import', dataType: 'transactions', fileName: 'import_oct23_2025_v2.csv', date: '2025-10-23T11:46:00Z', status: 'Complete', itemCount: 88 },
    { id: 'hist-3', type: 'export', dataType: 'all', fileName: 'sure_export_20251023_093640.zip', date: '2025-10-23T11:36:00Z', status: 'Failed', itemCount: 0 },
];

export const ACCOUNT_ICON_LIST: string[] = [
    'account_balance', 'savings', 'credit_card', 'trending_up', 'request_quote', 'home', 'currency_bitcoin', 'directions_car', 'palette', 'school', 'receipt_long', 'category', 'wallet', 'paid', 'account_balance_wallet', 'monetization_on', 'euro_symbol', 'payments', 'store', 'apartment', 'business_center', 'cottage', 'flight', 'local_gas_station', 'local_mall', 'restaurant', 'shopping_cart', 'work', 'build'
];

export const CATEGORY_ICON_LIST: string[] = [
    'restaurant', 'local_cafe', 'local_bar', 'shopping_cart', 'local_mall', 'store', 'house', 'apartment',
    'home_work', 'paid', 'savings', 'trending_up', 'credit_card', 'receipt_long', 'request_quote',
    'flight', 'directions_car', 'train', 'local_taxi', 'commute', 'local_gas_station', 'ev_station', 'local_shipping',
    'healing', 'medication', 'local_hospital', 'health_and_safety', 'monitor_heart', 'volunteer_activism',
    'subscriptions', 'movie', 'music_note', 'sports_esports', 'stadia_controller', 'fitness_center', 'sports_soccer',
    'phone_iphone', 'computer', 'desktop_windows', 'devices', 'videogame_asset', 'checkroom', 'styler', 'diamond', 'wc',
    'child_care', 'pets', 'school', 'card_giftcard', 'redeem', 'celebration', 'family_restroom', 'construction',
    'attach_money', 'work', 'payments', 'account_balance', 'currency_exchange', 'show_chart', 'sell',
    'miscellaneous_services', 'emergency', 'report', 'design_services'
];
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Category, Transaction, Settings, InsertCategory, InsertTransaction, BackupData } from '@shared/schema';
import { db, initializeDB } from '@/lib/db';
import { getWeekRange, generateId } from '@/lib/utils';
import { generateKey, exportKey, importKey, encryptData, decryptData, arrayBufferToBase64, base64ToArrayBuffer } from '@/lib/crypto';

interface FinanceState {
  // Data
  categories: Category[];
  transactions: Transaction[];
  settings: Settings | null;
  
  // UI State
  isLoading: boolean;
  currentSection: string;
  isMobileMenuOpen: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  
  // Settings
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  
  // Categories
  addCategory: (category: InsertCategory) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Transactions
  addTransaction: (transaction: InsertTransaction) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Calculations
  getWeeklyIncome: (date?: Date) => number;
  getWeeklyExpenses: (date?: Date) => number;
  getAnnualIncome: (year?: number) => number;
  getAnnualExpenses: (year?: number) => number;
  getWeeklyProgress: (date?: Date) => { current: number; goal: number; percentage: number; remaining: number };
  getCategoryTotals: (startDate?: Date, endDate?: Date) => Record<string, number>;
  
  // Backup
  exportData: () => Promise<string>;
  importData: (encryptedData: string) => Promise<void>;
  
  // UI Actions
  setCurrentSection: (section: string) => void;
  toggleMobileMenu: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  devtools(
    (set, get) => ({
      // Initial state
      categories: [],
      transactions: [],
      settings: null,
      isLoading: true,
      currentSection: 'dashboard',
      isMobileMenuOpen: false,

      // Initialize
      initialize: async () => {
        try {
          await initializeDB();
          
          const [categories, transactions, settings] = await Promise.all([
            db.categories.toArray(),
            db.transactions.toArray(),
            db.settings.get('settings'),
          ]);

          set({
            categories,
            transactions,
            settings: settings || null,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to initialize:', error);
          set({ isLoading: false });
        }
      },

      // Settings
      updateSettings: async (settingsUpdate) => {
        const { settings } = get();
        if (!settings) return;

        const updatedSettings = {
          ...settings,
          ...settingsUpdate,
          updatedAt: new Date(),
        };

        await db.settings.put(updatedSettings);
        set({ settings: updatedSettings });
      },

      // Categories
      addCategory: async (categoryData) => {
        const category: Category = {
          ...categoryData,
          id: generateId(),
          createdAt: new Date(),
        };

        await db.categories.add(category);
        set((state) => ({
          categories: [...state.categories, category],
        }));
      },

      updateCategory: async (id, categoryUpdate) => {
        await db.categories.update(id, categoryUpdate);
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...categoryUpdate } : cat
          ),
        }));
      },

      deleteCategory: async (id) => {
        await db.categories.delete(id);
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        }));
      },

      // Transactions
      addTransaction: async (transactionData) => {
        const transaction: Transaction = {
          ...transactionData,
          id: generateId(),
          createdAt: new Date(),
        };

        await db.transactions.add(transaction);
        set((state) => ({
          transactions: [...state.transactions, transaction],
        }));
      },

      updateTransaction: async (id, transactionUpdate) => {
        await db.transactions.update(id, transactionUpdate);
        set((state) => ({
          transactions: state.transactions.map((trans) =>
            trans.id === id ? { ...trans, ...transactionUpdate } : trans
          ),
        }));
      },

      deleteTransaction: async (id) => {
        await db.transactions.delete(id);
        set((state) => ({
          transactions: state.transactions.filter((trans) => trans.id !== id),
        }));
      },

      // Calculations
      getWeeklyIncome: (date = new Date()) => {
        const { transactions, settings } = get();
        if (!settings) return 0;

        const { start, end } = getWeekRange(date, settings.weekStartsOn as 0);
        
        return transactions
          .filter((t) => t.type === 'income' && t.date >= start && t.date <= end)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getWeeklyExpenses: (date = new Date()) => {
        const { transactions, settings } = get();
        if (!settings) return 0;

        const { start, end } = getWeekRange(date, settings.weekStartsOn as 0);
        
        return transactions
          .filter((t) => t.type === 'expense' && t.date >= start && t.date <= end)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getAnnualIncome: (year = new Date().getFullYear()) => {
        const { transactions } = get();
        
        return transactions
          .filter((t) => t.type === 'income' && t.date.getFullYear() === year)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getAnnualExpenses: (year = new Date().getFullYear()) => {
        const { transactions } = get();
        
        return transactions
          .filter((t) => t.type === 'expense' && t.date.getFullYear() === year)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      getWeeklyProgress: (date = new Date()) => {
        const { settings, getWeeklyIncome } = get();
        if (!settings) return { current: 0, goal: 0, percentage: 0, remaining: 0 };

        const current = getWeeklyIncome(date);
        const goal = settings.weeklyGoal;
        const percentage = goal > 0 ? Math.min(100, Math.floor((current / goal) * 100)) : 0;
        const remaining = Math.max(0, goal - current);

        return { current, goal, percentage, remaining };
      },

      getCategoryTotals: (startDate?: Date, endDate?: Date) => {
        const { transactions } = get();
        
        const filteredTransactions = transactions.filter((t) => {
          if (startDate && t.date < startDate) return false;
          if (endDate && t.date > endDate) return false;
          return true;
        });

        return filteredTransactions.reduce((acc, transaction) => {
          const categoryId = transaction.categoryId;
          acc[categoryId] = (acc[categoryId] || 0) + transaction.amount;
          return acc;
        }, {} as Record<string, number>);
      },

      // Backup
      exportData: async () => {
        const { categories, transactions, settings } = get();
        
        const backupData: BackupData = {
          version: '1.0.0',
          exportDate: new Date(),
          categories,
          transactions,
          settings: settings!,
        };

        const key = await generateKey();
        const keyData = await exportKey(key);
        const { encrypted, iv } = await encryptData(JSON.stringify(backupData), key);

        const exportObj = {
          key: arrayBufferToBase64(keyData),
          iv: arrayBufferToBase64(iv),
          data: arrayBufferToBase64(encrypted),
        };

        return JSON.stringify(exportObj);
      },

      importData: async (encryptedData: string) => {
        try {
          const importObj = JSON.parse(encryptedData);
          const key = await importKey(base64ToArrayBuffer(importObj.key));
          const iv = base64ToArrayBuffer(importObj.iv);
          const encrypted = base64ToArrayBuffer(importObj.data);

          const decryptedData = await decryptData(encrypted, iv, key);
          const backupData: BackupData = JSON.parse(decryptedData);

          // Clear existing data
          await db.transaction('rw', db.categories, db.transactions, db.settings, async () => {
            await db.categories.clear();
            await db.transactions.clear();
            await db.settings.clear();

            // Import new data
            await db.categories.bulkAdd(backupData.categories);
            await db.transactions.bulkAdd(backupData.transactions);
            await db.settings.add(backupData.settings);
          });

          // Update store
          set({
            categories: backupData.categories,
            transactions: backupData.transactions,
            settings: backupData.settings,
          });
        } catch (error) {
          console.error('Failed to import data:', error);
          throw new Error('Falha ao importar dados. Verifique se o arquivo está correto.');
        }
      },

      // UI Actions
      setCurrentSection: (section) => {
        set({ currentSection: section, isMobileMenuOpen: false });
      },

      toggleMobileMenu: () => {
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
      },
    }),
    {
      name: 'finance-store',
    }
  )
);

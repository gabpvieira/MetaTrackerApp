import Dexie, { Table } from 'dexie';
import { Category, Transaction, Settings } from '@shared/schema';

export class FinanceDB extends Dexie {
  categories!: Table<Category>;
  transactions!: Table<Transaction>;
  settings!: Table<Settings>;

  constructor() {
    super('FinanceDB');
    
    this.version(1).stores({
      categories: 'id, name, type, createdAt',
      transactions: 'id, date, categoryId, type, amount, createdAt',
      settings: 'id'
    });
  }
}

export const db = new FinanceDB();

// Initialize default data
export async function initializeDB() {
  const existingSettings = await db.settings.get('settings');
  
  if (!existingSettings) {
    // Create default settings
    await db.settings.add({
      id: 'settings',
      weeklyGoal: 2500,
      weekStartsOn: 0, // Sunday
      theme: 'system',
      currency: 'BRL',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create default categories
    const defaultCategories: Omit<Category, 'id'>[] = [
      {
        name: 'Freelancing',
        type: 'income',
        color: '#3B82F6',
        icon: 'laptop-code',
        createdAt: new Date(),
      },
      {
        name: 'Investimentos',
        type: 'income',
        color: '#10B981',
        icon: 'chart-line',
        createdAt: new Date(),
      },
      {
        name: 'Alimentação',
        type: 'expense',
        color: '#EF4444',
        icon: 'shopping-cart',
        createdAt: new Date(),
      },
      {
        name: 'Transporte',
        type: 'expense',
        color: '#F59E0B',
        icon: 'car',
        createdAt: new Date(),
      }
    ];

    for (const category of defaultCategories) {
      await db.categories.add({
        ...category,
        id: crypto.randomUUID(),
      });
    }
  }
}

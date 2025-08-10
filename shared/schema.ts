import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["income", "expense"]),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve ser um hex válido"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  createdAt: z.date(),
});

export const transactionSchema = z.object({
  id: z.string(),
  date: z.date(),
  categoryId: z.string(),
  amount: z.number().positive("Valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  type: z.enum(["income", "expense"]),
  createdAt: z.date(),
});

export const settingsSchema = z.object({
  id: z.string().default("settings"),
  weeklyGoal: z.number().positive("Meta semanal deve ser positiva"),
  weekStartsOn: z.number().min(0).max(6).default(0), // 0 = Sunday
  theme: z.enum(["light", "dark", "system"]).default("system"),
  currency: z.string().default("BRL"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Insert schemas
export const insertCategorySchema = categorySchema.omit({ id: true, createdAt: true });
export const insertTransactionSchema = transactionSchema.omit({ id: true, createdAt: true });
export const insertSettingsSchema = settingsSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type Category = z.infer<typeof categorySchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Backup schema
export const backupSchema = z.object({
  version: z.string(),
  exportDate: z.date(),
  categories: z.array(categorySchema),
  transactions: z.array(transactionSchema),
  settings: settingsSchema,
});

export type BackupData = z.infer<typeof backupSchema>;

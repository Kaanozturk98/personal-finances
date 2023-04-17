import { Transaction } from "@prisma/client";

export type TransactionCreate = Omit<Transaction, "id" | "fingerprint">;

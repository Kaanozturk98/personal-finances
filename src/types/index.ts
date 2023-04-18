import { Transaction } from "@prisma/client";

export type TransactionCreate = Omit<Transaction, "id" | "fingerprint">;

export interface IconProps extends React.SVGProps<SVGSVGElement> {}

export interface TopLevelNavItemProps {
  href: string;
  children: React.ReactNode;
}

export interface Page {
  href?: string;
  title: string;
}

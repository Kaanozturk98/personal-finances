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

export type IColumnObject<T> = {
  key?: keyof T;
  label: string;
  sort?: boolean;
  type: "date" | "number" | "string" | "boolean" | "enum" | "reference";
  options?: string[];
  filter?: boolean;
  form?: boolean;
  fetchUrl?: string;
  hidden?: boolean;
};

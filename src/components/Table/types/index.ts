export type IColumnObject<T> = {
  key?: keyof T;
  label: string;
  sort?: boolean;
  type: "date" | "number" | "string" | "boolean" | "enum" | "reference";
  options?: string[];
  filter?: boolean;
};

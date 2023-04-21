export type IColumnObject<T> = {
  key?: keyof T;
  label: string;
  sort?: boolean;
};

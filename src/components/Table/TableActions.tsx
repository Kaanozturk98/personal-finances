// TableActions.tsx
import React from "react";
import { FieldValues } from "react-hook-form";
import { IColumnObject } from "@component/types";
import FilterButton from "./filter/FilterButton";
import Modal from "../Modal";
import { PlusIcon, SquaresPlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { capitalizeFirstLetter } from "@component/utils";
import Form from "../Form";
import AutoCategorizeTransactions from "./actions/AutoCategorizeTransactions";
import BulkUpdate from "./actions/BulkUpdate";
import MergeTransactions from "./actions/MergeTransactions";
import { TableState } from ".";

interface TableActionsProps<T extends FieldValues> {
  columns: IColumnObject<T>[];
  handleFilterChange: (key: keyof T, value: any) => void;
  checkedRowsData: T[];
  bulkUpdate: boolean;
  add: boolean;
  route: string;
  searchKey: keyof T;
  fetchKey: number;
  setFetchKey: (key: number) => void;
  setCheckedRows: (rows: Record<string, T>) => void;
  tableState: TableState<T>;
  createStateParams: (state: TableState<T>) => URLSearchParams;
}

const TableActions = <T extends FieldValues>({
  columns,
  handleFilterChange,
  checkedRowsData,
  bulkUpdate,
  add,
  route,
  searchKey,
  fetchKey,
  setFetchKey,
  setCheckedRows,
  tableState,
  createStateParams,
}: TableActionsProps<T>) => {
  const isNotAtleastTwoChecked = checkedRowsData.length < 2;

  const isParentTransactionChecked =
    route === "transactions"
      ? !!Object.values(checkedRowsData).filter(
          (row) => row.subTransactions.length
        ).length
      : false;

  const mergeBtnDisabled = isNotAtleastTwoChecked || isParentTransactionChecked;

  return (
    <div className="flex justify-between items-center mb-4 sticky top-0 z-20 pt-2 pb-1.5 backdrop-blur-lg before:absolute before:inset-0 before:bg-gradient-to-b before:from-gray-600 before:to-transparent before:z-[-1]">
      <div className="flex space-x-4">
        {columns.some((column) => column.filter) && (
          <FilterButton<T>
            columns={columns}
            onFilterChange={handleFilterChange}
            search
            tableState={tableState}
            createStateParams={createStateParams}
          />
        )}
      </div>

      <div className="flex space-x-4 items-center">
        <Modal
          title="Selected Transactions"
          trigger={
            <button
              className={clsx(
                "px-3 py-2 text-base-content rounded-md h-10 transition-all duration-300 shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-accent",
                "disabled:btn-disabled",
                checkedRowsData.length === 0
                  ? "hidden"
                  : "bg-transparent hover:bg-base-200"
              )}
              disabled={checkedRowsData.length === 0}
              type="button"
            >
              {checkedRowsData.length} selected
            </button>
          }
          disabled={checkedRowsData.length === 0}
        >
          <ul className="list-disc pl-5 space-y-1">
            {checkedRowsData.map((row) => (
              <li key={row.id}>{row[searchKey]}</li>
            ))}
          </ul>
        </Modal>

        {bulkUpdate && (
          <BulkUpdate<T>
            columns={columns}
            checkedRowsData={checkedRowsData}
            route={`cud-${route}`}
            onSuccess={() => {
              setFetchKey(fetchKey + 1);
              setCheckedRows({});
            }}
          />
        )}
        {route === "transactions" && (
          <AutoCategorizeTransactions<T>
            checkedRowsData={checkedRowsData}
            onSuccess={() => {
              setFetchKey(fetchKey + 1);
              setCheckedRows({});
            }}
          />
        )}
        {route === "transactions" && (
          <Modal
            title={`Merge ${capitalizeFirstLetter(route)}`}
            disabled={mergeBtnDisabled}
            trigger={
              <button
                className={clsx(
                  "px-3 py-2 bg-base-300 hover:bg-base-200 text-base-content rounded-md h-10 transition-all duration-300",
                  "disabled:btn-disabled"
                )}
                disabled={mergeBtnDisabled}
              >
                <SquaresPlusIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
                <span className="align-middle">Merge</span>
              </button>
            }
          >
            <MergeTransactions
              columns={columns as any}
              checkedRowsData={checkedRowsData as any}
            />
          </Modal>
        )}
        {add && (
          <Modal
            title={`Add ${capitalizeFirstLetter(route)}`}
            trigger={
              <button className="px-3 py-2 bg-base-300 hover:bg-base-200 text-base-content rounded-md h-10">
                <PlusIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
                <span className="align-middle">Add</span>
              </button>
            }
          >
            <Form<T> route={`cud-${route}`} columns={columns} />
          </Modal>
        )}
        {
          // if delete is enabled, add a delete selected button here
        }
      </div>
    </div>
  );
};

export default TableActions;

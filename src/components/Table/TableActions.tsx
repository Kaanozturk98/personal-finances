import React from "react";
import { FieldValues } from "react-hook-form";
import { IColumnObject } from "@/types";
import FilterButton from "./filter/FilterButton";
import Modal from "../Modal";
import { PlusIcon, SquaresPlusIcon } from "@heroicons/react/24/outline";

import { capitalizeFirstLetter } from "@/utils";
import Form from "../Form";
import AutoCategorizeTransactions from "./actions/AutoCategorizeTransactions";
import BulkUpdate from "./actions/BulkUpdate";
import MergeTransactions from "./actions/MergeTransactions";
import { TableState } from ".";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

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
  formatPayload?: (data: Partial<T>) => Partial<T>;
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
  formatPayload,
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
    <div className="flex justify-between items-center mb-4">
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
            <Button
              className={cn(checkedRowsData.length === 0 && "hidden")}
              disabled={checkedRowsData.length === 0}
            >
              {checkedRowsData.length} selected
            </Button>
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
            formatPayload={formatPayload ?? undefined}
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
              <Button disabled={mergeBtnDisabled}>
                <SquaresPlusIcon className="w-5 h-5 mr-1.5" />
                Merge
              </Button>
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
              <Button>
                <PlusIcon className="w-5 h-5 mr-1.5" />
                Add
              </Button>
            }
          >
            <Form<T> route={`cud-${route}`} columns={columns} />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default TableActions;

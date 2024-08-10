import React from "react";
import { FieldValues } from "react-hook-form";
import SkeletonRow from "./SkeletonRows";
import TruncatedText from "./TruncatedText";
import CheckboxInput from "../Inputs/CheckboxInput";
import { IColumnObject } from "@/types";

interface TableBodyProps<T extends FieldValues> {
  loading: boolean;
  perPage: number;
  formattedData: string[][];
  columnsToRender: IColumnObject<T>[];
  checkbox: boolean;
  checkedRows: Record<string, T>;
  handleCheckboxChange: (id: string, value: boolean) => void;
}

const TableBody = <T extends FieldValues>({
  loading,
  perPage,
  formattedData,
  columnsToRender,
  checkbox,
  checkedRows,
  handleCheckboxChange,
}: TableBodyProps<T>) => {
  return (
    <tbody>
      {loading ? (
        Array(perPage)
          .fill(null)
          .map((_, index) => (
            <SkeletonRow
              key={index}
              columns={columnsToRender.length + (checkbox ? 1 : 0)}
            />
          ))
      ) : formattedData.length > 0 ? (
        formattedData.map((row, rowIndex) => {
          const objectId = row[0];
          return (
            <tr key={rowIndex} className="h-12  transition-colors">
              {checkbox && (
                <td className="p-2">
                  <CheckboxInput
                    id={`checkbox-${rowIndex}`}
                    checked={!!checkedRows[objectId]}
                    onChange={(value) => handleCheckboxChange(objectId, value)}
                    label=""
                  />
                </td>
              )}
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-2">
                  <TruncatedText text={cell} />
                </td>
              ))}
            </tr>
          );
        })
      ) : (
        <tr>
          <td
            colSpan={columnsToRender.length + (checkbox ? 1 : 0)}
            className="text-center py-4"
          >
            Nothing to see here 🍃
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default TableBody;

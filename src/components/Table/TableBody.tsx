import { FieldValues } from "react-hook-form";
import SkeletonRow from "./SkeletonRows";
import TruncatedText from "./TruncatedText";
import CheckboxInput from "../Inputs/CheckboxInput";
import { IColumnObject } from "@/types";

interface TableBodyProps<T extends FieldValues> {
  columnWidths: number[];

  loading: boolean;
  perPage: number;
  formattedData: string[][];
  columnsToRender: IColumnObject<T>[];
  checkbox: boolean;
  checkedRows: Record<string, T>;
  handleCheckboxChange: (id: string, value: boolean) => void;
}

const TableBody = <T extends FieldValues>({
  columnWidths,
  loading,
  perPage,
  formattedData,
  columnsToRender,
  checkbox,
  checkedRows,
  handleCheckboxChange,
}: TableBodyProps<T>) => {
  return (
    <tbody className="[&_tr:last-child]:border-0">
      {loading ? (
        Array(perPage)
          .fill(null)
          .map((_, index) => (
            <SkeletonRow
              key={index}
              columns={columnsToRender.length + (checkbox ? 1 : 0)}
              columnWidths={columnWidths}
            />
          ))
      ) : formattedData.length > 0 ? (
        formattedData.map((row, rowIndex) => {
          const objectId = row[0];
          return (
            <tr
              key={rowIndex}
              className="h-11 transition-colors hover:bg-secondary/75 border-b"
            >
              {checkbox && (
                <td className="p-2">
                  <CheckboxInput
                    id={`checkbox-${rowIndex}`}
                    checked={!!checkedRows[objectId]}
                    onChange={(value) => handleCheckboxChange(objectId, value)}
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

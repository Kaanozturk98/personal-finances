import React, { useState } from "react";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";
import { IColumnObject } from "@component/types";
import useToast from "../../Toast";
import SelectInput from "../../Inputs/SelectInput";
import DateInput from "../../Inputs/DateInput";
import AutocompleteInput from "../../Inputs/AutocompleteInput";
import NumberInput from "../../Inputs/NumberInput";
import TextInput from "../../Inputs/TextInput";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import clsx from "clsx";

interface BulkEditProps<T> {
  columns: IColumnObject<T>[];
  checkedRowsData: T[];
  route: string;
  formatPayload?: (data: Partial<T>) => Partial<T>;
  onSuccess?: () => void;
}

const BulkEdit = <T,>({
  columns,
  checkedRowsData,
  route,
  formatPayload,
  onSuccess,
}: BulkEditProps<T>) => {
  const [showForm, setShowForm] = useState(false);
  const formMethods = useForm();
  const showToast = useToast();

  const handleBulkEditClick = () => {
    setShowForm(!showForm);
  };

  const onSubmit = async (updates: FieldValues) => {
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value)
    );

    const requests = checkedRowsData.map((row) => {
      const payload = Object.entries(filteredUpdates).reduce(
        (changedFields, [key, value]) => {
          if (value !== (row as any)[key]) {
            const isReferenceKey = columns.find((column) => column.key === key);
            (changedFields as any)[key] = !isReferenceKey
              ? value
              : value === ""
              ? null
              : value;
          }
          return changedFields;
        },
        { id: parseInt((row as any).id) } as unknown as Partial<T>
      );

      const formattedPayload = formatPayload
        ? formatPayload(payload as Partial<T>)
        : payload;

      console.log("formattedPayload", formattedPayload);

      return fetch(`/api/${route}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedPayload),
      });
    });

    Promise.all(requests).then((responses) => {
      if (responses.every((r) => r.ok)) {
        showToast("Update successful", "success");
        onSuccess && onSuccess();
        onSuccess && setShowForm(false);
      } else {
        showToast("Update failed", "error");
      }
    });
  };

  return (
    <div className="relative inline-block">
      <button
        className={clsx(
          "px-3 py-2 bg-base-300 hover:bg-base-200 text-base-content rounded-md h-10 transition-all duration-300",
          "disabled:btn-disabled"
        )}
        disabled={checkedRowsData.length === 0}
        onClick={handleBulkEditClick}
      >
        <RectangleGroupIcon className="w-5 h-5 inline-block mr-1.5 align-middle" />
        <span className="align-middle">Update</span>
      </button>
      {showForm && (
        <FormProvider {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(onSubmit)}
            className="absolute z-50 mt-2 p-4 bg-base-200 shadow-2xl rounded border border-content flex flex-col space-y-4"
          >
            {columns.map((column) => {
              if (!column.form) return null;
              const { key, label, type } = column;

              let inputComponent;
              switch (type) {
                case "string":
                  inputComponent = (
                    <TextInput
                      id={String(key)}
                      name={String(key)}
                      label={label}
                    />
                  );
                  break;
                case "number":
                  inputComponent = (
                    <NumberInput
                      id={String(key)}
                      name={String(key)}
                      label={label}
                    />
                  );
                  break;
                case "boolean":
                  inputComponent = (
                    <SelectInput
                      id={String(key)}
                      name={String(key)}
                      label={label}
                      boolean
                    />
                  );
                  break;
                case "date":
                  inputComponent = (
                    <DateInput
                      id={String(key)}
                      name={String(key)}
                      label={label}
                    />
                  );
                  break;
                case "enum":
                  inputComponent = (
                    <SelectInput
                      id={String(key)}
                      name={String(key)}
                      label={label}
                      optionValues={column.options}
                    />
                  );
                  break;
                case "reference":
                  inputComponent = (
                    <AutocompleteInput
                      id={String(key)}
                      name={String(key)}
                      label={label}
                      fetchUrl={column.fetchUrl as string}
                    />
                  );
                  break;
                default:
                  inputComponent = null;
              }

              return <div key={String(key)}>{inputComponent}</div>;
            })}
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </FormProvider>
      )}
    </div>
  );
};

export default BulkEdit;

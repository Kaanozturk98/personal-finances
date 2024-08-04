import React, { useState } from "react";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";
import { IColumnObject } from "@component/types";
import useToast from "@component/components/Toast";
import SelectInput from "@component/components/Inputs/SelectInput";
import DateInput from "@component/components/Inputs/DateInput";
import AutocompleteInput from "@component/components/Inputs/AutocompleteInput";
import NumberInput from "@component/components/Inputs/NumberInput";
import TextInput from "@component/components/Inputs/TextInput";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { Button } from "@component/components/ui/button";
import { cn } from "@component/lib/utils";

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
      Object.entries(updates).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
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
        setShowForm(false); // Only hide the form when the update is successful
      } else {
        showToast("Update failed", "error");
      }
    });
  };

  return (
    <div className="relative inline-block">
      <Button
        onClick={handleBulkEditClick}
        disabled={checkedRowsData.length === 0}
        variant="outline"
        className={cn(
          "flex items-center justify-center h-10",
          "px-3 py-2 transition-all duration-300"
        )}
      >
        <RectangleGroupIcon className="w-5 h-5 mr-1.5" />
        Update
      </Button>
      {showForm && (
        <FormProvider {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(onSubmit)}
            className="absolute z-50 mt-2 p-4 bg-white dark:bg-gray-900 shadow-2xl rounded-md border border-gray-200 dark:border-gray-700 flex flex-col space-y-4"
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
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </FormProvider>
      )}
    </div>
  );
};

export default BulkEdit;

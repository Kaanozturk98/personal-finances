import React, { useState } from "react";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";
import { IColumnObject } from "@/types";
import useToast from "@/components/Toast";
import SelectInput from "@/components/Inputs/SelectInput";
import DateInput from "@/components/Inputs/DateInput";
import AutocompleteInput from "@/components/Inputs/AutocompleteInput";
import NumberInput from "@/components/Inputs/NumberInput";
import TextInput from "@/components/Inputs/TextInput";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const formMethods = useForm();
  const showToast = useToast();

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
      } else {
        showToast("Update failed", "error");
      }
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={"sm"}
          variant={"outline"}
          disabled={checkedRowsData.length === 0}
        >
          <RectangleGroupIcon className="w-5 h-5 mr-1.5" />
          Update
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <FormProvider {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(onSubmit)}
            className="flex flex-col space-y-4"
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
            <Button type="submit" className="w-full mt-4">
              Submit
            </Button>
          </form>
        </FormProvider>
      </PopoverContent>
    </Popover>
  );
};

export default BulkEdit;

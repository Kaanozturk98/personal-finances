import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useFormContext, FieldValues, Controller } from "react-hook-form";
import InputWrapper from "./InputWrapper";
import { FieldError } from "react-hook-form/dist/types/errors";
import { Category } from "@prisma/client";

interface AutocompleteSelectProps {
  id: string;
  name?: string;
  additionalClassName?: string;
  value?: string | undefined;
  onChange?: (value: string | null) => void;
  label: string;
  fetchUrl: string;
}

type OptionType = { value: string; label: string };

const AutocompleteInput: React.FC<AutocompleteSelectProps> = ({
  id,
  name,
  additionalClassName,
  value,
  onChange,
  label,
  fetchUrl,
}) => {
  console.log("name", name);
  const [options, setOptions] = useState<OptionType[]>([]);
  const formContext = useFormContext<FieldValues>();
  const isControlled = value !== undefined && onChange !== undefined;
  const error =
    name &&
    formContext &&
    (formContext.formState.errors[name] as FieldError | undefined);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const searchParams = new URLSearchParams();
        searchParams.set("page", "1");
        searchParams.set("limit", "5");
        searchParams.set("sortBy", "name");
        searchParams.set("sortOrder", "asc");

        const urlString = `/api/${fetchUrl}?${searchParams.toString()}`;

        const response = await fetch(urlString);
        const { data } = await response.json();
        const opts = [
          ...data.map((item: Category) => ({
            label: item.name,
            value: item.id,
          })),
        ];
        setOptions(opts);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, [fetchUrl]);

  const handleChange = (selectedOption: OptionType | null) => {
    const selectedValue = selectedOption ? selectedOption.value : "";
    if (onChange) {
      onChange(selectedValue);
    }
    if (name && !isControlled && formContext) {
      formContext.setValue(name, selectedValue);
    }
  };

  return (
    <InputWrapper id={id} label={label}>
      {name && !isControlled && formContext ? (
        <Controller
          control={formContext.control}
          name={name as string}
          render={({ field }) => (
            <Select
              {...field}
              inputId={id}
              className={additionalClassName}
              value={options.find((option) => option.label === field.value)}
              onChange={(selectedOption) => {
                handleChange(selectedOption);
                field.onChange(selectedOption ? selectedOption.value : "");
              }}
              options={options}
              isClearable
            />
          )}
        />
      ) : (
        <Select
          inputId={id}
          className={additionalClassName}
          value={
            isControlled
              ? options.find((option) => option.label === value)
              : undefined
          }
          onChange={handleChange}
          options={options}
          isClearable
        />
      )}
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default AutocompleteInput;

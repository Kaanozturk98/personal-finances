import React, { useEffect, useState } from "react";
import Select, {
  CSSObjectWithLabel,
  GroupBase,
  InputProps,
  StylesConfig,
} from "react-select";
import { useFormContext, FieldValues, Controller } from "react-hook-form";
import InputWrapper from "./InputWrapper";
import { FieldError } from "react-hook-form/dist/types/errors";
import { Category } from "@prisma/client";
import clsx from "clsx";

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

/* const customStyles: StylesConfig<any, false, GroupBase<any>> = {
  valueContainer: (provided: CSSObjectWithLabel) => ({
    ...provided,
    color: "hsl(220, 13.376%, 69.216%)",
  }),
  control: (provided: CSSObjectWithLabel, state: any) => ({
    ...provided,
    borderRadius: "0.375rem",
    minHeight: "2.5rem",
    background: state.isFocused ? "hsl(209, 54%, 23%)" : "hsl(210, 23%, 13%)",
    borderColor: state.isFocused ? "hsl(210, 23%, 13%)" : "hsl(210, 11%, 6%)",
    boxShadow: state.isFocused ? "0 0 0 1px hsl(210, 23%, 13%)" : "none",
    color: "hsl(220, 13.376%, 69.216%)",
    "&:hover": {
      borderColor: "hsl(210, 23%, 13%)",
    },
  }),
  input: (
    provided: CSSObjectWithLabel,
    props: InputProps<any, false, GroupBase<any>>
  ) => ({
    ...provided,
    color: "hsl(220, 13.376%, 69.216%)",
    height: "40px",
  }),
  menu: (provided: CSSObjectWithLabel) => ({
    ...provided,
    background: "hsl(210, 23%, 13%)",
    borderRadius: "0.375rem",
  }),
  option: (provided, state) => ({
    ...provided,
    background: state.isSelected
      ? "hsl(209, 54%, 23%)"
      : state.isFocused
      ? "hsl(210, 11%, 6%)"
      : "hsl(210, 23%, 13%)",
    color: "hsl(220, 13.376%, 69.216%)",
    cursor: "pointer",
    borderRadius: "0.375rem",
    "&:active": {
      backgroundColor: "hsl(209, 54%, 23%)",
    },
  }),
}; */

const AutocompleteInput: React.FC<AutocompleteSelectProps> = ({
  id,
  name,
  additionalClassName,
  value,
  onChange,
  label,
  fetchUrl,
}) => {
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
              /* styles={customStyles} */
            />
          )}
        />
      ) : (
        <Select
          inputId={id}
          className={clsx(additionalClassName)}
          value={
            isControlled
              ? options.find((option) => option.label === value)
              : undefined
          }
          onChange={handleChange}
          options={options}
          isClearable
          /* styles={customStyles} */
        />
      )}
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default AutocompleteInput;

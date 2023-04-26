import clsx from "clsx";
import React from "react";
import { useFormContext, FieldValues, RegisterOptions } from "react-hook-form";
import InputWrapper from "./InputWrapper";
import { FieldError } from "react-hook-form/dist/types/errors";
import { capitalizeFirstLetter } from "@component/utils";

interface SelectInputProps {
  id: string;
  name?: string;
  rules?: RegisterOptions;
  additionalClassName?: string;
  value?: string | undefined;
  onChange?: (value: string) => void;
  optionValues?: string[];
  boolean?: boolean;
  label: string;
  clearOption?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  id,
  name,
  rules,
  additionalClassName,
  value,
  onChange,
  optionValues,
  boolean = false,
  label,
  clearOption = true,
}) => {
  const formContext = useFormContext<FieldValues>();

  const isControlled = value !== undefined && onChange !== undefined;
  const error =
    name &&
    formContext &&
    (formContext.formState.errors[name] as FieldError | undefined);

  const combinedOptionValues = boolean ? ["true", "false"] : optionValues;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const options = [
    ...(combinedOptionValues?.map((option) => ({
      label: capitalizeFirstLetter(option),
      value: option,
    })) || []),
  ];

  if (clearOption) options.unshift({ label: "Select", value: "" });

  return (
    <InputWrapper id={id} label={label}>
      <select
        {...(name && !isControlled && formContext
          ? formContext.register(name, rules)
          : {})}
        id={id}
        name={name}
        className={clsx(
          "select select-bordered w-full min-w-[200px]",
          additionalClassName
        )}
        value={isControlled ? value : undefined}
        onChange={isControlled ? handleChange : undefined}
      >
        {options?.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default SelectInput;

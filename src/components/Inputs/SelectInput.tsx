import React from "react";
import { useFormContext, FieldValues, RegisterOptions } from "react-hook-form";
import clsx from "clsx";
import InputWrapper from "./InputWrapper";
import { FieldError } from "react-hook-form/dist/types/errors";
import { capitalizeFirstLetter } from "@component/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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

  const handleChange = (value: string) => {
    if (onChange) {
      onChange(value);
    }
  };

  // Map options with a proper non-empty string for "clear" option
  const options = [
    ...(combinedOptionValues?.map((option) => ({
      label: capitalizeFirstLetter(option),
      value: option,
    })) || []),
  ];

  // Change the "Select" option to a non-empty string like "none"
  if (clearOption) options.unshift({ label: "Select", value: "none" });

  return (
    <InputWrapper id={id} label={label}>
      <Select
        onValueChange={isControlled ? handleChange : undefined}
        value={isControlled ? value : undefined}
        {...(name && !isControlled && formContext
          ? formContext.register(name, rules)
          : {})}
      >
        <SelectTrigger
          className={clsx("w-full min-w-[200px]", additionalClassName)}
        >
          {/* Use the placeholder prop for an initial "Select an option" state */}
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {options.map((option, index) => (
              <SelectItem key={index} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default SelectInput;

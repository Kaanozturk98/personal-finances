// SelectInput.tsx
import clsx from "clsx";
import React from "react";
import InputWrapper from "./InputWrapper";

interface SelectInputProps {
  id: string;
  additionalClassName?: string;
  value: string | undefined;
  onChange: (value: string) => void; // Update this prop
  options?: { value: string; label: string }[];
  boolean?: boolean;
  label: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  id,
  additionalClassName,
  value,
  onChange,
  options,
  boolean = false,
  label,
}) => {
  const combinedOptions = boolean
    ? [
        { value: "", label: "Select" },
        { value: "true", label: "True" },
        { value: "false", label: "False" },
      ]
    : options;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value); // Pass the value directly
  };

  return (
    <InputWrapper id={id} label={label}>
      <select
        id={id}
        className={clsx(
          "select select-bordered w-full min-w-[200px]",
          additionalClassName
        )}
        value={value}
        onChange={handleChange}
      >
        {combinedOptions?.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </InputWrapper>
  );
};

export default SelectInput;

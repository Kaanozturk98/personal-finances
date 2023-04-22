// DateInput.tsx
import React from "react";
import clsx from "clsx";
import InputWrapper from "./InputWrapper";

interface DateInputProps {
  id: string;
  label: string;
  value: string;
  additionalClassName?: string;
  onChange: (value: string) => void;
}

const DateInput: React.FC<DateInputProps> = ({
  id,
  label,
  value,
  additionalClassName,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <InputWrapper id={id} label={label}>
      <input
        id={id}
        type="date"
        className={clsx("input input-bordered w-full", additionalClassName)}
        value={value}
        onChange={handleChange}
      />
    </InputWrapper>
  );
};

export default DateInput;

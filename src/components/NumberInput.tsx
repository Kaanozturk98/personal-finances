import clsx from "clsx";
import React from "react";
import InputWrapper from "./InputWrapper";

interface NumberInputProps {
  id: string;
  value: number | null;
  onChange: (value: string) => void;
  additionalClassName?: string;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  id,
  value,
  onChange,
  additionalClassName,
  min,
  max,
  step,
  label,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <InputWrapper id={id} label={label}>
      <input
        id={id}
        type="number"
        className={clsx(
          "input input-bordered w-full min-w-[200px]",
          additionalClassName
        )}
        value={value === null ? "" : value.toString()}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
      />
    </InputWrapper>
  );
};

export default NumberInput;

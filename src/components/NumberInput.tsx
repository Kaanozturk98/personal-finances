import clsx from "clsx";
import React from "react";
import { useFormContext, FieldValues, RegisterOptions } from "react-hook-form";
import InputWrapper from "./InputWrapper";
import { FieldError } from "react-hook-form/dist/types/errors";

interface NumberInputProps {
  id: string;
  name?: string;
  rules?: RegisterOptions;
  value?: number | null;
  onChange?: (value: number) => void;
  additionalClassName?: string;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  id,
  name,
  rules,
  value,
  onChange,
  additionalClassName,
  min,
  max,
  step,
  label,
}) => {
  const formContext = useFormContext<FieldValues>();

  const isControlled = value !== undefined && onChange !== undefined;
  const error =
    name &&
    formContext &&
    (formContext.formState.errors[name] as FieldError | undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(parseFloat(e.target.value));
    }
  };

  return (
    <InputWrapper id={id} label={label}>
      <input
        {...(name && !isControlled && formContext
          ? formContext.register(name, rules)
          : {})}
        id={id}
        name={name}
        type="number"
        className={clsx(
          "input input-bordered w-full min-w-[200px]",
          additionalClassName
        )}
        value={
          isControlled
            ? value === null || value === undefined
              ? ""
              : value.toString()
            : undefined
        }
        onChange={isControlled ? handleChange : undefined}
        min={min}
        max={max}
        step={step}
      />
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default NumberInput;

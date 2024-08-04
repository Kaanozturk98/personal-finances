import React from "react";
import { useFormContext, FieldValues, RegisterOptions } from "react-hook-form";
import clsx from "clsx";
import InputWrapper from "./InputWrapper";
import { FieldError } from "react-hook-form/dist/types/errors";
import { Input } from "../ui/input";

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
      <Input
        {...(name && !isControlled && formContext
          ? formContext.register(name, rules)
          : {})}
        id={id}
        name={name}
        type="number"
        className={clsx(
          "w-full min-w-[200px] border rounded-md shadow-sm",
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
        aria-invalid={error ? "true" : "false"}
      />
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default NumberInput;

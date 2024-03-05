import React from "react";
import clsx from "clsx";
import { useFormContext, FieldValues, RegisterOptions } from "react-hook-form";
import InputWrapper from "./InputWrapper";
import { FieldError } from "react-hook-form/dist/types/errors";

interface DateInputProps {
  id: string;
  name?: string;
  rules?: RegisterOptions;
  label: string;
  value?: string | undefined;
  additionalClassName?: string;
  onChange?: (value: string) => void;
}

const DateInput: React.FC<DateInputProps> = ({
  id,
  name,
  rules,
  label,
  value,
  additionalClassName,
  onChange,
}) => {
  const formContext = useFormContext<FieldValues>();

  const isControlled = value !== undefined && onChange !== undefined;
  const error =
    name &&
    formContext &&
    (formContext.formState.errors[name] as FieldError | undefined);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.value);
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
        type="date"
        className={clsx("input input-bordered w-full", additionalClassName)}
        value={isControlled ? value : undefined}
        onChange={isControlled ? handleChange : undefined}
      />
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default DateInput;

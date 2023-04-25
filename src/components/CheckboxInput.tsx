import clsx from "clsx";
import React from "react";
import {
  useFormContext,
  RegisterOptions,
  FieldError,
  FieldValues,
} from "react-hook-form";

import InputWrapper from "./InputWrapper";

interface CheckboxInputProps {
  id: string;
  name?: string;
  rules?: RegisterOptions;
  additionalClassName?: string;
  label: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  id,
  name,
  rules,
  additionalClassName,
  label,
  checked,
  onChange,
}) => {
  const formContext = useFormContext<FieldValues>();

  const isControlled = checked !== undefined && onChange !== undefined;
  const error =
    name &&
    formContext &&
    (formContext.formState.errors[name] as FieldError | undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
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
        type="checkbox"
        className={clsx("checkbox checkbox-sm", additionalClassName)}
        checked={isControlled ? checked : undefined}
        onChange={isControlled ? handleChange : undefined}
      />
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default CheckboxInput;

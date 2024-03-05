import clsx from "clsx";
import React, { useEffect, useRef } from "react";
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
  indeterminate?: boolean;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  id,
  name,
  rules,
  additionalClassName,
  label,
  checked,
  onChange,
  indeterminate = false,
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <InputWrapper id={id} label={label}>
      <input
        {...(name && !isControlled && formContext
          ? formContext.register(name, rules)
          : {})}
        ref={inputRef}
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

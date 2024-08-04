import React, { useEffect, useRef } from "react";
import {
  useFormContext,
  RegisterOptions,
  FieldError,
  FieldValues,
} from "react-hook-form";
import InputWrapper from "./InputWrapper";
import { cn } from "@component/lib/utils";

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
      <div className="flex items-center">
        <input
          {...(name && !isControlled && formContext
            ? formContext.register(name, rules)
            : {})}
          ref={inputRef}
          id={id}
          name={name}
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary",
            additionalClassName
          )}
          checked={isControlled ? checked : undefined}
          onChange={isControlled ? handleChange : undefined}
          aria-invalid={error ? "true" : "false"}
        />
        <label htmlFor={id} className="ml-2 text-sm text-gray-700">
          {label}
        </label>
      </div>
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default CheckboxInput;

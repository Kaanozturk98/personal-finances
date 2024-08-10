import React, { useEffect, useRef } from "react";
import {
  useFormContext,
  RegisterOptions,
  FieldError,
  FieldValues,
} from "react-hook-form";
import InputWrapper from "./InputWrapper";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxInputProps {
  id: string;
  name?: string;
  rules?: RegisterOptions;
  additionalClassName?: string;
  label: string;
  checked?: boolean | "indeterminate";
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

  const handleChange = (value: boolean) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <InputWrapper id={id} label={label}>
      <div className="flex items-center">
        <Checkbox
          {...(name && !isControlled && formContext
            ? formContext.register(name, rules)
            : {})}
          id={id}
          checked={isControlled ? checked : undefined}
          onCheckedChange={isControlled ? handleChange : undefined}
          className={cn("h-4 w-4", additionalClassName)}
          aria-invalid={error ? "true" : "false"}
        />
        <label
          htmlFor={id}
          className="ml-2 text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      </div>
      {error && <p className="text-destructive mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default CheckboxInput;

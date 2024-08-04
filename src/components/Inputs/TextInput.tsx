import React from "react";
import {
  useFormContext,
  RegisterOptions,
  FieldError,
  FieldValues,
} from "react-hook-form";
import clsx from "clsx";
import InputWrapper from "./InputWrapper";
import { Input } from "../ui/input";

interface TextInputProps {
  id: string;
  name?: string;
  rules?: RegisterOptions;
  additionalClassName?: string;
  placeholder?: string;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  name,
  rules,
  additionalClassName,
  placeholder,
  label,
  value,
  onChange,
}) => {
  const formContext = useFormContext<FieldValues>();

  const isControlled = value !== undefined && onChange !== undefined;
  const error =
    name &&
    formContext &&
    (formContext.formState.errors[name] as FieldError | undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
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
        type="text"
        className={clsx(
          "w-full min-w-[200px] border rounded-md shadow-sm",
          additionalClassName
        )}
        placeholder={placeholder}
        value={isControlled ? value : undefined}
        onChange={isControlled ? handleChange : undefined}
        aria-invalid={error ? "true" : "false"}
      />
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default TextInput;

import clsx from "clsx";
import React from "react";
import InputWrapper from "./InputWrapper";

interface TextInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  additionalClassName?: string;
  placeholder?: string;
  label: string;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  value,
  onChange,
  additionalClassName,
  placeholder,
  label,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <InputWrapper id={id} label={label}>
      <input
        id={id}
        type="text"
        className={clsx(
          "input input-bordered w-full min-w-[200px]",
          additionalClassName
        )}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
    </InputWrapper>
  );
};

export default TextInput;

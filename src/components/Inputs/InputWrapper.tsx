import React from "react";

interface InputWrapperProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

const InputWrapper: React.FC<InputWrapperProps> = ({ id, label, children }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm mb-1">
        {label}
      </label>
      {children}
    </div>
  );
};

export default InputWrapper;

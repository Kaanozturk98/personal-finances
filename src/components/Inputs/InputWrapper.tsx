import React from "react";
import { cn } from "@/lib/utils";

interface InputWrapperProps {
  id: string;
  label: string;
  children: React.ReactNode;
  labelPosition?: "top" | "left";
  additionalClassName?: string;
}

const InputWrapper: React.FC<InputWrapperProps> = ({
  id,
  label,
  children,
  labelPosition = "top",
  additionalClassName,
}) => {
  return (
    <div
      className={cn(
        "flex",
        labelPosition === "top" ? "flex-col" : "items-center",
        additionalClassName
      )}
    >
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm whitespace-nowrap",
            labelPosition === "top" ? "mb-1" : "mr-2"
          )}
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
};

export default InputWrapper;

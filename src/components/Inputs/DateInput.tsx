"use client";

import React, { useState, useEffect } from "react";
import { useFormContext, FieldValues, RegisterOptions } from "react-hook-form";
import { format } from "date-fns";
import InputWrapper from "./InputWrapper";
import { FieldError } from "react-hook-form/dist/types/errors";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@component/lib/utils";
import { Button } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";

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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  useEffect(() => {
    if (isControlled && value) {
      setSelectedDate(new Date(value));
    }
  }, [value, isControlled]);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (onChange && date) {
      onChange(date.toISOString().split("T")[0]); // Convert to YYYY-MM-DD
    }
  };

  return (
    <InputWrapper id={id} label={label}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-full min-w-[200px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              additionalClassName
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
      <input
        type="hidden"
        id={id}
        value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
        {...(name && !isControlled && formContext
          ? formContext.register(name, rules)
          : {})}
      />
    </InputWrapper>
  );
};

export default DateInput;

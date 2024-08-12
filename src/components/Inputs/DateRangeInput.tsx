"use client";

import React, { useState, useEffect } from "react";
import { useFormContext, FieldValues, RegisterOptions } from "react-hook-form";
import { format, addDays } from "date-fns";
import InputWrapper from "./InputWrapper";
import { FieldError } from "react-hook-form/dist/types/errors";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { DateRange } from "react-day-picker";

interface DateRangeInputProps {
  id: string;
  name?: string;
  rules?: RegisterOptions;
  label?: string;
  value?: DateRange | undefined;
  additionalClassName?: string;
  onChange?: (value: DateRange | undefined) => void;
}

const DateRangeInput: React.FC<DateRangeInputProps> = ({
  id,
  name,
  rules,
  label = "",
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

  const createLocalDate = (date: Date) => {
    const localDate = new Date(date);
    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset()
    );
    return localDate;
  };

  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(
    value || {
      from: createLocalDate(new Date(2024, 5, 20)),
      to: createLocalDate(addDays(new Date(2024, 5, 20), 20)),
    }
  );

  useEffect(() => {
    if (isControlled && value) {
      setSelectedDateRange(value);
    }
  }, [value, isControlled]);

  const handleDateChange = (dateRange: DateRange | undefined) => {
    if (dateRange) {
      if (dateRange.from) dateRange.from = createLocalDate(dateRange.from);
      if (dateRange.to) dateRange.to = createLocalDate(dateRange.to);
    }

    setSelectedDateRange(dateRange);
    if (onChange) {
      onChange(dateRange);
    }
  };

  return (
    <InputWrapper id={id} label={label}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full min-w-[300px] justify-start text-left font-normal",
              !selectedDateRange && "text-muted-foreground",
              additionalClassName
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDateRange?.from ? (
              selectedDateRange.to ? (
                <>
                  {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                  {format(selectedDateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(selectedDateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedDateRange?.from}
            selected={selectedDateRange}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-destructive mt-1">{error.message}</p>}
      <input
        type="hidden"
        id={`${id}-from`}
        value={
          selectedDateRange?.from
            ? createLocalDate(selectedDateRange.from)
                .toISOString()
                .split("T")[0]
            : ""
        }
        {...(name && !isControlled && formContext
          ? formContext.register(`${name}.from`, rules)
          : {})}
      />
      <input
        type="hidden"
        id={`${id}-to`}
        value={
          selectedDateRange?.to
            ? createLocalDate(selectedDateRange.to).toISOString().split("T")[0]
            : ""
        }
        {...(name && !isControlled && formContext
          ? formContext.register(`${name}.to`, rules)
          : {})}
      />
    </InputWrapper>
  );
};

export default DateRangeInput;

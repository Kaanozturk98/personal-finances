import React, { useEffect, useState } from "react";
import {
  useFormContext,
  FieldValues,
  Controller,
  FieldError,
} from "react-hook-form";
import InputWrapper from "./InputWrapper";
import { Category } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@component/components/ui/select";
import { cn } from "@component/lib/utils";

interface AutocompleteSelectProps {
  id: string;
  name?: string;
  additionalClassName?: string;
  value?: string | undefined;
  onChange?: (value: string) => void;
  label: string;
  fetchUrl: string;
}

type OptionType = { value: string; label: string };

const AutocompleteInput: React.FC<AutocompleteSelectProps> = ({
  id,
  name,
  additionalClassName,
  value,
  onChange,
  label,
  fetchUrl,
}) => {
  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const formContext = useFormContext<FieldValues>();
  const isControlled = value !== undefined && onChange !== undefined;
  const error =
    name &&
    formContext &&
    (formContext.formState.errors[name] as FieldError | undefined);

  const TTL = 3600000; // TTL in milliseconds (e.g., 3600000 ms = 1 hour)

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true); // Start loading
      const now = new Date().getTime();
      const cachedOptions = localStorage.getItem(`options-${fetchUrl}`);

      if (cachedOptions) {
        const { data, expiry } = JSON.parse(cachedOptions);

        // Check if the data is still valid
        if (now < expiry) {
          setOptions(data);
          setLoading(false);
          return;
        }

        // Data has expired, clear it from localStorage
        localStorage.removeItem(`options-${fetchUrl}`);
      }

      try {
        const searchParams = new URLSearchParams();
        searchParams.set("page", "1");
        searchParams.set("limit", "99");
        searchParams.set("sortBy", "name");
        searchParams.set("sortOrder", "asc");

        const urlString = `/api/${fetchUrl}?${searchParams.toString()}`;

        const response = await fetch(urlString);
        const { data } = await response.json();
        const opts = data.map((item: Category) => ({
          label: item.name,
          value: item.id,
        }));
        setOptions(opts);

        // Save fetched options with expiry time
        const item = {
          data: opts,
          expiry: now + TTL,
        };
        localStorage.setItem(`options-${fetchUrl}`, JSON.stringify(item));
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchOptions();
  }, [fetchUrl]);

  const handleChange = (selectedValue: string) => {
    if (onChange) {
      onChange(selectedValue);
    }
    if (name && !isControlled && formContext) {
      formContext.setValue(name, selectedValue);
    }
  };

  const selectedOption = options.find(
    (option) => option.value === value || option.label === value
  );

  return (
    <InputWrapper id={id} label={label}>
      {name && !isControlled && formContext ? (
        <Controller
          control={formContext.control}
          name={name as string}
          render={({ field }) => (
            <Select
              value={field.value || ""}
              onValueChange={(selectedValue) => {
                handleChange(selectedValue);
                field.onChange(selectedValue);
              }}
              disabled={loading}
            >
              <SelectTrigger
                className={cn("w-full min-w-[200px]", additionalClassName)}
              >
                <SelectValue
                  placeholder={
                    loading ? "Loading options..." : "Select an option"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{label}</SelectLabel>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
      ) : (
        <Select
          value={selectedOption?.value || ""}
          onValueChange={handleChange}
          disabled={loading}
        >
          <SelectTrigger
            className={cn("w-full min-w-[200px]", additionalClassName)}
          >
            <SelectValue
              placeholder={loading ? "Loading options..." : "Select an option"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{label}</SelectLabel>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default AutocompleteInput;

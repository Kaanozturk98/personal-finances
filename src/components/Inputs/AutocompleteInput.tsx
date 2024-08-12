import React, { useEffect, useRef, useState } from "react";
import {
  useFormContext,
  FieldValues,
  Controller,
  FieldError,
} from "react-hook-form";
import InputWrapper from "./InputWrapper";
import { Category } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

interface AutocompleteSelectProps {
  id: string;
  name?: string;
  additionalClassName?: string;
  value?: string | undefined;
  onChange?: (value: string) => void;
  label?: string;
  fetchUrl: string;
}

type OptionType = { value: string; label: string };

const AutocompleteInput: React.FC<AutocompleteSelectProps> = ({
  id,
  name,
  additionalClassName,
  value,
  onChange,
  label = "",
  fetchUrl,
}) => {
  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<string | number>("auto");

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

  useEffect(() => {
    const button = buttonRef.current;

    const handleResize = () => {
      if (button) setPopoverWidth(button.offsetWidth);
    };

    if (button) handleResize();

    const resizeObserver = new ResizeObserver(() => handleResize());

    if (button) resizeObserver.observe(button);

    return () => {
      if (button) resizeObserver.unobserve(button);
    };
  }, []);

  const renderCombobox = (
    fieldValue: string,
    handleSelect: (value: string) => void
  ) => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", additionalClassName)}
          ref={buttonRef}
        >
          {fieldValue
            ? options.find((option) => option.value === fieldValue)?.label
            : loading
            ? "Loading options..."
            : "Select an option"}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: popoverWidth }}>
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    handleSelect(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      fieldValue === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  return (
    <InputWrapper id={id} label={label}>
      {name && !isControlled && formContext ? (
        <Controller
          control={formContext.control}
          name={name as string}
          render={({ field }) =>
            renderCombobox(field.value || "", (value) => {
              handleChange(value);
              field.onChange(value);
            })
          }
        />
      ) : (
        renderCombobox(selectedOption?.value || "", handleChange)
      )}
      {error && <p className="text-destructive mt-1">{error.message}</p>}
    </InputWrapper>
  );
};

export default AutocompleteInput;

// Form.tsx
import { IColumnObject } from "@component/types";
import React from "react";
import {
  useForm,
  FieldValues,
  DeepPartial,
  FormProvider,
} from "react-hook-form";
import TextInput from "./TextInput";
import NumberInput from "./NumberInput";
import SelectInput from "./SelectInput";
import DateInput from "./DateInput";

interface FormProps<T extends FieldValues> {
  route: string;
  columns: IColumnObject<T>[];
  defaultValues?: DeepPartial<T>;
}

const Form = <T extends FieldValues>({
  route,
  columns,
  defaultValues = {} as DeepPartial<T>,
}: FormProps<T>): React.ReactElement => {
  const formMethods = useForm<T>({ defaultValues });

  const fields = columns.filter((column) => column.form);

  const mode = Object.keys(defaultValues).length > 0 ? "update" : "create";

  const method = mode === "create" ? "POST" : "PUT";
  const submitHandler = async (data: T) => {
    await fetch(`/api/cud-${route}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json()) // handle the response data
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(submitHandler)} className="form">
        {fields.map((field) => {
          const { key, label, type } = field;

          let inputComponent;

          switch (type) {
            case "string":
              inputComponent = (
                <TextInput id={String(key)} name={String(key)} label={label} />
              );
              break;
            case "number":
              inputComponent = (
                <NumberInput
                  id={String(key)}
                  name={String(key)}
                  label={label}
                />
              );
              break;
            case "boolean":
              inputComponent = (
                <SelectInput
                  id={String(key)}
                  name={String(key)}
                  label={label}
                  boolean
                />
              );
              break;
            case "date":
              inputComponent = (
                <DateInput id={String(key)} name={String(key)} label={label} />
              );
              break;
            case "enum":
              inputComponent = (
                <SelectInput
                  id={String(key)}
                  name={String(key)}
                  label={label}
                  optionValues={field.options}
                />
              );
              break;
            default:
              inputComponent = null;
          }

          return (
            <div key={String(key)} className="mb-4">
              {inputComponent}
            </div>
          );
        })}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </FormProvider>
  );
};

export default Form;

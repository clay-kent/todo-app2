import type { JSX } from "react";
import { FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OptionConfig = { label: string };

type SelectFieldProps<K extends string> = {
  field: { value: K; onChange: (v: K) => void };
  options: Record<K, OptionConfig>;
  name?: string;
  fieldState: { invalid: boolean; error?: { message?: string } };
  className?: string;
  renderOption?: (key: K, config: OptionConfig) => JSX.Element;
};

const SelectField = <K extends string>({
  field,
  options,
  name,
  fieldState,
  className,
  renderOption,
}: SelectFieldProps<K>): JSX.Element => {
  const keys = Object.keys(options) as K[];
  return (
    <>
      <Select value={field.value} onValueChange={field.onChange} name={name}>
        <SelectTrigger aria-invalid={fieldState.invalid} className={className}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {keys.map((key) => {
            const config = options[key];
            return (
              <SelectItem key={key} value={key}>
                {renderOption ? renderOption(key, config) : config.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </>
  );
};

export default SelectField;

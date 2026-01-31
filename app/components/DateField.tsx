import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import dayjs from "dayjs";
import { Calendar1 } from "lucide-react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type FieldState = { invalid: boolean; error?: { message?: string } };

type DateFieldProps = {
  field: { value: Date | null | undefined; onChange: (v: Date | null) => void };
  fieldState: FieldState;
  id?: string;
  ariaLabel?: string;
  placeholder?: string;
};

const DateField = ({ field, fieldState, id }: DateFieldProps): JSX.Element => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!field.value}
          id={id}
          aria-invalid={fieldState.invalid}
        >
          <VisuallyHidden asChild>
            <Label htmlFor={id}>期限を入力</Label>
          </VisuallyHidden>
          <Calendar1 />
          {field.value ? dayjs(field.value).format("YYYY-MM-DD") : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={field.value ?? undefined}
          onSelect={(d) => field.onChange(d ?? null)}
        />
      </PopoverContent>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Popover>
  );
};

export default DateField;

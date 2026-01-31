import React from "react";
import type { Pos } from "../types";
import { Input } from "./ui/input";
import { Field, FieldGroup, FieldLabel } from "./ui/field";

type PosFieldProp = { value: Pos | null; onChange: (v: Pos | null) => void };

type Props = {
  field: PosFieldProp;
  idPrefix?: string;
};

const parseNullableInt = (value: string) =>
  value === "" ? null : parseInt(value, 10);

const PosField: React.FC<Props> = ({ field, idPrefix }) => {
  const setX = (v: string) => {
    const newX = parseNullableInt(v);
    const newPos =
      newX === null
        ? null
        : { ...(field.value ?? { x: 0, y: 0, z: 0 }), x: newX };
    field.onChange(newPos);
  };

  const setY = (v: string) => {
    const newY = parseNullableInt(v);
    const newPos =
      newY === null
        ? null
        : { ...(field.value ?? { x: 0, y: 0, z: 0 }), y: newY };
    field.onChange(newPos);
  };

  const setZ = (v: string) => {
    const newZ = parseNullableInt(v);
    const newPos =
      newZ === null
        ? null
        : { ...(field.value ?? { x: 0, y: 0, z: 0 }), z: newZ };
    field.onChange(newPos);
  };

  return (
    <FieldGroup className="flex-row">
      <Field>
        <FieldLabel htmlFor={idPrefix ? `${idPrefix}-x` : "pos-x"}>
          X
        </FieldLabel>
        <Input
          id={idPrefix ? `${idPrefix}-x` : "pos-x"}
          type="number"
          value={field.value?.x ?? ""}
          onChange={(e) => setX(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={idPrefix ? `${idPrefix}-y` : "pos-y"}>
          Y
        </FieldLabel>
        <Input
          id={idPrefix ? `${idPrefix}-y` : "pos-y"}
          type="number"
          value={field.value?.y ?? ""}
          onChange={(e) => setY(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={idPrefix ? `${idPrefix}-z` : "pos-z"}>
          Z
        </FieldLabel>
        <Input
          id={idPrefix ? `${idPrefix}-z` : "pos-z"}
          type="number"
          value={field.value?.z ?? ""}
          onChange={(e) => setZ(e.target.value)}
        />
      </Field>
    </FieldGroup>
  );
};

export default PosField;

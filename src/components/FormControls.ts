import { ReactNode } from "react";
/** Shared rendering primitives; each feature owns the fields it composes. */
export interface FormControls {
  text: (
    label: string,
    key: string,
    required?: boolean,
    type?: string,
  ) => ReactNode;
  number: (label: string, key: string, min?: number, max?: number) => ReactNode;
  area: (label: string, key: string) => ReactNode;
  select: (label: string, key: string, values: string[]) => ReactNode;
  patch: (key: string, value: unknown) => void;
}

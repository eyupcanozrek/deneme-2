/** Each future schema version gets a sequential, non-destructive migration here. */
export function migrate(value: unknown): unknown {
  if (!value || typeof value !== "object" || !("schemaVersion" in value))
    throw new Error("Missing data version.");
  if (value.schemaVersion !== 1)
    throw new Error("This data version is not supported.");
  return value;
}

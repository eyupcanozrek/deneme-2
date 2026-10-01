import { Trade } from "../../data/models";
export const pnl = (t: Trade) =>
  t.exit === null
    ? null
    : (t.exit - t.entry) * t.quantity * (t.direction === "Long" ? 1 : -1) -
      t.fees;
export const money = (value: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

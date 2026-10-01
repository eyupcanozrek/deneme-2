import { FormControls } from "../../components/FormControls";
import { Field } from "../../components/UI";
import { Trade } from "../../data/models";
export function TradeFields({
  fields: f,
  trade,
}: {
  fields: FormControls;
  trade: Trade;
}) {
  return (
    <>
      {f.text("Market", "market", true)}
      {f.select("Direction", "direction", ["Long", "Short"])}
      {f.number("Entry price", "entry", 0.00000001)}
      <Field label="Exit price (leave blank for open trade)">
        <input
          type="number"
          min="0"
          step="any"
          value={trade.exit ?? ""}
          onChange={(e) =>
            f.patch(
              "exit",
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
        />
      </Field>
      {f.number("Position quantity", "quantity", 0.00000001)}
      {f.number("Fees", "fees")}
      {f.text("Currency", "currency", true)}
    </>
  );
}
export function TradeReflection({ fields: f }: { fields: FormControls }) {
  return (
    <>
      {f.area("Reason for entering", "reason")}
      {f.area("Notes", "notes")}
      {f.area("Mistakes", "mistakes")}
      {f.area("Lessons learned", "lessons")}
    </>
  );
}

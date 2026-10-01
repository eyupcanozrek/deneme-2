import { FormControls } from "../../components/FormControls";
export function SpeechFields({ fields: f }: { fields: FormControls }) {
  return (
    <>
      {f.text("Exercises completed", "exercises", true)}
      {f.number("Duration (minutes)", "duration", 1)}
      {f.number("Difficulty (1–5)", "difficulty", 1, 5)}
    </>
  );
}

import { glossary, type GlossaryId } from "@/lib/glossary";
import { TermTip } from "./term-tip";

/** `<Term id="origin">origins</Term>`: a keyword that shows its plain-language definition. */
export function Term({ id, children }: { id: GlossaryId; children?: React.ReactNode }) {
  const entry = glossary[id];
  if (!entry) throw new Error(`<Term id="${id}">: no such entry in lib/glossary.ts`);
  return (
    <TermTip term={entry.term} def={entry.def}>
      {children ?? entry.term}
    </TermTip>
  );
}

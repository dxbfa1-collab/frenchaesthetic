/**
 * Brand rule: numbers are always set in Nunito Sans, because Cormorant has old-style numerals.
 * Wrap headline text that may contain digits (e.g. "HIFU 22D") in this.
 */
export function Numerals({ children }: { children: string }) {
  return (
    <>
      {children.split(/(\d[\d,.:]*)/).map((part, i) =>
        /\d/.test(part) ? (
          <span key={i} className="font-sans text-[0.86em] font-bold not-italic">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

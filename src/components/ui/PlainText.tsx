/**
 * Renders the plain text kept in the Policies global: a blank line separates paragraphs, a line
 * starting with "## " is a heading, and lines starting with "- " form a list.
 */
export function PlainText({ text }: { text: string }) {
  const blocks = text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  return (
    <div className="space-y-5 text-lg">
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) {
          return (
            <h2 key={i} className="pt-6 text-[2rem] leading-tight first:pt-0">
              {block.slice(3)}
            </h2>
          )
        }
        const lines = block.split('\n')
        if (lines.every((line) => line.trim().startsWith('- '))) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-6 marker:text-gold">
              {lines.map((line) => (
                <li key={line}>{line.trim().slice(2)}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {block}
          </p>
        )
      })}
    </div>
  )
}

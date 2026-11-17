// Text that links to terms: `{prompt}` shows the id as words, and
// `{tools|tool}` shows its own wording. Definitions and narration share this
// markup, so every mention of a term can open its definition in place.

export type TermTextSegment =
  | { type: "text"; text: string }
  | { type: "term"; termId: string; text: string }

const TERM_REFERENCE = /\{([a-z][a-z-]*)(?:\|([^}]+))?\}/g

export function parseTermText(text: string): TermTextSegment[] {
  const segments: TermTextSegment[] = []
  let consumedUpTo = 0

  for (const match of text.matchAll(TERM_REFERENCE)) {
    const [reference, termId = "", wording] = match
    if (match.index > consumedUpTo) {
      segments.push({
        type: "text",
        text: text.slice(consumedUpTo, match.index),
      })
    }
    segments.push({
      type: "term",
      termId,
      text: wording ?? termId.replaceAll("-", " "),
    })
    consumedUpTo = match.index + reference.length
  }

  if (consumedUpTo < text.length) {
    segments.push({ type: "text", text: text.slice(consumedUpTo) })
  }
  return segments
}

export function toPlainText(text: string): string {
  return parseTermText(text)
    .map((segment) => segment.text)
    .join("")
}

export function referencedTermIds(text: string): string[] {
  const termIds = parseTermText(text).flatMap((segment) =>
    segment.type === "term" ? [segment.termId] : []
  )
  return [...new Set(termIds)]
}

export function countWords(text: string): number {
  return toPlainText(text).split(/\s+/).filter(Boolean).length
}

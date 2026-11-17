// Plain-language checks for term definitions. One definition serves technical
// and non-technical readers alike, because specialists want plain English too
// (GOV.UK, "Writing to GOV.UK standards: clear language").

import { countWords, toPlainText } from "@/lib/vocabulary/term-text"

// GOV.UK and digital.gov put the ceiling for an easy sentence near 20 words.
const MAX_DEFINITION_WORDS = 20

// Words that need their own definition, which a definition can't lean on.
const JARGON_WORDS = [
  "api",
  "apis",
  "endpoint",
  "json",
  "llm",
  "schema",
  "token",
  "tokens",
  "leverage",
  "utilize",
  "facilitate",
  "robust",
  "orchestrate",
  "orchestrates",
]

// We explain what each part is; comparisons are cut on purpose.
const ANALOGY_PHRASES = [
  "think of",
  "imagine",
  "as if",
  "is like",
  "similar to",
]

const SENTENCE_BREAK = /[.!?]\s+\S/

export function findDefinitionProblems(
  definition: string,
  label: string
): string[] {
  const plainText = toPlainText(definition).trim()
  const lowerText = plainText.toLowerCase()
  const words = lowerText.split(/[^a-z']+/).filter(Boolean)
  const problems: string[] = []

  const wordCount = countWords(definition)
  if (wordCount > MAX_DEFINITION_WORDS) {
    problems.push(
      `has ${String(wordCount)} words; keep it to ${String(MAX_DEFINITION_WORDS)} or fewer`
    )
  }

  if (SENTENCE_BREAK.test(plainText)) {
    problems.push("has more than one sentence")
  }

  if (!plainText.endsWith(".")) {
    problems.push("must end with a full stop")
  }

  if (lowerText.startsWith(label.toLowerCase())) {
    problems.push("starts with its own term, so it explains nothing")
  }

  for (const jargonWord of JARGON_WORDS) {
    if (words.includes(jargonWord)) {
      problems.push(`uses jargon: "${jargonWord.toUpperCase()}"`)
    }
  }

  for (const phrase of ANALOGY_PHRASES) {
    if (lowerText.includes(phrase)) {
      problems.push(`uses an analogy ("${phrase}"); say what it is instead`)
    }
  }

  return problems
}

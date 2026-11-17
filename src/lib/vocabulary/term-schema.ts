import { z } from "zod"

import { findDefinitionProblems } from "@/lib/vocabulary/plain-language"
import { referencedTermIds } from "@/lib/vocabulary/term-text"

// Every guide draws from this one vocabulary, so a term means the same thing
// in every diagram and glossary. Adding a term starts here.
export const TERM_IDS = [
  "trigger",
  "prompt",
  "rules",
  "skills",
  "memory",
  "context",
  "model",
  "run",
  "loop",
  "tools",
  "mcp-tools",
  "agent-tools",
  "ask",
  "approvals",
  "approval-modes",
  "guardrails",
  "steps",
] as const

export const termIdSchema = z.enum(TERM_IDS)
export type TermId = z.infer<typeof termIdSchema>

// Each role has one color and one icon set, used the same way in every view.
const TERM_ROLES = ["input", "decide", "act", "oversight"] as const
const termRoleSchema = z.enum(TERM_ROLES)
export type TermRole = z.infer<typeof termRoleSchema>

const MAX_WHY_WORDS = 25

const termSchema = z
  .object({
    id: termIdSchema,
    // The industry term, never renamed for a non-technical reader.
    label: z.string().min(1),
    // One plain sentence. Linked terms use `{id}` or `{id|wording}` markup.
    definition: z.string().min(1),
    // The one idea about this term that changes how a reader understands it.
    why: z.string().min(1).optional(),
    role: termRoleSchema,
  })
  .superRefine((term, context) => {
    for (const problem of findDefinitionProblems(term.definition, term.label)) {
      context.addIssue({
        code: "custom",
        path: ["definition"],
        message: `${term.label}: definition ${problem}`,
      })
    }

    const whyWordCount = term.why?.split(/\s+/).length ?? 0
    if (whyWordCount > MAX_WHY_WORDS) {
      context.addIssue({
        code: "custom",
        path: ["why"],
        message: `${term.label}: why line has ${String(whyWordCount)} words; keep it to ${String(MAX_WHY_WORDS)}`,
      })
    }
  })

export type Term = z.infer<typeof termSchema>

export const vocabularySchema = z
  .array(termSchema)
  .superRefine((terms, context) => {
    const definedTermIds = new Set(terms.map((term) => term.id))

    if (definedTermIds.size !== terms.length) {
      context.addIssue({ code: "custom", message: "A term is defined twice" })
    }

    for (const termId of TERM_IDS) {
      if (!definedTermIds.has(termId)) {
        context.addIssue({
          code: "custom",
          message: `Term "${termId}" has no definition`,
        })
      }
    }

    for (const term of terms) {
      for (const linkedTermId of referencedTermIds(term.definition)) {
        if (linkedTermId === term.id) {
          context.addIssue({
            code: "custom",
            message: `${term.label}: definition links to itself`,
          })
        }
        if (!termIdSchema.safeParse(linkedTermId).success) {
          context.addIssue({
            code: "custom",
            message: `${term.label}: definition links to unknown term "${linkedTermId}"`,
          })
        }
      }
    }
  })

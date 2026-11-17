import { type ReactNode } from "react"

import { TermChip } from "@/components/term/term-chip"
import { TermText } from "@/components/term/term-text"
import { type Term, type TermRole } from "@/lib/vocabulary/term-schema"
import { ROLE_LABELS, TERMS } from "@/lib/vocabulary/terms"

// Built from the same vocabulary as every diagram, so the glossary and the
// pictures can never disagree. A guide passes in where each term appears.

type GlossaryProps = {
  terms?: readonly Term[]
  renderAppearsIn?: (term: Term) => ReactNode
}

export function Glossary({ terms = TERMS, renderAppearsIn }: GlossaryProps) {
  const roles = [...new Set(terms.map((term) => term.role))]

  return (
    <div className="flex flex-col gap-8">
      {roles.map((role) => (
        <GlossaryGroup
          key={role}
          role={role}
          terms={terms.filter((term) => term.role === role)}
          renderAppearsIn={renderAppearsIn}
        />
      ))}
    </div>
  )
}

type GlossaryGroupProps = {
  role: TermRole
  terms: readonly Term[]
  renderAppearsIn: ((term: Term) => ReactNode) | undefined
}

function GlossaryGroup({ role, terms, renderAppearsIn }: GlossaryGroupProps) {
  const headingId = `glossary-${role}`

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2
        id={headingId}
        className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
      >
        {ROLE_LABELS[role]}
      </h2>
      <dl className="divide-y rounded-xl border bg-card">
        {terms.map((term) => (
          <div
            key={term.id}
            id={`term-${term.id}`}
            className="grid scroll-mt-24 gap-x-6 gap-y-2 px-4 py-4 md:grid-cols-[11rem_minmax(0,1fr)_14rem] md:px-5"
          >
            <dt className="pt-0.5">
              <TermChip termId={term.id} />
            </dt>
            <dd className="flex flex-col gap-2">
              <p className="text-[15px] leading-relaxed text-pretty">
                <TermText text={term.definition} />
              </p>
              {term.why ? (
                <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                  {term.why}
                </p>
              ) : null}
            </dd>
            {renderAppearsIn ? (
              <dd className="text-[13px] text-muted-foreground md:pt-1">
                {renderAppearsIn(term)}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  )
}

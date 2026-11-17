import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"

import { Glossary } from "@/components/glossary/glossary"
import { WORKS_DIAGRAM } from "@/features/agent-works/config/works-diagram"
import { drawnTermIds } from "@/features/agent-works/lib/diagram-terms"
import { type Term } from "@/lib/vocabulary/term-schema"

const DRAWN_TERM_IDS = drawnTermIds(WORKS_DIAGRAM)

export function AgentWorksGlossaryPage() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
        Every term in this guide, with the one plain definition used everywhere
        it appears. Select an underlined term to read its definition in place.
      </p>
      <Glossary renderAppearsIn={(term) => <AppearsIn term={term} />} />
    </div>
  )
}

function AppearsIn({ term }: { term: Term }) {
  const isDrawn = DRAWN_TERM_IDS.has(term.id)

  return (
    <ul className="flex flex-col gap-1.5">
      {isDrawn ? (
        <li>
          <Link
            to="/agent-works"
            search={{ term: term.id }}
            className="group inline-flex min-h-6 items-center gap-1 font-medium text-foreground hover:underline"
          >
            In the diagram
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </li>
      ) : null}
    </ul>
  )
}

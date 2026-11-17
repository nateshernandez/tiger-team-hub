import { type ReactNode } from "react"

import { ROLE_STYLES } from "@/components/term/role-styles"
import { TermChip } from "@/components/term/term-chip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { type TermId, termIdSchema } from "@/lib/vocabulary/term-schema"
import { parseTermText } from "@/lib/vocabulary/term-text"
import { getTerm } from "@/lib/vocabulary/terms"

type TermTextProps = {
  text: string
  // Render a linked term your own way; by default it opens its definition.
  renderTerm?: (termId: TermId, text: string) => ReactNode
}

// Text with `{term}` markup. Each term opens its definition in place, so a
// reader never leaves the sentence to look one up (spatial contiguity).
export function TermText({ text, renderTerm }: TermTextProps) {
  const segments = parseTermText(text)

  return (
    <>
      {segments.map((segment, index) => {
        // Segments are a fixed parse of static text, so position is stable.
        const key = `${String(index)}-${segment.text}`
        if (segment.type === "text") {
          return <span key={key}>{segment.text}</span>
        }
        const parsedTermId = termIdSchema.safeParse(segment.termId)
        if (!parsedTermId.success) {
          return <span key={key}>{segment.text}</span>
        }
        if (renderTerm) {
          return (
            <span key={key}>{renderTerm(parsedTermId.data, segment.text)}</span>
          )
        }
        return (
          <TermLink key={key} termId={parsedTermId.data}>
            {segment.text}
          </TermLink>
        )
      })}
    </>
  )
}

type TermLinkProps = {
  termId: TermId
  children: ReactNode
}

function TermLink({ termId, children }: TermLinkProps) {
  const term = getTerm(termId)
  const style = ROLE_STYLES[term.role]

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "cursor-help rounded-sm font-medium text-foreground underline decoration-dotted decoration-[1.5px] underline-offset-[3px] hover:decoration-solid focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          style.underline
        )}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 gap-2 p-3.5" align="start">
        <TermChip termId={termId} size="sm" className="self-start" />
        <p className="text-sm leading-relaxed text-pretty">
          <TermText
            text={term.definition}
            renderTerm={(_, wording) => wording}
          />
        </p>
        {term.why ? (
          <p className="border-t pt-2 text-[13px] leading-relaxed text-muted-foreground">
            {term.why}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

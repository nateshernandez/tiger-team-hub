import { getRouteApi, Link } from "@tanstack/react-router"
import { ChevronRight, SearchIcon, SearchX } from "lucide-react"
import { useEffect } from "react"

import { SegmentedControl } from "@/components/segmented-control"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  type Artifact,
  HUB_ARTIFACTS,
  HUB_PAGE,
} from "@/features/hub/config/artifacts"
import {
  type ArtifactFilter,
  filterArtifacts,
} from "@/features/hub/lib/filter-artifacts"
import { rememberSearch } from "@/features/hub/lib/remembered-search"
import { cn } from "@/lib/utils"

const hubRoute = getRouteApi("/")

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "ready", label: "Ready" },
  { value: "draft", label: "Draft" },
] as const

const STATUS_LABELS: Record<Artifact["status"], string> = {
  ready: "Ready",
  draft: "Draft",
}

const STATUS_DOT_COLORS: Record<Artifact["status"], string> = {
  ready: "bg-role-act",
  draft: "bg-role-oversight",
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

export function HubPage() {
  const { q: query = "", status } = hubRoute.useSearch()
  const navigate = hubRoute.useNavigate()

  // Keep the session's copy in step with the URL, however it changed.
  useEffect(() => {
    rememberSearch({ q: query === "" ? undefined : query, status })
  }, [query, status])

  const artifacts = filterArtifacts(HUB_ARTIFACTS, { query, status })
  const isFiltering = query !== "" || status !== "all"

  function handleQueryChange(nextQuery: string) {
    void navigate({
      search: (previous) => ({
        ...previous,
        q: nextQuery === "" ? undefined : nextQuery,
      }),
      replace: true,
    })
  }

  function handleStatusChange(nextStatus: ArtifactFilter["status"]) {
    void navigate({
      search: (previous) => ({ ...previous, status: nextStatus }),
      replace: true,
    })
  }

  function handleClear() {
    void navigate({ search: { status: "all" }, replace: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          {HUB_PAGE.title}
        </h1>
        <p className="text-[15px] leading-relaxed text-pretty text-muted-foreground">
          {HUB_PAGE.summary}
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="h-9 sm:max-w-sm">
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            aria-label="Search artifacts"
            placeholder="Search artifacts"
            value={query}
            onChange={(event) => {
              handleQueryChange(event.target.value)
            }}
          />
        </InputGroup>
        <SegmentedControl
          label="Filter by status"
          value={status}
          options={STATUS_FILTERS}
          onValueChange={handleStatusChange}
        />
        <p
          aria-live="polite"
          className="text-sm text-muted-foreground tabular-nums sm:ml-auto"
        >
          {artifacts.length === 1
            ? "1 artifact"
            : `${String(artifacts.length)} artifacts`}
        </p>
      </div>

      {artifacts.length === 0 ? (
        <NoMatches isFiltering={isFiltering} onClear={handleClear} />
      ) : (
        <ItemGroup className="gap-0 divide-y rounded-xl border bg-card">
          {artifacts.map((artifact) => (
            <ArtifactItem key={artifact.to} artifact={artifact} />
          ))}
        </ItemGroup>
      )}
    </div>
  )
}

function ArtifactItem({ artifact }: { artifact: Artifact }) {
  return (
    // The list item wraps the link, so the row is announced as a link.
    <div role="listitem" className="group/row">
      <Item
        className="rounded-none px-4 py-4 group-first/row:rounded-t-xl group-last/row:rounded-b-xl sm:px-5"
        render={<Link to={artifact.to} />}
      >
        <ItemContent>
          <ItemTitle className="text-[15px] font-semibold tracking-tight">
            {artifact.title}
          </ItemTitle>
          <ItemDescription className="text-pretty">
            {artifact.summary}
          </ItemDescription>
        </ItemContent>
        <ItemActions className="gap-4">
          {/* Outlined, so the badge stays visible on the row's hover fill. */}
          <Badge variant="outline" className="gap-1.5 bg-background">
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                STATUS_DOT_COLORS[artifact.status]
              )}
            />
            {STATUS_LABELS[artifact.status]}
          </Badge>
          <span className="hidden w-32 text-right text-xs text-muted-foreground tabular-nums sm:inline">
            Updated{" "}
            <time dateTime={artifact.updatedOn}>
              {DATE_FORMAT.format(new Date(artifact.updatedOn))}
            </time>
          </span>
          <ChevronRight
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-hover/item:translate-x-0.5"
          />
        </ItemActions>
      </Item>
    </div>
  )
}

type NoMatchesProps = {
  isFiltering: boolean
  onClear: () => void
}

function NoMatches({ isFiltering, onClear }: NoMatchesProps) {
  return (
    <Empty className="rounded-xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>No artifacts match</EmptyTitle>
        <EmptyDescription>
          Try another search term, or a different status.
        </EmptyDescription>
      </EmptyHeader>
      {isFiltering ? (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear search and filters
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}

import {
  type Artifact,
  type ArtifactStatus,
} from "@/features/hub/config/artifacts"

export type ArtifactFilter = {
  query: string
  status: ArtifactStatus | "all"
}

// Every word of the query must appear in the title or summary, in any order
// and any case. Newest first, so recent work is at the top.
export function filterArtifacts(
  artifacts: readonly Artifact[],
  { query, status }: ArtifactFilter
): Artifact[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)

  return artifacts
    .filter((artifact) => status === "all" || artifact.status === status)
    .filter((artifact) => {
      const text = `${artifact.title} ${artifact.summary}`.toLowerCase()
      return words.every((word) => text.includes(word))
    })
    .toSorted((first, second) =>
      second.updatedOn.localeCompare(first.updatedOn)
    )
}

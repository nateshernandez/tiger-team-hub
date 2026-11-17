import { z } from "zod"

export const HUB_PAGE = {
  title: "Artifacts",
  summary:
    "The tiger team's most important guides and references, each the version to trust, and written for anyone to follow.",
} as const

const ARTIFACT_STATUSES = ["ready", "draft"] as const
export const artifactStatusSchema = z.enum(ARTIFACT_STATUSES)
export type ArtifactStatus = z.infer<typeof artifactStatusSchema>

const artifactSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1).max(120),
  status: artifactStatusSchema,
  to: z.string().startsWith("/"),
  // Set by hand when the artifact changes; there is no database to track it.
  updatedOn: z.iso.date(),
})

export type Artifact = z.infer<typeof artifactSchema>

export const HUB_ARTIFACTS: Artifact[] = z.array(artifactSchema).parse([
  {
    title: "How an agent works",
    summary:
      "The mental model for every agent in our platform: its parts, how they fit together, and what it sees as it works.",
    status: "ready",
    to: "/agent-works",
    updatedOn: "2026-11-16",
  },
])

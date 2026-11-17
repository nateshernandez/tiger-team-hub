import { z } from "zod"

import { artifactStatusSchema } from "@/features/hub/config/artifacts"

// The search and filter live in the URL, so a filtered list can be shared.
export const hubSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  status: z
    .union([artifactStatusSchema, z.literal("all")])
    .default("all")
    .catch("all"),
})

export type HubSearch = z.infer<typeof hubSearchSchema>

export function isDefaultHubSearch(search: HubSearch): boolean {
  return (search.q ?? "") === "" && search.status === "all"
}

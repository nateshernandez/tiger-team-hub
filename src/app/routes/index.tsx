import {
  createFileRoute,
  redirect,
  stripSearchParams,
} from "@tanstack/react-router"

import { HubPage } from "@/features/hub/components/hub-page"
import { recallSearch } from "@/features/hub/lib/remembered-search"
import {
  hubSearchSchema,
  isDefaultHubSearch,
} from "@/features/hub/lib/search-params"

export const Route = createFileRoute("/")({
  validateSearch: hubSearchSchema,
  // Keep the defaults out of the URL, so a plain link stays plain.
  search: { middlewares: [stripSearchParams({ status: "all" })] },
  // Arriving with no search, such as from an artifact's breadcrumb, brings
  // back the search and filter the reader left the list with. Only on
  // arrival: clearing the search while on the list must stay cleared.
  beforeLoad: ({ search, cause }) => {
    const isArriving = cause === "enter"
    const recalled =
      isArriving && isDefaultHubSearch(search) ? recallSearch() : undefined
    if (recalled) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router redirects by throwing its redirect object.
      throw redirect({ to: "/", search: recalled, replace: true })
    }
  },
  component: HubPage,
})

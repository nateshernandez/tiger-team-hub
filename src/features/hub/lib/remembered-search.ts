import {
  type HubSearch,
  hubSearchSchema,
  isDefaultHubSearch,
} from "@/features/hub/lib/search-params"

// Coming back to the list from an artifact keeps the search and filter the
// reader left it with, for as long as the tab is open.
const STORAGE_KEY = "hub:last-search"

export function rememberSearch(search: HubSearch): void {
  try {
    if (isDefaultHubSearch(search)) {
      sessionStorage.removeItem(STORAGE_KEY)
      return
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(search))
  } catch {
    // Storage can be blocked or full; the list just won't be remembered.
  }
}

export function recallSearch(): HubSearch | undefined {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored === null) {
      return undefined
    }
    const parsed = hubSearchSchema.safeParse(JSON.parse(stored))
    if (!parsed.success || isDefaultHubSearch(parsed.data)) {
      return undefined
    }
    return parsed.data
  } catch {
    return undefined
  }
}

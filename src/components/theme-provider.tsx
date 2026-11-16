import { createContext, type ReactNode, use, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"
type ResolvedTheme = "dark" | "light"

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
  shouldDisableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"
const THEME_VALUES: readonly string[] = ["dark", "light", "system"]
const TOGGLE_THEME_KEY = "d"

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
)

function isTheme(value: string | null): value is Theme {
  return value !== null && THEME_VALUES.includes(value)
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light"
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme
}

function getToggledTheme(theme: Theme): ResolvedTheme {
  return resolveTheme(theme) === "dark" ? "light" : "dark"
}

function readStoredTheme(storageKey: string, fallback: Theme): Theme {
  const storedTheme = localStorage.getItem(storageKey)
  return isTheme(storedTheme) ? storedTheme : fallback
}

function disableTransitionsTemporarily(): () => void {
  const style = document.createElement("style")
  style.append(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )
  document.head.append(style)

  return () => {
    // Force a reflow so the transition-free styles apply before removal.
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

function applyTheme(theme: Theme, shouldDisableTransitions: boolean): void {
  const restoreTransitions = shouldDisableTransitions
    ? disableTransitionsTemporarily()
    : undefined

  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolveTheme(theme))

  restoreTransitions?.()
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  return (
    target.closest("input, textarea, select, [contenteditable='true']") !== null
  )
}

function isToggleShortcut(event: KeyboardEvent): boolean {
  if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
    return false
  }

  if (isEditableTarget(event.target)) {
    return false
  }

  return event.key.toLowerCase() === TOGGLE_THEME_KEY
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  shouldDisableTransitionOnChange = true,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() =>
    readStoredTheme(storageKey, defaultTheme)
  )

  function persistTheme(nextTheme: Theme) {
    localStorage.setItem(storageKey, nextTheme)
    setTheme(nextTheme)
  }

  // Sync the <html> class with the theme, and follow the OS while on "system".
  useEffect(() => {
    applyTheme(theme, shouldDisableTransitionOnChange)

    if (theme !== "system") {
      return
    }

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
    const handleChange = () => {
      applyTheme("system", shouldDisableTransitionOnChange)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, shouldDisableTransitionOnChange])

  // Keyboard shortcut: "d" toggles between light and dark.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isToggleShortcut(event)) {
        return
      }

      setTheme((currentTheme) => {
        const nextTheme = getToggledTheme(currentTheme)
        localStorage.setItem(storageKey, nextTheme)
        return nextTheme
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [storageKey])

  // Keep tabs in sync when another tab changes the stored theme.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || event.key !== storageKey) {
        return
      }

      setTheme(isTheme(event.newValue) ? event.newValue : defaultTheme)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [defaultTheme, storageKey])

  return (
    <ThemeProviderContext value={{ theme, setTheme: persistTheme }}>
      {children}
    </ThemeProviderContext>
  )
}

export function useTheme(): ThemeProviderState {
  const context = use(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}

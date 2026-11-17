import { type TermRole } from "@/lib/vocabulary/term-schema"

// Signaling (Mayer, 2020): a role keeps one color everywhere, and color
// always comes with an icon and a label, never on its own.
type RoleStyle = {
  surface: string
  foreground: string
  icon: string
  border: string
  accentBorder: string
  ring: string
  underline: string
  swatch: string
}

export const ROLE_STYLES: Record<TermRole, RoleStyle> = {
  input: {
    surface: "bg-role-input-surface",
    foreground: "text-role-input-foreground",
    icon: "text-role-input",
    border: "border-role-input/35",
    accentBorder: "border-l-role-input",
    ring: "ring-role-input",
    underline: "decoration-role-input/60",
    swatch: "bg-role-input",
  },
  decide: {
    surface: "bg-role-decide-surface",
    foreground: "text-role-decide-foreground",
    icon: "text-role-decide",
    border: "border-role-decide/35",
    accentBorder: "border-l-role-decide",
    ring: "ring-role-decide",
    underline: "decoration-role-decide/60",
    swatch: "bg-role-decide",
  },
  act: {
    surface: "bg-role-act-surface",
    foreground: "text-role-act-foreground",
    icon: "text-role-act",
    border: "border-role-act/35",
    accentBorder: "border-l-role-act",
    ring: "ring-role-act",
    underline: "decoration-role-act/60",
    swatch: "bg-role-act",
  },
  oversight: {
    surface: "bg-role-oversight-surface",
    foreground: "text-role-oversight-foreground",
    icon: "text-role-oversight",
    border: "border-role-oversight/40",
    accentBorder: "border-l-role-oversight",
    ring: "ring-role-oversight",
    underline: "decoration-role-oversight/70",
    swatch: "bg-role-oversight",
  },
}

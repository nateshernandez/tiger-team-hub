import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type SegmentedControlOption<Value extends string> = {
  value: Value
  label: string
}

type SegmentedControlProps<Value extends string> = {
  label: string
  value: Value
  options: readonly SegmentedControlOption<Value>[]
  onValueChange: (value: Value) => void
  className?: string
}

// One choice from a few, on a muted track. Each option is its own rounded
// pill with a small gap, so the selected one never looks cut off; ToggleGroup's
// joined style (spacing 0) is for attached buttons, not this.
export function SegmentedControl<Value extends string>({
  label,
  value,
  options,
  onValueChange,
  className,
}: SegmentedControlProps<Value>) {
  function handleValueChange(values: unknown[]) {
    // Pressing the selected option would clear it; a segmented control
    // always keeps one chosen, so that press changes nothing.
    const chosen = options.find((option) => option.value === values[0])
    if (!chosen) {
      return
    }
    onValueChange(chosen.value)
  }

  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={handleValueChange}
      size="sm"
      spacing={0.5}
      className={cn("rounded-lg bg-muted p-[3px]", className)}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="flex-1 rounded-md px-3 text-muted-foreground hover:bg-transparent hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm dark:aria-pressed:bg-input/40"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

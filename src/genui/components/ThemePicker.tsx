"use client"

import { Palette, Check, Sun, Moon } from "lucide-react"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command"
import { ScrollArea } from "../../components/ui/scroll-area"
import { THEME_CATALOG } from "../theme-apply"
import { defaultPresets } from "../theme-presets"
import { cn } from "../../lib/utils"

export interface ThemePickerProps {
  value: string | null
  isDark: boolean
  onSelect: (name: string) => void
  onToggleMode: () => void
}

function Swatch({ color }: { color: string }) {
  return (
    <div
      style={{ backgroundColor: color }}
      className="size-2.5 rounded-sm border border-border/60"
    />
  )
}

export default function ThemePicker({
  value,
  isDark,
  onSelect,
  onToggleMode,
}: ThemePickerProps) {
  const mode = isDark ? "dark" : "light"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Theme"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Palette className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="border-b p-1">
          <button
            type="button"
            onClick={onToggleMode}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {isDark ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>
        <Command>
          <CommandInput placeholder="Search themes…" />
          <CommandList>
            <ScrollArea className="max-h-[360px]">
              <CommandEmpty>No theme found.</CommandEmpty>
              <CommandGroup>
                {THEME_CATALOG.map((entry) => {
                  const styles = defaultPresets[entry.name]?.styles[mode]
                  return (
                    <CommandItem
                      key={entry.name}
                      value={entry.name}
                      onSelect={() => onSelect(entry.name)}
                      className="gap-2"
                    >
                      <div className="flex items-center gap-1">
                        <Swatch color={styles?.primary ?? "#888"} />
                        <Swatch color={styles?.secondary ?? "#888"} />
                        <Swatch color={styles?.accent ?? "#888"} />
                        <Swatch color={styles?.border ?? "#888"} />
                      </div>
                      <span className="truncate">{entry.label}</span>
                      <Check
                        className={cn(
                          "ml-auto size-4",
                          value === entry.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

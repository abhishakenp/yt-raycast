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
      <PopoverContent
        align="end"
        className="w-72 overflow-hidden border-white/10 bg-slate-950/72 p-0 text-slate-100 shadow-2xl shadow-black/35 backdrop-blur-2xl"
      >
        <div className="border-b border-white/10 p-1">
          <button
            type="button"
            onClick={onToggleMode}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-slate-100 hover:bg-white/10 hover:text-white"
          >
            {isDark ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>
        <Command className="bg-transparent text-slate-100">
          <CommandInput placeholder="Search themes…" className="text-slate-100 placeholder:text-slate-400" />
          <CommandList>
            <ScrollArea className="max-h-[360px]">
              <CommandEmpty>No theme found.</CommandEmpty>
              <CommandGroup className="text-slate-100">
                {THEME_CATALOG.map((entry) => {
                  const styles = defaultPresets[entry.name]?.styles[mode]
                  return (
                    <CommandItem
                      key={entry.name}
                      value={entry.name}
                      onSelect={() => onSelect(entry.name)}
                      className="gap-2 data-[selected=true]:bg-white/10 data-[selected=true]:text-white"
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

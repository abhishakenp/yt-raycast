"use client"

import { type ReactElement } from "react"
import { Moon, Palette, Sun } from "lucide-react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "../../components/ui/combobox"
import { THEME_CATALOG } from "../theme-apply"
import { defaultPresets } from "../theme-presets"

export interface ThemePickerProps {
  value: string | null
  isDark: boolean
  onSelect: (name: string) => void
  onToggleMode: () => void
  trigger?: ReactElement
}

function Swatch({ color }: { color?: string }) {
  return (
    <div
      style={{ backgroundColor: color ?? "#888" }}
      className="size-2.5 rounded-sm border border-border/60"
    />
  )
}

export default function ThemePicker({
  value,
  isDark,
  onSelect,
  onToggleMode,
  trigger,
}: ThemePickerProps) {
  const mode = isDark ? "dark" : "light"

  return (
    <Combobox
      items={THEME_CATALOG.map((entry) => entry.name)}
      value={value ?? null}
      onValueChange={(next) => {
        if (typeof next === "string") onSelect(next)
      }}
      itemToStringLabel={(themeName) => {
        const entry = THEME_CATALOG.find((candidate) => candidate.name === themeName)
        return entry?.label ?? String(themeName)
      }}
    >
      {trigger ? (
        <ComboboxTrigger render={trigger} />
      ) : (
        <ComboboxTrigger
          render={
            <button
              type="button"
              title="Theme"
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Palette className="size-4" />
            </button>
          }
        />
      )}
      <ComboboxContent
        align="end"
        className="w-72 border-white/10 bg-slate-950/72 text-slate-100 shadow-2xl shadow-black/35 backdrop-blur-2xl"
      >
        <div className="border-b border-white/10 p-1">
          <button
            type="button"
            onClick={onToggleMode}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-slate-100 hover:bg-white/10 hover:text-white"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>
        <ComboboxInput
          placeholder="Search themes..."
          showClear
          className="mx-1 mt-1 w-[calc(100%-0.5rem)] border-white/10 bg-white/5 text-slate-100"
        />
        <ComboboxEmpty>No theme found.</ComboboxEmpty>
        <ComboboxList className="max-h-[360px]">
          {THEME_CATALOG.map((entry) => {
            const styles = defaultPresets[entry.name]?.styles[mode]
            return (
              <ComboboxItem
                key={entry.name}
                value={entry.name}
                className="text-slate-100 data-highlighted:bg-white/10 data-highlighted:text-white"
              >
                <div className="flex items-center gap-1">
                  <Swatch color={styles?.primary} />
                  <Swatch color={styles?.secondary} />
                  <Swatch color={styles?.accent} />
                  <Swatch color={styles?.border} />
                </div>
                <span className="truncate">{entry.label}</span>
              </ComboboxItem>
            )
          })}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

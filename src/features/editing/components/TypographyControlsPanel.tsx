import { useState, useLayoutEffect, useRef } from 'react'
import { cn } from '#/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'

interface TypographyControlsPanelProps {
  activeElement: HTMLElement | null
  onModified?: () => void
}

const FONT_FAMILIES: Array<{ label: string; value: string }> = [
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'Courier New', value: '"Courier New", monospace' },
]

const TEXT_TRANSFORMS = [
  { label: 'None', value: 'none' },
  { label: 'Upper', value: 'uppercase' },
  { label: 'Lower', value: 'lowercase' },
  { label: 'Cap', value: 'capitalize' },
] as const

const FONT_WEIGHTS: Array<{ label: string; value: string }> = [
  { label: 'Thin', value: '100' },
  { label: 'Extra Light', value: '200' },
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semi Bold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra Bold', value: '800' },
  { label: 'Black', value: '900' },
]

export function TypographyControlsPanel({
  activeElement,
  onModified,
}: TypographyControlsPanelProps) {
  const [fontFamily, setFontFamily] = useState('')
  const [fontWeight, setFontWeight] = useState('400')
  const [lineHeight, setLineHeight] = useState('')
  const [lineHeightNormal, setLineHeightNormal] = useState(true)
  const [letterSpacing, setLetterSpacing] = useState('')
  const [letterSpacingUnit, setLetterSpacingUnit] = useState('em')
  const [wordSpacing, setWordSpacing] = useState('')
  const [wordSpacingUnit, setWordSpacingUnit] = useState('em')
  const [textTransform, setTextTransform] = useState<string>('none')

  const userModifiedRef = useRef(false)

  useLayoutEffect(() => {
    if (!activeElement) return
    const computed = window.getComputedStyle(activeElement)
    setFontFamily(computed.fontFamily || '')
    const fw = computed.fontWeight
    if (fw === 'bold') setFontWeight('700')
    else if (fw === 'normal') setFontWeight('400')
    else if (fw === 'lighter') setFontWeight('300')
    else if (fw === 'bolder') setFontWeight('600')
    else setFontWeight(fw || '400')
    const lh = computed.lineHeight
    setLineHeight(lh)
    setLineHeightNormal(lh === 'normal')
    setLetterSpacing(String(parseFloat(computed.letterSpacing) || 0))
    setWordSpacing(String(parseFloat(computed.wordSpacing) || 0))
    setTextTransform(computed.textTransform || 'none')
  }, [activeElement])

  const markModified = () => {
    userModifiedRef.current = true
    onModified?.()
  }

  const applyLiveStyle = (prop: string, value: string) => {
    if (activeElement) {
      activeElement.style.setProperty(prop, value)
      markModified()
    }
  }

  const labelCls =
    'text-[10px] uppercase tracking-wider text-white/40 font-medium'

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-1.5 p-2">
      {/* Font Family */}
      <div className="flex items-center gap-2">
        <span className={labelCls + ' w-12 shrink-0'}>Font</span>
        <InputGroup>
          <Select
            value={fontFamily}
            onValueChange={(v) => {
              setFontFamily(v)
              applyLiveStyle('font-family', v)
            }}
          >
            <SelectTrigger
              aria-label="Font"
              className="h-auto w-full border-0 bg-transparent text-xs text-white"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f.label} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputGroup>
      </div>

      {/* Font Weight */}
      <div className="flex items-center gap-2">
        <span className={labelCls + ' w-12 shrink-0'}>Weight</span>
        <InputGroup>
          <Select
            value={fontWeight}
            onValueChange={(v) => {
              setFontWeight(v)
              applyLiveStyle('font-weight', v)
            }}
          >
            <SelectTrigger
              aria-label="Weight"
              className="h-auto w-full border-0 bg-transparent text-xs text-white"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_WEIGHTS.map((w) => (
                <SelectItem key={w.value} value={w.value}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputGroup>
      </div>

      {/* Line Height */}
      <div className="flex items-center gap-2">
        <span className={labelCls + ' w-12 shrink-0'}>Line</span>
        <InputGroup>
          <InputGroupInput
            aria-label="Line height"
            type="number"
            step="0.1"
            min="0.5"
            max="3"
            value={lineHeightNormal ? '' : lineHeight}
            disabled={lineHeightNormal}
            onChange={(e) => {
              setLineHeight(e.target.value)
              applyLiveStyle('line-height', e.target.value)
            }}
            placeholder="normal"
            className="text-xs text-white"
          />
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              aria-label="Auto line height"
              onClick={() => {
                const isNormal = !lineHeightNormal
                setLineHeightNormal(isNormal)
                if (isNormal) {
                  applyLiveStyle('line-height', 'normal')
                }
              }}
              className={cn(
                'rounded px-2 py-0 text-[10px] transition-colors',
                lineHeightNormal
                  ? 'text-cyan-200'
                  : 'text-white/40 hover:text-white/80',
              )}
            >
              Auto
            </button>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Letter + Word Spacing */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <span className={labelCls + ' w-10 shrink-0'}>Letter</span>
          <InputGroup>
            <InputGroupInput
              aria-label="Letter spacing"
              type="number"
              step="0.01"
              value={letterSpacing}
              onChange={(e) => {
                setLetterSpacing(e.target.value)
                applyLiveStyle(
                  'letter-spacing',
                  `${e.target.value}${letterSpacingUnit}`,
                )
              }}
              className="text-xs text-white"
            />
            <InputGroupAddon align="inline-end">
              <Select
                value={letterSpacingUnit}
                onValueChange={(unit) => {
                  setLetterSpacingUnit(unit)
                  applyLiveStyle('letter-spacing', `${letterSpacing}${unit}`)
                }}
              >
                <SelectTrigger
                  aria-label="Letter spacing unit"
                  className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-white/60"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="em">em</SelectItem>
                  <SelectItem value="px">px</SelectItem>
                  <SelectItem value="rem">rem</SelectItem>
                </SelectContent>
              </Select>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={labelCls + ' w-10 shrink-0'}>Word</span>
          <InputGroup>
            <InputGroupInput
              aria-label="Word spacing"
              type="number"
              step="0.01"
              value={wordSpacing}
              onChange={(e) => {
                setWordSpacing(e.target.value)
                applyLiveStyle(
                  'word-spacing',
                  `${e.target.value}${wordSpacingUnit}`,
                )
              }}
              className="text-xs text-white"
            />
            <InputGroupAddon align="inline-end">
              <Select
                value={wordSpacingUnit}
                onValueChange={(unit) => {
                  setWordSpacingUnit(unit)
                  applyLiveStyle('word-spacing', `${wordSpacing}${unit}`)
                }}
              >
                <SelectTrigger
                  aria-label="Word spacing unit"
                  className="h-auto w-auto border-0 bg-transparent px-1 text-xs text-white/60"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="em">em</SelectItem>
                  <SelectItem value="px">px</SelectItem>
                  <SelectItem value="rem">rem</SelectItem>
                </SelectContent>
              </Select>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      {/* Text Transform */}
      <div className="flex items-center gap-2">
        <span className={labelCls + ' w-12 shrink-0'}>Case</span>
        <ToggleGroup
          type="single"
          aria-label="Case"
          value={textTransform}
          onValueChange={(v) => {
            if (v) {
              setTextTransform(v)
              applyLiveStyle('text-transform', v)
            }
          }}
          variant="outline"
          size="sm"
        >
          {TEXT_TRANSFORMS.map((tt) => (
            <ToggleGroupItem
              key={tt.value}
              value={tt.value}
              className="text-xs"
            >
              {tt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}

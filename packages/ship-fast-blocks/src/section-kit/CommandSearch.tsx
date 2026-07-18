import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { SearchIcon } from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
import { cn } from '#/lib/utils.ts'

type CommandSearchSearch<T> = {
  items: readonly T[]
  getKey: (item: T) => string
  getValue: (item: T) => string
  onSelect: (item: T) => void | Promise<unknown>
}

type CommandSearchContextValue = {
  search: CommandSearchSearch<unknown>
  open: boolean
  setOpen: (open: boolean) => void
}

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

const CommandSearchContext =
  React.createContext<CommandSearchContextValue | null>(null)

function useCommandSearchContext() {
  const ctx = React.useContext(CommandSearchContext)
  if (!ctx) {
    throw new Error(
      'CommandSearch sub-components must be used within <CommandSearch>',
    )
  }
  return ctx
}

function CommandSearch<T>({
  search,
  children,
}: {
  search: CommandSearchSearch<T>
  children?: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const value = React.useMemo<CommandSearchContextValue>(
    () => ({ search: search as CommandSearchSearch<unknown>, open, setOpen }),
    [search, open],
  )
  return (
    <CommandSearchContext.Provider value={value}>
      {children}
    </CommandSearchContext.Provider>
  )
}
CommandSearch.displayName = 'CommandSearch'

const CommandSearchTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { asChild?: boolean }
>(({ className, asChild = false, children, onClick, ...props }, ref) => {
  const { setOpen } = useCommandSearchContext()
  if (asChild) {
    return (
      <Slot
        ref={ref}
        className={className}
        onClick={(e) => {
          onClick?.(e as React.MouseEvent<HTMLButtonElement>)
          if (!e.defaultPrevented) setOpen(true)
        }}
        {...props}
      >
        {children}
      </Slot>
    )
  }
  return (
    <button
      ref={ref}
      data-slot="command-search-trigger"
      type="button"
      className={cn(className)}
      onClick={(e) => {
        onClick?.(e)
        setOpen(true)
      }}
      {...props}
    >
      {children ?? <SearchIcon className="size-5" aria-hidden="true" />}
    </button>
  )
})
CommandSearchTrigger.displayName = 'CommandSearchTrigger'

function CommandSearchContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandDialog>) {
  const { open, setOpen } = useCommandSearchContext()
  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className={className}
      {...props}
    >
      {children}
    </CommandDialog>
  )
}
CommandSearchContent.displayName = 'CommandSearchContent'

const CommandSearchInput = React.forwardRef<
  React.ComponentRef<typeof CommandInput>,
  React.ComponentProps<typeof CommandInput>
>(({ className, 'aria-label': ariaLabel = 'Search', ...props }, ref) => {
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      node?.setAttribute('role', 'textbox')
      node?.removeAttribute('aria-labelledby')
      assignRef(ref, node)
    },
    [ref],
  )

  return (
    <CommandInput
      ref={setInputRef}
      aria-label={ariaLabel}
      className={className}
      {...props}
    />
  )
})
CommandSearchInput.displayName = 'CommandSearchInput'

const CommandSearchList = React.forwardRef<
  React.ComponentRef<typeof CommandList>,
  React.ComponentProps<typeof CommandList>
>(({ className, ...props }, ref) => (
  <CommandList ref={ref} className={className} {...props} />
))
CommandSearchList.displayName = 'CommandSearchList'

const CommandSearchEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandEmpty>,
  React.ComponentProps<typeof CommandEmpty>
>((props, ref) => <CommandEmpty ref={ref} {...props} />)
CommandSearchEmpty.displayName = 'CommandSearchEmpty'

type CommandSearchGroupProps = Omit<
  React.ComponentProps<typeof CommandGroup>,
  'children'
> & {
  children?: (item: any) => React.ReactNode
}

function CommandSearchGroup({
  heading,
  className,
  children,
  ...props
}: CommandSearchGroupProps) {
  const { search, setOpen } = useCommandSearchContext()
  return (
    <CommandGroup heading={heading} className={className} {...props}>
      {search.items.map((item) => {
        const key = search.getKey(item)
        const value = search.getValue(item)
        const handleSelect = () => {
          const result = search.onSelect(item)
          if (result && typeof result.then === 'function') {
            void result.then(
              () => setOpen(false),
              () => {},
            )
          } else {
            setOpen(false)
          }
        }
        return (
          <CommandItem key={key} value={value} onSelect={handleSelect}>
            {typeof children === 'function' ? children(item) : children}
          </CommandItem>
        )
      })}
    </CommandGroup>
  )
}
CommandSearchGroup.displayName = 'CommandSearchGroup'

export {
  CommandSearch,
  CommandSearchTrigger,
  CommandSearchContent,
  CommandSearchInput,
  CommandSearchList,
  CommandSearchEmpty,
  CommandSearchGroup,
}

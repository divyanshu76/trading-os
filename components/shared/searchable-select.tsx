'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'cmdk'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchableSelectProps {
  options: { label: string; value: string }[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  name?: string
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled,
  className,
  name
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const s = search.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(s) || o.value.toLowerCase().includes(s))
  }, [options, search])

  const selectedOption = options.find((o) => o.value === value)

  // Using react-window since timezone list is huge
  // We'll avoid it if not needed, but there are ~500 timezones.
  // Actually, cmdk handles 500 items fine without virtualization if rendered normally, 
  // but let's just use standard rendering first for simplicity and if it lags we can virtualize.
  // 500 items in React is fast enough on modern devices for a dropdown.

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--input))] px-3 py-2 text-sm text-[hsl(var(--foreground))] ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm hover:border-[hsl(var(--border)/0.4)]",
          className
        )}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </PopoverPrimitive.Trigger>
      {/* Hidden input for form submission if name is provided */}
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={6}
          avoidCollisions={true}
          collisionPadding={12}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] max-h-[min(320px,calc(100vh-24px))] overflow-hidden rounded-[14px] border border-[hsl(var(--border)/0.15)] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-[0_12px_48px_rgba(20,24,28,0.12)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 p-1.5"
        >
          <Command className="flex h-full w-full flex-col overflow-hidden bg-transparent" shouldFilter={false}>
            <div className="flex items-center border-b border-[hsl(var(--border)/0.1)] px-3">
              <CommandInput
                placeholder={searchPlaceholder}
                value={search}
                onValueChange={setSearch}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandList className="max-h-[min(240px,calc(100vh-90px))] overflow-y-auto overflow-x-hidden scrollbar-thin mt-1">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onValueChange(option.value)
                      setOpen(false)
                      setSearch("")
                    }}
                    className="relative flex cursor-default select-none items-center rounded-[8px] px-2 py-2 text-[14px] font-medium outline-none aria-selected:bg-[hsl(var(--muted))] aria-selected:text-[hsl(var(--foreground))] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected=true]:bg-[rgba(101,117,124,0.08)] data-[selected=true]:font-semibold transition-colors my-0.5 mx-1"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

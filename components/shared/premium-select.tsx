'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const PremiumSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    value?: string;
    onValueChange?: (value: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
    disabled?: boolean;
    name?: string;
  }
>(({ className, value, onValueChange, options, placeholder, disabled, name, ...props }, ref) => {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled} name={name}>
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-[hsl(var(--border)/0.2)] bg-[hsl(var(--input))] px-3 py-2 text-sm text-[hsl(var(--foreground))] ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm hover:border-[hsl(var(--border)/0.4)]",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "relative z-50 max-h-[min(320px,calc(100vh-24px))] min-w-[8rem] overflow-hidden rounded-[14px] border border-[hsl(var(--border)/0.15)] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-[0_12px_48px_rgba(20,24,28,0.12)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
          position="popper"
          sideOffset={6}
          avoidCollisions={true}
          collisionPadding={12}
        >
          <SelectPrimitive.Viewport className="p-1.5 h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scrollbar-thin">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-[8px] py-2 pl-8 pr-3 text-[14px] font-medium outline-none focus:bg-[hsl(var(--muted))] focus:text-[hsl(var(--foreground))] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-[rgba(101,117,124,0.08)] data-[state=checked]:font-semibold transition-colors my-0.5"
                )}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
})
PremiumSelect.displayName = "PremiumSelect"

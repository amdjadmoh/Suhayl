import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Soft grey: the everyday button
        default: "bg-paper-sunken text-ink hover:bg-rule",
        // Brand blue: the one thing to press on a page
        primary: "bg-brand text-on-brand hover:bg-brand-hover",
        destructive: "bg-stamp text-white hover:bg-stamp/90 dark:text-paper",
        outline: "border border-rule bg-paper-raised text-ink hover:border-input hover:bg-paper-hover",
        secondary: "bg-brand-soft text-brand-ink hover:bg-brand-soft/70",
        ghost: "text-ink-2 hover:bg-paper-sunken hover:text-ink",
        link: "h-auto rounded-md px-0 text-brand-ink hover:underline hover:underline-offset-4 active:scale-100",
      },
      size: {
        default: "h-10 px-5 has-[>svg]:px-4",
        xs: "h-7 gap-1 px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3.5 text-[13px] has-[>svg]:px-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-7 text-[15px] has-[>svg]:px-6",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

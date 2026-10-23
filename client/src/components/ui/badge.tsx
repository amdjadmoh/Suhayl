import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Soft tinted pills
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs leading-5 font-semibold whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper",
        secondary: "bg-paper-sunken text-ink-2",
        outline: "bg-paper-sunken text-ink-2",
        moss: "bg-moss-soft text-moss",
        stamp: "bg-stamp-soft text-stamp",
        ochre: "bg-ochre-soft text-ochre",
        sea: "bg-brand-soft text-brand-ink",
        destructive: "bg-stamp text-white",
        ghost: "text-ink-3",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
)

function Badge({
  className,
  variant = "outline",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

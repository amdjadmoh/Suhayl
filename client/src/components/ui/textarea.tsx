import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-xl border border-input bg-paper-raised px-3.5 py-2.5 text-[15px] leading-relaxed text-ink transition-[border-color,box-shadow] outline-none placeholder:text-ink-4 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-brand focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_16%,transparent)]",
        "aria-invalid:border-stamp",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

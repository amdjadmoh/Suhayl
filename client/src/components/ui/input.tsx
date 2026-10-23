import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-input bg-paper-raised px-3.5 py-1 text-[15px] text-ink transition-[border-color,box-shadow] outline-none placeholder:text-ink-4 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
        "focus-visible:border-brand focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_16%,transparent)]",
        "aria-invalid:border-stamp",
        className
      )}
      {...props}
    />
  )
}

export { Input }

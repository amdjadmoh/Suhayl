import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme = "light" } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-moss" />,
        info: <InfoIcon className="size-4 text-sea" />,
        warning: <TriangleAlertIcon className="size-4 text-ochre" />,
        error: <OctagonXIcon className="size-4 text-stamp" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "!font-sans !text-[13.5px] !shadow-[0_12px_32px_-12px_rgb(0_0_0/0.3)]",
          description: "!text-ink-3",
        },
      }}
      style={
        {
          "--normal-bg": "var(--paper-raised)",
          "--normal-text": "var(--ink)",
          "--normal-border": "var(--rule)",
          "--border-radius": "16px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

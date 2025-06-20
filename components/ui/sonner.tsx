"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--success)",
          "--success-text": "var(--success-foreground)",
          "--success-border": "var(--success)",
          "--error-bg": "var(--destructive)",
          "--error-text": "var(--destructive-foreground)",
          "--error-border": "var(--destructive)",
          "--warning-bg": "var(--warning)",
          "--warning-text": "var(--warning-foreground)",
          "--warning-border": "var(--warning)",
          "--info-bg": "var(--info)",
          "--info-text": "var(--info-foreground)",
          "--info-border": "var(--info)",
          "--toast-bg": "var(--popover)",
          "--toast-text": "var(--popover-foreground)",
          "--toast-border": "var(--border)",
          "--toast-accent": "var(--primary)",
          "--toast-cancel": "var(--muted)",
          "--toast-cancel-foreground": "var(--muted-foreground)",
          "--toast-shadow": "var(--shadow)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'success'
  size?: 'default' | 'sm' | 'lg'
}

function Badge({ className, variant = 'primary', size = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "badge",
        `badge--${variant}`,
        size !== 'default' && `badge--${size}`,
        className
      )}
      {...props}
    />
  )
}

export { Badge }

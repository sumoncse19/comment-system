import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', loading, children, disabled, asChild, ...props }, ref) => {
    // Build class names based on variant and size
    const classes = cn(
      'btn',
      {
        'btn--primary': variant === 'primary',
        'btn--secondary': variant === 'secondary',
        'btn--destructive': variant === 'destructive',
        'btn--outline': variant === 'outline',
        'btn--ghost': variant === 'ghost',
        'btn--link': variant === 'link',
        'btn--sm': size === 'sm',
        'btn--lg': size === 'lg',
        'btn--icon': size === 'icon',
        'btn--loading': loading,
      },
      className
    )

    // If asChild is true, we just render children (for Link components)
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes, (children as React.ReactElement<{ className?: string }>).props.className),
      })
    }

    return (
      <button
        className={classes}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }

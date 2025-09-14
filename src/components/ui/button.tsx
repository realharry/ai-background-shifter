import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const getButtonStyles = (variant: ButtonProps['variant'] = 'default', size: ButtonProps['size'] = 'default') => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
  }

  const sizeStyles: Record<NonNullable<ButtonProps['size']>, React.CSSProperties> = {
    default: { height: '40px', padding: '0 16px' },
    sm: { height: '36px', padding: '0 12px', borderRadius: '6px' },
    lg: { height: '44px', padding: '0 32px', borderRadius: '6px' },
    icon: { height: '40px', width: '40px', padding: '0' },
  }

  const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
    default: {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
    destructive: {
      backgroundColor: '#dc2626',
      color: 'white',
    },
    outline: {
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      color: '#1f2937',
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      color: '#1f2937',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#1f2937',
    },
    link: {
      color: '#3b82f6',
      textDecoration: 'underline',
      backgroundColor: 'transparent',
    },
  }

  const hoverStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
    default: { backgroundColor: '#2563eb' },
    destructive: { backgroundColor: '#b91c1c' },
    outline: { backgroundColor: '#f9fafb' },
    secondary: { backgroundColor: '#e5e7eb' },
    ghost: { backgroundColor: '#f3f4f6' },
    link: { textDecoration: 'underline' },
  }

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ':hover': hoverStyles[variant],
  }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const buttonStyles = getButtonStyles(variant, size)
    
    const combinedStyles: React.CSSProperties = {
      ...buttonStyles,
      ...(isHovered && variant === 'default' && { backgroundColor: '#2563eb' }),
      ...(isHovered && variant === 'destructive' && { backgroundColor: '#b91c1c' }),
      ...(isHovered && variant === 'outline' && { backgroundColor: '#f9fafb' }),
      ...(isHovered && variant === 'secondary' && { backgroundColor: '#e5e7eb' }),
      ...(isHovered && variant === 'ghost' && { backgroundColor: '#f3f4f6' }),
      ...(props.disabled && { opacity: 0.5, cursor: 'not-allowed' }),
      ...style,
    }

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(true)
      onMouseEnter?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false)
      onMouseLeave?.(e)
    }

    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        style={combinedStyles}
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
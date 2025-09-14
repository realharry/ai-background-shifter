import * as React from "react"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ style, type, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const baseStyles: React.CSSProperties = {
      display: 'flex',
      height: '40px',
      width: '100%',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      padding: '0 12px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s',
      fontFamily: 'inherit',
    }

    const focusStyles: React.CSSProperties = {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
    }

    const disabledStyles: React.CSSProperties = {
      cursor: 'not-allowed',
      opacity: 0.5,
    }

    const combinedStyles: React.CSSProperties = {
      ...baseStyles,
      ...(isFocused && focusStyles),
      ...(props.disabled && disabledStyles),
      ...style,
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    return (
      <input
        type={type}
        style={combinedStyles}
        ref={ref}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
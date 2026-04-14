import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md bg-[#e0e3e5] px-3 py-2 text-sm text-[#191c1e] ghost-border ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#45464d] focus-visible:outline-none focus-visible:border-[#006c49] focus-visible:border-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

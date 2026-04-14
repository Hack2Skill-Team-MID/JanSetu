import * as React from "react"
import { cn } from "../../lib/utils"

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
          active 
            ? "bg-[#6cf8bb] text-[#00714d]" // secondary_container and on_secondary_container
            : "bg-[#e0e3e5] text-[#45464d]", // surface_container_highest and on_surface_variant
          className
        )}
        {...props}
      />
    )
  }
)
Chip.displayName = "Chip"

export { Chip }

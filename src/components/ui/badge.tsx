import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#30363d] bg-[#1f2631] text-[#9da7b3]",
        success: "border-[#1b4f30] bg-[#0f2a1c] text-[#3fb950]",
        warning: "border-[#5b4223] bg-[#2e2111] text-[#d29922]",
        danger: "border-[#5b2223] bg-[#2a1112] text-[#f85149]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

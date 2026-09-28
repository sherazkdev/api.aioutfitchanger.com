import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "outline" | "ai";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const styles: Record<Variant, string> = {
  primary: "bg-gray-900 text-white hover:bg-gray-800 border-gray-900 shadow-sm dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:border-gray-100",
  outline: "bg-[var(--color-card)] text-gray-900 hover:bg-gray-50 border-gray-200 dark:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-700",
  ai: "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:hover:bg-violet-900/50 dark:border-violet-800",
};

const sizes = { sm: "h-8 px-3 text-xs gap-1.5", md: "h-9 px-4 text-sm gap-2", lg: "h-11 px-5 text-sm gap-2" };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        styles[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
export default Button;

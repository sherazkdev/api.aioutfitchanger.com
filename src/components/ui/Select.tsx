import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-gray-100">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn("h-10 w-full appearance-none rounded-lg border border-gray-200 bg-[var(--color-card)] px-3 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-gray-100/10", className)}
            {...props}
          >
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        {hint && <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
export default Select;

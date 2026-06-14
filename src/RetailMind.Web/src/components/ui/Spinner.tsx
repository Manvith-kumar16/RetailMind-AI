import { cn } from "../../utils/cn";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-primary-600 border-e-transparent",
        size === "sm" && "h-4 w-4 border-[2px]",
        size === "md" && "h-8 w-8 border-[3px]",
        size === "lg" && "h-12 w-12 border-[4px]",
        className
      )}
      role="status"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

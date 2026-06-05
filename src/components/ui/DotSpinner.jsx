import { cn } from "@/lib/utils";
import "./dot-spinner.css";

/** Four-dot, two-layer spinning loader. */
export function DotSpinner({ className }) {
  return <div className={cn("dot-spinner", className)} role="status" aria-label="Loading" />;
}

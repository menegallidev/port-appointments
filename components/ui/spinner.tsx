import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function Spinner({ className }: Props) {
  return <Loader2 className={cn("size-4 animate-spin", className)} />;
}

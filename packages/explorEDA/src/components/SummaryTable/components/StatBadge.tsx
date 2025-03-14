import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDown, ArrowUp, Hash } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatBadgeProps {
  type: "min" | "max" | "common";
  value: string | number;
  count?: number;
  icon?: LucideIcon;
}

const defaultIcons: Record<StatBadgeProps["type"], LucideIcon> = {
  min: ArrowDown,
  max: ArrowUp,
  common: Hash,
};

export function StatBadge({
  type,
  value,
  count,
  icon: IconProp,
}: StatBadgeProps) {
  const Icon = IconProp || defaultIcons[type];
  const tooltipContent = count !== undefined ? `Count: ${count}` : value;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="secondary" className="gap-1">
            <Icon className="h-3 w-3" />
            <span className="truncate max-w-[100px]">{value}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

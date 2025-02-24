import { DataType } from "../utils/dataTypeDetection";
import { Hash, Calendar, Type, HelpCircle, ToggleLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataTypeIconProps {
  type: DataType | "unknown";
}

export function DataTypeIcon({ type }: DataTypeIconProps) {
  const iconMap: Record<
    DataType | "unknown",
    { icon: typeof Hash; label: string }
  > = {
    numeric: { icon: Hash, label: "Numeric" },
    datetime: { icon: Calendar, label: "Date/Time" },
    categorical: { icon: Type, label: "Categorical" },
    boolean: { icon: ToggleLeft, label: "Boolean" },
    unknown: { icon: HelpCircle, label: "Unknown" },
  };

  const { icon: Icon, label } = iconMap[type];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Icon className="h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import { Calendar, Hash, HelpCircle, ToggleLeft, Type } from "lucide-react";
import { DataType } from "../utils/dataTypeDetection";

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

  return <Icon className="h-4 w-4" />;
}

import { ChartSettingsPanelProps } from "@/types/ChartTypes";
import { SummaryTableSettings } from "./definition";

export function SummaryTableSettingsPanel({
  settings,
  onSettingsChange,
}: ChartSettingsPanelProps<SummaryTableSettings>) {
  // Summary table has no additional settings beyond the base settings
  return null;
}

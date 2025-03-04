import {
  ChartSettings,
  RowChartSettings,
  ScatterChartSettings,
} from "@/types/ChartTypes";
import {
  DEFAULT_AXIS_SETTINGS,
  DEFAULT_MARGIN_SETTINGS,
  DEFAULT_CHART_SETTINGS,
  getDefaultSettingsForType,
} from "./defaultSettings";

export function getChangedSettings(settings: ChartSettings) {
  const defaults = getDefaultSettingsForType(settings.type);
  const changedSettings = [];

  // Check basic settings
  if (settings.showTitle !== defaults.showTitle) {
    changedSettings.push({
      key: "showTitle",
      defaultValue: defaults.showTitle,
      currentValue: settings.showTitle,
    });
  }

  if (settings.showLegend !== defaults.showLegend) {
    changedSettings.push({
      key: "showLegend",
      defaultValue: defaults.showLegend,
      currentValue: settings.showLegend,
    });
  }

  if (settings.showTooltip !== defaults.showTooltip) {
    changedSettings.push({
      key: "showTooltip",
      defaultValue: defaults.showTooltip,
      currentValue: settings.showTooltip,
    });
  }

  // Check axis settings
  ["x", "y"].forEach((axis) => {
    const axisKey = `${axis}Axis` as keyof ChartSettings;
    const axisSettings = settings[axisKey];
    const defaultAxisSettings = DEFAULT_AXIS_SETTINGS;

    if (axisSettings) {
      Object.entries(axisSettings).forEach(([key, value]) => {
        const defaultValue =
          defaultAxisSettings[key as keyof typeof defaultAxisSettings];
        if (value !== defaultValue) {
          changedSettings.push({
            key: `${axisKey}.${key}`,
            defaultValue,
            currentValue: value,
          });
        }
      });
    }
  });

  // Check margin settings
  if (settings.margin) {
    Object.entries(settings.margin).forEach(([key, value]) => {
      const defaultValue =
        DEFAULT_MARGIN_SETTINGS[key as keyof typeof DEFAULT_MARGIN_SETTINGS];
      if (value !== defaultValue) {
        changedSettings.push({
          key: `margin.${key}`,
          defaultValue,
          currentValue: value,
        });
      }
    });
  }

  // Check type-specific settings
  switch (settings.type) {
    case "row": {
      const rowDefaults = defaults as Partial<RowChartSettings>;
      const rowSettings = settings as RowChartSettings;
      if (rowSettings.minRowHeight !== rowDefaults.minRowHeight) {
        changedSettings.push({
          key: "minRowHeight",
          defaultValue: rowDefaults.minRowHeight,
          currentValue: rowSettings.minRowHeight,
        });
      }
      if (rowSettings.maxRowHeight !== rowDefaults.maxRowHeight) {
        changedSettings.push({
          key: "maxRowHeight",
          defaultValue: rowDefaults.maxRowHeight,
          currentValue: rowSettings.maxRowHeight,
        });
      }
      break;
    }
    case "scatter": {
      const scatterDefaults = defaults as Partial<ScatterChartSettings>;
      const scatterSettings = settings as ScatterChartSettings;
      if (scatterSettings.xField !== scatterDefaults.xField) {
        changedSettings.push({
          key: "xField",
          defaultValue: scatterDefaults.xField,
          currentValue: scatterSettings.xField,
        });
      }
      if (scatterSettings.yField !== scatterDefaults.yField) {
        changedSettings.push({
          key: "yField",
          defaultValue: scatterDefaults.yField,
          currentValue: scatterSettings.yField,
        });
      }
      break;
    }
  }

  return changedSettings;
}

export function formatSettingKey(key: string): string {
  return key
    .split(".")
    .map((part) => {
      // Convert camelCase to Title Case
      return part
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    })
    .join(" - ");
}

export function formatSettingValue(value: any): string {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "string") {
    return value || "(empty)";
  }
  return JSON.stringify(value);
}

export function isSettingChanged(
  settings: ChartSettings,
  key: string
): boolean {
  const changedSettings = getChangedSettings(settings);
  return changedSettings.some((setting) => setting.key === key);
}

export function isAxisSettingChanged(
  settings: ChartSettings,
  axis: "x" | "y",
  key: string
): boolean {
  return isSettingChanged(settings, `${axis}Axis.${key}`);
}

export function isMarginSettingChanged(
  settings: ChartSettings,
  side: keyof typeof DEFAULT_MARGIN_SETTINGS
): boolean {
  return isSettingChanged(settings, `margin.${side}`);
}

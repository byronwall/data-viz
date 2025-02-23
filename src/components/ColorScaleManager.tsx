import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useColorScales } from "@/hooks/useColorScales";
import {
  CategoricalColorScale,
  ColorScaleType,
  NumericalColorScale,
} from "@/types/ColorScaleTypes";
import {
  interpolateCool,
  interpolateInferno,
  interpolateMagma,
  interpolatePlasma,
  interpolateViridis,
  interpolateWarm,
  schemeCategory10,
  schemeSet3,
} from "d3-scale-chromatic";
import { Palette } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useFavicon } from "react-use";

const NUMERICAL_PALETTES = [
  { name: "Viridis", interpolator: interpolateViridis },
  { name: "Inferno", interpolator: interpolateInferno },
  { name: "Magma", interpolator: interpolateMagma },
  { name: "Plasma", interpolator: interpolatePlasma },
  { name: "Warm", interpolator: interpolateWarm },
  { name: "Cool", interpolator: interpolateCool },
];

const CATEGORICAL_PALETTES = [
  { name: "Category10", colors: [...schemeCategory10] },
  { name: "Set3", colors: [...schemeSet3] },
];

interface ColorScaleEditorState {
  scales: ColorScaleType[];
  isDirty: boolean;
}

function NumericalScalePreview({ palette }: { palette: string }) {
  const interpolator = NUMERICAL_PALETTES.find(
    (p) => p.name === palette
  )?.interpolator;
  if (!interpolator) {
    return null;
  }

  return (
    <div className="w-full h-8 rounded-md overflow-hidden">
      <div
        className="w-full h-full"
        style={{
          background: `linear-gradient(to right, ${Array.from(
            { length: 10 },
            (_, i) => interpolator(i / 9)
          ).join(", ")})`,
        }}
      />
    </div>
  );
}

function CategoricalScalePreview({ colors }: { colors: string[] }) {
  return (
    <div className="flex w-full h-8 rounded-md overflow-hidden">
      {colors.map((color, i) => (
        <div
          key={i}
          className="flex-1 h-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function NumericalScaleEditor({
  scale,
  onUpdate,
}: {
  scale: NumericalColorScale;
  onUpdate: (scale: NumericalColorScale) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={scale.name}
          onChange={(e) => onUpdate({ ...scale, name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Min</Label>
          <Input
            type="number"
            value={scale.min}
            onChange={(e) =>
              onUpdate({ ...scale, min: parseFloat(e.target.value) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Max</Label>
          <Input
            type="number"
            value={scale.max}
            onChange={(e) =>
              onUpdate({ ...scale, max: parseFloat(e.target.value) })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Palette</Label>
        <div className="grid grid-cols-2 gap-2">
          {NUMERICAL_PALETTES.map((p) => (
            <Button
              key={p.name}
              variant={scale.palette === p.name ? "default" : "outline"}
              className="w-full h-auto p-2"
              onClick={() => onUpdate({ ...scale, palette: p.name })}
            >
              <div className="w-full space-y-2">
                <span>{p.name}</span>
                <NumericalScalePreview palette={p.name} />
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoricalScaleEditor({
  scale,
  onUpdate,
}: {
  scale: CategoricalColorScale;
  onUpdate: (scale: CategoricalColorScale) => void;
}) {
  const [editingColor, setEditingColor] = useState<{
    value: string;
    color: string;
  } | null>(null);

  const updateColor = useCallback(
    (value: string, newColor: string) => {
      const newMapping = new Map(scale.mapping);
      newMapping.set(value, newColor);
      const newPalette = Array.from(newMapping.values());
      onUpdate({ ...scale, mapping: newMapping, palette: newPalette });
    },
    [scale, onUpdate]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={scale.name}
          onChange={(e) => onUpdate({ ...scale, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Preset Palettes</Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORICAL_PALETTES.map((p) => (
            <Button
              key={p.name}
              variant="outline"
              className="w-full h-auto p-2"
              onClick={() => {
                const newMapping = new Map();
                Array.from(scale.mapping.keys()).forEach((value, i) => {
                  newMapping.set(value, p.colors[i % p.colors.length]);
                });
                onUpdate({
                  ...scale,
                  mapping: newMapping,
                  palette: Array.from(newMapping.values()),
                });
              }}
            >
              <div className="w-full space-y-2">
                <span>{p.name}</span>
                <CategoricalScalePreview colors={p.colors} />
              </div>
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Category Colors</Label>
        <div className="grid grid-cols-2 gap-2">
          {Array.from(scale.mapping.entries()).map(([value, color]) => (
            <Button
              key={value}
              variant="outline"
              className="w-full"
              onClick={() => setEditingColor({ value, color })}
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">{value}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {editingColor && (
        <Dialog open={true} onOpenChange={() => setEditingColor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Color for {editingColor.value}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <HexColorPicker
                color={editingColor.color}
                onChange={(newColor) =>
                  updateColor(editingColor.value, newColor)
                }
              />
              <Input
                value={editingColor.color}
                onChange={(e) =>
                  updateColor(editingColor.value, e.target.value)
                }
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function ColorScaleManager() {
  const { colorScales, updateColorScale, addColorScale, removeColorScale } =
    useColorScales();

  const [state, setState] = useState<ColorScaleEditorState>({
    scales: colorScales,
    isDirty: false,
  });

  useEffect(() => {
    setState({ scales: colorScales, isDirty: false });
  }, [colorScales]);

  const numericalScales = state.scales.filter(
    (s): s is NumericalColorScale => s.type === "numerical"
  );
  const categoricalScales = state.scales.filter(
    (s): s is CategoricalColorScale => s.type === "categorical"
  );

  const handleSave = () => {
    // Apply all changes
    state.scales.forEach((scale) => {
      const { id, ...scaleWithoutId } = scale;
      updateColorScale(id, scaleWithoutId);
    });
    setState((prev) => ({ ...prev, isDirty: false }));
  };

  const handleScaleUpdate = (updatedScale: ColorScaleType) => {
    setState((prev) => ({
      scales: prev.scales.map((s) =>
        s.id === updatedScale.id ? updatedScale : s
      ),
      isDirty: true,
    }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="w-4 h-4 mr-2" />
          Color Scales
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Color Scale Manager</DialogTitle>
          <DialogDescription>
            Manage color scales for your visualizations
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="numerical" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="numerical" className="flex-1">
              Numerical Scales
            </TabsTrigger>
            <TabsTrigger value="categorical" className="flex-1">
              Categorical Scales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="numerical" className="space-y-4">
            {numericalScales.map((scale) => (
              <div key={scale.id} className="space-y-4 border p-4 rounded-lg">
                <NumericalScaleEditor
                  scale={scale}
                  onUpdate={handleScaleUpdate}
                />
                <NumericalScalePreview palette={scale.palette} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="categorical" className="space-y-4">
            {categoricalScales.map((scale) => (
              <div key={scale.id} className="space-y-4 border p-4 rounded-lg">
                <CategoricalScaleEditor
                  scale={scale}
                  onUpdate={handleScaleUpdate}
                />
                <CategoricalScalePreview colors={scale.palette} />
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setState({ scales: colorScales, isDirty: false })}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!state.isDirty}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

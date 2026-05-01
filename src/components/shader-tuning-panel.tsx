"use client";

import { useState } from "react";
import {
  SHADER_TUNING_DEFAULTS,
  SHADER_TUNING_PRESETS,
  type GlyphSignal,
  type ShaderTuning,
  type ShapeKind,
} from "./hero-ascii";

type Variant = "X" | "Y" | "Z";

interface ShaderTuningPanelProps {
  tuning: ShaderTuning;
  onTuningChange: (t: ShaderTuning) => void;
  showPresets?: boolean;
}

type SliderControl = {
  kind: "slider";
  key: keyof ShaderTuning;
  label: string;
  min: number;
  max: number;
  step: number;
};

type GlyphSignalControl = {
  kind: "select";
  key: "glyphSignal";
  label: string;
  options: { value: GlyphSignal; label: string }[];
};

type ShapeSelectControl = {
  kind: "shapeSelect";
  key: "shape";
  label: string;
  options: { value: ShapeKind; label: string }[];
};

type Control = SliderControl | GlyphSignalControl | ShapeSelectControl;

interface Section {
  legend: string;
  controls: Control[];
  advanced?: Control[];
}

const SECTIONS: Section[] = [
  {
    legend: "Signal",
    controls: [
      {
        kind: "select",
        key: "glyphSignal",
        label: "Glyph signal",
        options: [
          { value: "luminance", label: "Luminance" },
          { value: "red", label: "Red" },
          { value: "green", label: "Green" },
          { value: "blue", label: "Blue" },
        ],
      },
      { kind: "slider", key: "threshold", label: "Threshold", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    legend: "Curve",
    controls: [
      { kind: "slider", key: "gamma", label: "Gamma", min: 0.1, max: 3, step: 0.05 },
    ],
    advanced: [
      { kind: "slider", key: "blackPoint", label: "Black point", min: 0, max: 1, step: 0.01 },
      { kind: "slider", key: "whitePoint", label: "White point", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    legend: "Animation",
    controls: [
      { kind: "slider", key: "shimmerAmount", label: "Shimmer amount", min: 0, max: 2, step: 0.05 },
      { kind: "slider", key: "shimmerSpeed", label: "Shimmer speed", min: 0, max: 20, step: 0.5 },
      { kind: "slider", key: "durationMs", label: "Duration (ms)", min: 500, max: 10000, step: 100 },
    ],
  },
  {
    legend: "Layout",
    controls: [
      { kind: "slider", key: "colsStart", label: "Cols start", min: 10, max: 80, step: 1 },
      { kind: "slider", key: "colsEnd", label: "Cols end", min: 30, max: 150, step: 1 },
      { kind: "slider", key: "minCellPx", label: "Min cell px", min: 3, max: 20, step: 1 },
    ],
  },
  {
    legend: "Shape",
    controls: [
      {
        kind: "shapeSelect",
        key: "shape",
        label: "Shape",
        options: [
          { value: "none", label: "None (full square)" },
          { value: "circle", label: "Circle" },
          { value: "roundedRect", label: "Rounded rect" },
        ],
      },
      { kind: "slider", key: "cornerRadius", label: "Corner radius (px)", min: 0, max: 200, step: 1 },
      { kind: "slider", key: "shapeSoftness", label: "Edge softness (px)", min: 1, max: 200, step: 1 },
      { kind: "slider", key: "edgeFade", label: "Edge fade", min: 0, max: 1, step: 0.05 },
    ],
  },
];

const PRESET_IDS: Variant[] = ["X", "Y", "Z"];

function isDirty(value: ShaderTuning[keyof ShaderTuning], defaultValue: ShaderTuning[keyof ShaderTuning]): boolean {
  return value !== defaultValue;
}

function formatValue(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

export function ShaderTuningPanel({
  tuning,
  onTuningChange,
  showPresets = true,
}: ShaderTuningPanelProps) {
  const [copied, setCopied] = useState(false);

  const updateField = <K extends keyof ShaderTuning>(key: K, value: ShaderTuning[K]) => {
    onTuningChange({ ...tuning, [key]: value });
  };

  const applyPreset = (id: Variant) => {
    onTuningChange({ ...tuning, ...SHADER_TUNING_PRESETS[id] });
  };

  const reset = () => {
    onTuningChange({ ...SHADER_TUNING_DEFAULTS });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(tuning, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const json = JSON.stringify(tuning, null, 2);

  const renderControl = (c: Control) => {
    const value = tuning[c.key];
    const defaultValue = SHADER_TUNING_DEFAULTS[c.key];
    const dirty = isDirty(value, defaultValue);

    if (c.kind === "select") {
      return (
        <label key={c.key} className="flex items-center justify-between gap-3 text-sm">
          <span className="font-mono opacity-80">
            {dirty && <span className="text-current mr-1">•</span>}
            {c.label}
          </span>
          <select
            value={value as GlyphSignal}
            onChange={(e) => updateField(c.key, e.target.value as GlyphSignal)}
            className="font-mono text-xs bg-transparent border border-current/30 rounded px-2 py-1 cursor-pointer"
          >
            {c.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (c.kind === "shapeSelect") {
      return (
        <label key={c.key} className="flex items-center justify-between gap-3 text-sm">
          <span className="font-mono opacity-80">
            {dirty && <span className="text-current mr-1">•</span>}
            {c.label}
          </span>
          <select
            value={value as ShapeKind}
            onChange={(e) => updateField(c.key, e.target.value as ShapeKind)}
            className="font-mono text-xs bg-transparent border border-current/30 rounded px-2 py-1 cursor-pointer"
          >
            {c.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    return (
      <label key={c.key} className="flex flex-col gap-1 text-sm">
        <div className="flex justify-between items-baseline gap-2">
          <span className="font-mono opacity-80">
            {dirty && <span className="text-current mr-1">•</span>}
            {c.label}
          </span>
          <span className="font-mono tabular-nums opacity-60 text-xs">
            {formatValue(value as number)}
          </span>
        </div>
        <input
          type="range"
          min={c.min}
          max={c.max}
          step={c.step}
          value={value as number}
          onChange={(e) => updateField(c.key, Number(e.target.value) as ShaderTuning[typeof c.key])}
          className="w-full accent-current cursor-pointer"
        />
      </label>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      {/* Presets */}
      {showPresets && (
      <fieldset className="flex flex-col gap-3">
        <legend className="text-xs font-mono uppercase tracking-wider opacity-60">
          Presets
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className="px-3 py-2 text-sm font-mono font-bold border border-current/40 rounded hover:bg-current/10 transition-colors"
            >
              {id}
            </button>
          ))}
        </div>
      </fieldset>
      )}

      {/* Sections */}
      {SECTIONS.map((section) => (
        <fieldset key={section.legend} className="flex flex-col gap-3">
          <legend className="text-xs font-mono uppercase tracking-wider opacity-60">
            {section.legend}
          </legend>
          <div className="flex flex-col gap-3">
            {section.controls.map(renderControl)}
            {section.advanced && (
              <details className="text-sm">
                <summary className="font-mono opacity-60 cursor-pointer hover:opacity-80 select-none">
                  Advanced
                </summary>
                <div className="flex flex-col gap-3 mt-3 pl-3 border-l border-current/20">
                  {section.advanced.map(renderControl)}
                </div>
              </details>
            )}
          </div>
        </fieldset>
      ))}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={copy}
          className="flex-1 px-4 py-2 text-sm font-mono border border-current rounded hover:bg-current/10 transition-colors"
        >
          {copied ? "Copied!" : "Copy params"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex-1 px-4 py-2 text-sm font-mono border border-current/40 rounded opacity-70 hover:opacity-100 transition-opacity"
        >
          Reset
        </button>
      </div>

      {/* JSON disclosure */}
      <details className="text-xs">
        <summary className="font-mono opacity-60 cursor-pointer hover:opacity-80 select-none">
          Show JSON
        </summary>
        <pre className="font-mono opacity-60 p-3 mt-2 border border-current/20 rounded overflow-auto whitespace-pre-wrap break-all">
          {json}
        </pre>
      </details>
    </div>
  );
}

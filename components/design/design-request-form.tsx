"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ROOM_TYPES,
  DESIGN_STYLES,
  MATERIALS,
  FLOORING_OPTIONS,
  SERVICE_OPTIONS,
  type DesignRequestInput,
  type Material,
} from "@/types/design";

export function DesignRequestForm({
  roomPhotoUrl,
  onSubmit,
  submitting,
}: {
  roomPhotoUrl: string;
  onSubmit: (input: DesignRequestInput) => void;
  submitting: boolean;
}) {
  const [roomType, setRoomType] = useState<DesignRequestInput["roomType"]>(ROOM_TYPES[0]);
  const [style, setStyle] = useState<DesignRequestInput["style"]>(DESIGN_STYLES[0]);
  const [colorPrefs, setColorPrefs] = useState("");
  const [materialPrefs, setMaterialPrefs] = useState<Material[]>([]);
  const [flooringPref, setFlooringPref] = useState<DesignRequestInput["flooringPref"]>(FLOORING_OPTIONS[0]);
  const [budget, setBudget] = useState(1000);
  const [serviceOption, setServiceOption] = useState<DesignRequestInput["serviceOption"]>(SERVICE_OPTIONS[0].value);

  function toggleMaterial(material: Material) {
    setMaterialPrefs((prev) =>
      prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      roomPhotoUrl,
      roomType,
      style,
      colorPrefs,
      materialPrefs,
      flooringPref,
      budget,
      serviceOption,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <Label htmlFor="roomType">Room type</Label>
        <select
          id="roomType"
          className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value as DesignRequestInput["roomType"])}
        >
          {ROOM_TYPES.map((rt) => (
            <option key={rt} value={rt}>{rt}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="style">Interior design style</Label>
        <select
          id="style"
          className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={style}
          onChange={(e) => setStyle(e.target.value as DesignRequestInput["style"])}
        >
          {DESIGN_STYLES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="colorPrefs">Color preferences</Label>
        <Input
          id="colorPrefs"
          placeholder="e.g. warm neutrals, sage green accents"
          value={colorPrefs}
          onChange={(e) => setColorPrefs(e.target.value)}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Material preferences</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {MATERIALS.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={materialPrefs.includes(m)}
                onChange={() => toggleMaterial(m)}
              />
              {m}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <Label htmlFor="flooringPref">Flooring preference</Label>
        <select
          id="flooringPref"
          className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={flooringPref}
          onChange={(e) => setFlooringPref(e.target.value as DesignRequestInput["flooringPref"])}
        >
          {FLOORING_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="budget">Maximum budget (USD)</Label>
        <Input
          id="budget"
          type="number"
          min={0}
          step={50}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Service option</legend>
        <div className="mt-2 flex flex-col gap-2">
          {SERVICE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="serviceOption"
                checked={serviceOption === opt.value}
                onChange={() => setServiceOption(opt.value)}
              />
              {opt.label}
              {!opt.implemented && (
                <span className="text-xs text-muted-foreground">(design only — purchasing coming soon)</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Generating your designs..." : "Generate designs"}
      </Button>
    </form>
  );
}

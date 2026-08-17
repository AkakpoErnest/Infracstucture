export const ROOM_TYPES = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Children's Room",
  "Office",
  "Hallway",
  "Balcony",
  "Other",
] as const;

export const DESIGN_STYLES = [
  "Modern",
  "Minimalist",
  "Scandinavian",
  "Japandi",
  "Luxury",
  "Classic",
  "Industrial",
  "Mediterranean",
  "Bohemian",
  "Rustic",
] as const;

export const MATERIALS = [
  "Painted Walls",
  "Wallpaper",
  "Wood Panels",
  "Stone Cladding",
  "Concrete Finish",
  "Marble",
  "Ceramic",
] as const;

export const FLOORING_OPTIONS = [
  "Hardwood Flooring",
  "Tile",
  "Marble",
  "Concrete",
  "Carpet",
] as const;

export const SERVICE_OPTIONS = [
  { value: "inspiration_only", label: "Design Inspiration Only", implemented: true },
  { value: "ready_to_implement", label: "Ready-to-Implement Design", implemented: true },
  { value: "purchase_only", label: "Purchase Products Only", implemented: false },
  { value: "turnkey", label: "Turnkey Service", implemented: false },
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];
export type DesignStyle = (typeof DESIGN_STYLES)[number];
export type Material = (typeof MATERIALS)[number];
export type Flooring = (typeof FLOORING_OPTIONS)[number];
export type ServiceOptionValue = (typeof SERVICE_OPTIONS)[number]["value"];

export interface DesignRequestInput {
  roomPhotoUrl: string;
  roomType: RoomType;
  style: DesignStyle;
  colorPrefs: string;
  materialPrefs: Material[];
  flooringPref: Flooring;
  budget: number;
  serviceOption: ServiceOptionValue;
}

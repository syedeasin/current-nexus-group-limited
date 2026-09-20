import {
  Layers,
  Settings,
  Sun,
  Zap,
  Battery,
  BatteryCharging,
  Leaf,
  ShieldCheck,
  Gauge,
  CircleDollarSign,
  Factory,
  Home,
  Building2,
  Wrench,
  Cpu,
  PlugZap,
  type LucideIcon,
} from "lucide-react";

/**
 * The lucide icons a Solutions page can reference by name (case-study specs, and
 * the dashboard icon picker). Stored as a string on the page data; resolved to a
 * component here. Keep keys in sync with the dashboard picker.
 */
export const SOLUTION_ICONS = {
  Layers,
  Settings,
  Sun,
  Zap,
  Battery,
  BatteryCharging,
  Leaf,
  ShieldCheck,
  Gauge,
  CircleDollarSign,
  Factory,
  Home,
  Building2,
  Wrench,
  Cpu,
  PlugZap,
} satisfies Record<string, LucideIcon>;

export type SolutionIconName = keyof typeof SOLUTION_ICONS;

export const SOLUTION_ICON_NAMES = Object.keys(SOLUTION_ICONS) as SolutionIconName[];

/** Resolve a stored icon name to a lucide component, falling back to Layers. */
export function resolveSolutionIcon(name: string): LucideIcon {
  return SOLUTION_ICONS[name as SolutionIconName] ?? Layers;
}

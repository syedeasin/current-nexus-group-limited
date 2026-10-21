import {
  Activity,
  Award,
  BadgeCheck,
  BatteryCharging,
  Blend,
  BookOpen,
  Building2,
  ClipboardList,
  Cpu,
  Factory,
  FileCheck,
  FileText,
  Gauge,
  Globe,
  Handshake,
  Headset,
  Layers,
  Leaf,
  Lightbulb,
  ListChecks,
  Maximize2,
  PlugZap,
  Repeat,
  Settings2,
  ShieldCheck,
  Sun,
  Thermometer,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Icons an admin can pick for an "icon" field in Dashboard → Pages. Stored
 * by key in the message tree; components resolve the key here, falling back
 * to a neutral icon for an unknown key rather than rendering nothing.
 */
export const PAGE_ICONS: Record<string, LucideIcon> = {
  cpu: Cpu,
  "trending-up": TrendingUp,
  globe: Globe,
  factory: Factory,
  blend: Blend,
  "shield-check": ShieldCheck,
  handshake: Handshake,
  "clipboard-list": ClipboardList,
  settings: Settings2,
  truck: Truck,
  headset: Headset,
  sun: Sun,
  zap: Zap,
  battery: BatteryCharging,
  leaf: Leaf,
  award: Award,
  users: Users,
  wrench: Wrench,
  building: Building2,
  lightbulb: Lightbulb,
  "file-text": FileText,
  "book-open": BookOpen,
  "badge-check": BadgeCheck,
  "file-check": FileCheck,
  "list-checks": ListChecks,
  gauge: Gauge,
  maximize: Maximize2,
  thermometer: Thermometer,
  layers: Layers,
  activity: Activity,
  plug: PlugZap,
  repeat: Repeat,
};

export const PAGE_ICON_KEYS = Object.keys(PAGE_ICONS);

export function pageIcon(key: string): LucideIcon {
  return PAGE_ICONS[key] ?? Cpu;
}

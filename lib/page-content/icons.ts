import {
  Award,
  BatteryCharging,
  Blend,
  Building2,
  ClipboardList,
  Cpu,
  Factory,
  Globe,
  Handshake,
  Headset,
  Leaf,
  Lightbulb,
  Settings2,
  ShieldCheck,
  Sun,
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
};

export const PAGE_ICON_KEYS = Object.keys(PAGE_ICONS);

export function pageIcon(key: string): LucideIcon {
  return PAGE_ICONS[key] ?? Cpu;
}

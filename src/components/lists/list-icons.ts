import {
  Archive, Award, BadgeCheck, BarChart3, Bell, Bell as BellIcon,
  Bookmark, BookOpen, Briefcase, Building, Building2, Calendar,
  CircleCheck, ClipboardList, Clock, Contact, Crown, Database,
  DollarSign, Filter, Flag, Flame, Folder, Globe, GraduationCap,
  Handshake, Hash, Heart, Home, Inbox, Layers, Lightbulb, List,
  Mail, Map, MapPin, MessageCircle, Phone, Pin, Rocket, Search,
  Settings, Shield, Sparkles, Star, Tag, Target, TrendingUp,
  Trophy, UserCheck, UserPlus, Users, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ListIcon {
  name: string;
  icon: LucideIcon;
  label: string;
}

export const LIST_ICONS: ListIcon[] = [
  { name: "List", icon: List, label: "List" },
  { name: "Star", icon: Star, label: "Star" },
  { name: "Flame", icon: Flame, label: "Flame" },
  { name: "Target", icon: Target, label: "Target" },
  { name: "Rocket", icon: Rocket, label: "Rocket" },
  { name: "Zap", icon: Zap, label: "Zap" },
  { name: "Sparkles", icon: Sparkles, label: "Sparkles" },
  { name: "Trophy", icon: Trophy, label: "Trophy" },
  { name: "Award", icon: Award, label: "Award" },
  { name: "Crown", icon: Crown, label: "Crown" },
  { name: "Heart", icon: Heart, label: "Heart" },
  { name: "Bookmark", icon: Bookmark, label: "Bookmark" },
  { name: "Flag", icon: Flag, label: "Flag" },
  { name: "Pin", icon: Pin, label: "Pin" },
  { name: "Tag", icon: Tag, label: "Tag" },
  { name: "Hash", icon: Hash, label: "Hash" },
  { name: "Filter", icon: Filter, label: "Filter" },
  { name: "Users", icon: Users, label: "Users" },
  { name: "UserCheck", icon: UserCheck, label: "User Check" },
  { name: "UserPlus", icon: UserPlus, label: "User Plus" },
  { name: "Contact", icon: Contact, label: "Contact" },
  { name: "Handshake", icon: Handshake, label: "Handshake" },
  { name: "Phone", icon: Phone, label: "Phone" },
  { name: "Mail", icon: Mail, label: "Mail" },
  { name: "MessageCircle", icon: MessageCircle, label: "Message" },
  { name: "Inbox", icon: Inbox, label: "Inbox" },
  { name: "Bell", icon: Bell, label: "Bell" },
  { name: "Calendar", icon: Calendar, label: "Calendar" },
  { name: "Clock", icon: Clock, label: "Clock" },
  { name: "Briefcase", icon: Briefcase, label: "Briefcase" },
  { name: "Building", icon: Building, label: "Building" },
  { name: "Building2", icon: Building2, label: "Building 2" },
  { name: "Home", icon: Home, label: "Home" },
  { name: "Globe", icon: Globe, label: "Globe" },
  { name: "Map", icon: Map, label: "Map" },
  { name: "MapPin", icon: MapPin, label: "Map Pin" },
  { name: "TrendingUp", icon: TrendingUp, label: "Trending Up" },
  { name: "BarChart3", icon: BarChart3, label: "Bar Chart" },
  { name: "DollarSign", icon: DollarSign, label: "Dollar" },
  { name: "BadgeCheck", icon: BadgeCheck, label: "Badge Check" },
  { name: "CircleCheck", icon: CircleCheck, label: "Check" },
  { name: "Shield", icon: Shield, label: "Shield" },
  { name: "Lightbulb", icon: Lightbulb, label: "Lightbulb" },
  { name: "BookOpen", icon: BookOpen, label: "Book Open" },
  { name: "GraduationCap", icon: GraduationCap, label: "Graduation" },
  { name: "ClipboardList", icon: ClipboardList, label: "Clipboard" },
  { name: "Folder", icon: Folder, label: "Folder" },
  { name: "Archive", icon: Archive, label: "Archive" },
  { name: "Database", icon: Database, label: "Database" },
  { name: "Layers", icon: Layers, label: "Layers" },
  { name: "Search", icon: Search, label: "Search" },
  { name: "Settings", icon: Settings, label: "Settings" },
];

export const DEFAULT_ICON = "List";

export const DEFAULT_COLOR = "#6366f1";

export const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#10b981", "#06b6d4", "#3b82f6", "#64748b",
];

export function getListIconComponent(name?: string): LucideIcon {
  return LIST_ICONS.find((i) => i.name === name)?.icon ?? List;
}

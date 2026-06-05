import { MessageCircle, Globe } from "lucide-react";
import type { Channel } from "@/types/communications";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

type ChannelConfig = {
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
};

const CONFIG: Record<Channel, ChannelConfig> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle, bg: "bg-[#25D366]/10", text: "text-[#128C3E]" },
  instagram: { label: "Instagram", icon: InstagramIcon, bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-600" },
  facebook: { label: "Facebook", icon: FacebookIcon, bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600" },
  web: { label: "Web Query", icon: Globe, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400" },
};

const OVERLAY_BG: Record<Channel, string> = {
  whatsapp: "bg-[#25D366]",
  instagram: "bg-gradient-to-br from-pink-500 to-purple-600",
  facebook: "bg-[#1877F2]",
  web: "bg-slate-500",
};

export function ChannelBadge({
  channel,
  compact,
  avatarOverlay,
}: {
  channel: Channel;
  compact?: boolean;
  avatarOverlay?: boolean;
}) {
  const { label, icon: Icon, bg, text } = CONFIG[channel];

  if (avatarOverlay) {
    return (
      <span
        className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full grid place-items-center ring-2 ring-background ${OVERLAY_BG[channel]}`}
      >
        <Icon className="size-2.5 text-white" />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${bg} ${text}`}>
      <Icon className="size-3 shrink-0" />
      {!compact && label}
    </span>
  );
}

export function channelColor(channel: Channel) {
  return CONFIG[channel].text;
}

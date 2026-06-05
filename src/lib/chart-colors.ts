const PROPER_NAMES: Record<string, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  google: "Google",
  meta: "Meta",
  website: "Website",
  referral: "Referral",
};

/** Format a raw source name for display: walk_in → Walk In, whatsapp → WhatsApp */
export function formatSourceName(name: string): string {
  if (!name) return name;
  const key = name.toLowerCase().replace(/[\s_-]/g, "");
  if (PROPER_NAMES[key]) return PROPER_NAMES[key];
  return name
    .replace(/[_-]/g, " ")
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function cv(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function getChartColors() {
  // Categorical palette — reordered for best visual contrast
  const palette = [
    cv("--chart-8"),  // deep indigo
    cv("--chart-7"),  // blue
    cv("--chart-9"),  // purple
    cv("--chart-2"),  // teal
    cv("--chart-5"),  // amber
    cv("--chart-1"),  // orange
    cv("--chart-6"),  // sky
    cv("--chart-10"), // pink
  ];

  // Stage colors follow a cold → warm → outcome temperature scale
  // gray (inactive) → sky → blue → indigo → amber → green (win) / red (loss)
  const stageMap: Record<string, string> = {
    new:       cv("--chart-13"), // gray        – not yet engaged
    qualified: cv("--chart-6"),  // sky         – first positive signal
    assigned:  cv("--chart-7"),  // blue        – in motion
    contacted: cv("--chart-8"),  // deep indigo – real engagement
    nurturing: cv("--chart-5"),  // amber       – warming up
    converted: cv("--chart-2"),  // teal        – positive outcome (matches Enrolled)
    lost:      cv("--chart-12"), // red         – negative outcome
  };

  return {
    /** 8-color categorical palette from CSS theme vars */
    palette,

    /** Resolve a stage name to its semantic color, falling back to palette by index */
    stageColor: (name: string, fallbackIndex = 0): string =>
      stageMap[name.toLowerCase()] ?? palette[fallbackIndex % palette.length],

    /** Pipeline series — leads → apps → submitted → enrolled */
    pipeline: {
      leadsCreated:       cv("--chart-8"),
      applicationsStarted: cv("--chart-9"),
      submitted:          cv("--chart-6"),
      enrolled:           cv("--chart-11"),
    },

    /** Application funnel stages */
    appStage: {
      applicationsCreated: cv("--chart-8"),
      submitted:           cv("--chart-9"),
      verified:            cv("--chart-6"),
      approved:            cv("--chart-2"),
      offerReleased:       cv("--chart-5"),
      feePaid:             cv("--chart-1"),
      enrolled:            cv("--chart-11"),
    } as Record<string, string>,

    /** Shared recharts Tooltip props */
    tt: {
      contentStyle: {
        borderRadius: 8,
        border: "none",
        boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
        fontSize: 12,
        padding: "8px 12px",
      },
      labelStyle:  { color: "#111827", fontWeight: 600 as const, marginBottom: 4 },
      itemStyle:   { color: "#374151", padding: "1px 0" },
    },
  };
}

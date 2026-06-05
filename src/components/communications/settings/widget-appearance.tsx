import { useChatStore } from "@/store/chat-store";
import { MessageCircle, Bot, Send } from "lucide-react";

const PRESET_COLORS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Blue", value: "#2563eb" },
  { label: "Emerald", value: "#059669" },
  { label: "Rose", value: "#e11d48" },
  { label: "Amber", value: "#d97706" },
];

export function WidgetAppearance() {
  const { widgetConfig, updateWidgetConfig } = useChatStore();

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Config form */}
      <div className="space-y-5">
        <div>
          <label className="block text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Chat Window Title
          </label>
          <input
            value={widgetConfig.chatName}
            onChange={(e) => updateWidgetConfig({ chatName: e.target.value })}
            className="w-full h-10 rounded-lg bg-muted px-3 text-[13px] outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. Acharya Admissions Support"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Greeting Message
          </label>
          <textarea
            rows={3}
            value={widgetConfig.greeting}
            onChange={(e) => updateWidgetConfig({ greeting: e.target.value })}
            className="w-full rounded-lg bg-muted px-3 py-2 text-[13px] outline-none resize-none focus:ring-2 focus:ring-primary/30"
            placeholder="Hi there! 👋 How can we help you today?"
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Brand Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                title={c.label}
                onClick={() => updateWidgetConfig({ primaryColor: c.value })}
                style={{ backgroundColor: c.value }}
                className={`size-8 rounded-full transition-transform ${widgetConfig.primaryColor === c.value ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-105"}`}
              />
            ))}
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={widgetConfig.primaryColor}
                onChange={(e) => updateWidgetConfig({ primaryColor: e.target.value })}
                className="size-8 rounded-full cursor-pointer border-0 bg-transparent p-0"
                title="Custom color"
              />
              <span className="text-[11px] text-muted-foreground">{widgetConfig.primaryColor}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Logo / Avatar
          </label>
          <div className="flex items-center gap-3">
            <div
              className="size-12 rounded-full grid place-items-center text-white text-lg font-bold"
              style={{ backgroundColor: widgetConfig.primaryColor }}
            >
              <Bot className="size-6" />
            </div>
            <label className="cursor-pointer px-3 h-9 rounded-lg bg-muted text-[13px] font-medium flex items-center hover:bg-muted/80 transition-colors">
              Upload Logo
              <input type="file" accept="image/*" className="hidden" />
            </label>
            <span className="text-[11px] text-muted-foreground">PNG, JPG up to 2MB</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/60">
          <div>
            <div className="text-[13px] font-semibold">Widget Status</div>
            <div className="text-[11px] text-muted-foreground">Enable or pause the live chat widget</div>
          </div>
          <button
            onClick={() => updateWidgetConfig({ isLive: !widgetConfig.isLive })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${widgetConfig.isLive ? "bg-success" : "bg-muted-foreground/30"}`}
          >
            <span
              className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${widgetConfig.isLive ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div>
        <div className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preview</div>
        <div className="relative h-[420px] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl overflow-hidden border border-border flex flex-col">
          {/* Mock website bg */}
          <div className="flex-1 p-4 space-y-2 opacity-30">
            {[120, 80, 100, 60].map((w, i) => (
              <div key={i} className="h-2 bg-slate-400 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>

          {/* Chat widget */}
          <div className="absolute bottom-4 right-4 w-64">
            <div className="rounded-xl shadow-xl overflow-hidden border border-border/30">
              {/* Header */}
              <div
                className="px-3 py-2.5 flex items-center gap-2"
                style={{ backgroundColor: widgetConfig.primaryColor }}
              >
                <div className="size-7 rounded-full bg-white/20 grid place-items-center">
                  <Bot className="size-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-[12px] font-semibold truncate">{widgetConfig.chatName || "Support"}</div>
                  <div className="text-white/70 text-[10px] flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-300 inline-block" /> Online
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white dark:bg-slate-900 p-3 space-y-2">
                <div className="flex gap-2 items-start">
                  <div
                    className="size-6 rounded-full shrink-0 grid place-items-center"
                    style={{ backgroundColor: widgetConfig.primaryColor }}
                  >
                    <Bot className="size-3.5 text-white" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-xl rounded-tl-sm px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-slate-200 flex-1">
                    {widgetConfig.greeting || "Hi there! How can I help?"}
                  </div>
                </div>
                <div className="flex justify-end">
                  <div
                    className="rounded-xl rounded-tr-sm px-2.5 py-1.5 text-[11px] text-white"
                    style={{ backgroundColor: widgetConfig.primaryColor }}
                  >
                    Tell me about MBA fees
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-2 py-1.5 flex items-center gap-1.5">
                <input className="flex-1 text-[11px] text-slate-400 bg-transparent outline-none" placeholder="Type a message..." readOnly />
                <button
                  className="size-6 rounded-full grid place-items-center"
                  style={{ backgroundColor: widgetConfig.primaryColor }}
                >
                  <Send className="size-3 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Bubble */}
          <div className="absolute bottom-4 right-4 translate-y-[-312px]" style={{ display: "none" }}>
            <button
              className="size-12 rounded-full shadow-lg grid place-items-center"
              style={{ backgroundColor: widgetConfig.primaryColor }}
            >
              <MessageCircle className="size-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

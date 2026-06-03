import { Sparkles } from "lucide-react";

export const LoginHero = () => {
  return (
    <div className="hidden lg:flex relative overflow-hidden bg-slate-950 text-white p-12 flex-col justify-between">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[80px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
           <img
            src="/brand/logo.png"
            alt=""
            className="size-10 shrink-0 rounded-sm object-contain"
          />
          <div>
            <div className="font-display font-bold text-xl tracking-tight">
              ACHARYA <span className="text-indigo-400">ONE</span>
            </div>
            <div className="text-[10px] tracking-[0.2em] text-white/50 font-medium uppercase mt-0.5">
              Admissions CRM
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 my-auto py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
          <span className="size-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest text-indigo-200 font-semibold">
            Higher Education Intelligence
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
          The operating system for <br className="hidden xl:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300">
            modern admissions.
          </span>
        </h1>
        <p className="text-white/60 mt-6 max-w-md text-base leading-relaxed">
          From first inquiry to enrolled student — unify counselling, applications, scholarships,
          finance, and AI insights in one powerful workspace.
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between text-[12px] text-white/40 border-t border-white/10 pt-6">
        <div>© 2025 Acharya Group of Institutions</div>
       
      </div>
    </div>
  );
};

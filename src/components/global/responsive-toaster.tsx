"use client";

import { Toaster } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const ResponsiveToaster = () => {
  const isMobile = useIsMobile();

  return (
    <Toaster
      position={isMobile ? "top-right" : "bottom-right"}
      toastOptions={{ className: "w-full", duration: 2500 }}
    />
  );
};

export default ResponsiveToaster;

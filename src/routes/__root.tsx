import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  ErrorComponent,
} from "@tanstack/react-router";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import "../styles.css";
import { NotFoundComponent } from "@/components/global/not-found";
import ResponsiveToaster from "@/components/global/responsive-toaster";

import { useUserStore } from "@/store/use-user-store";
import { getAuthData } from "@/lib/auth-utils";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useAuthGuard({ isProtectedRoute: true });

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <ResponsiveToaster />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}

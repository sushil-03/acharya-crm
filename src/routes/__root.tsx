import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  ErrorComponent,
  redirect,
} from "@tanstack/react-router";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import appCss from "../styles.css?url";
import { NotFoundComponent } from "@/components/global/not-found";
import ResponsiveToaster from "@/components/global/responsive-toaster";

import { useUserStore } from "@/store/use-user-store";
import { getAuthData } from "@/lib/auth-utils";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Acharya One CRM — Admissions Intelligence OS" },
      {
        name: "description",
        content:
          "Enterprise admissions, counselling, enrollment & marketing operating system for higher education.",
      },
      { name: "author", content: "Acharya" },
      { property: "og:title", content: "Acharya One CRM — Admissions Intelligence OS" },
      {
        property: "og:description",
        content:
          "Enterprise admissions, counselling, enrollment & marketing operating system for higher education.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@AcharyaCRM" },
      { name: "twitter:title", content: "Acharya One CRM — Admissions Intelligence OS" },
      {
        name: "twitter:description",
        content:
          "Enterprise admissions, counselling, enrollment & marketing operating system for higher education.",
      },
      {
        property: "og:image",
        content:
          "https://acharyacrm.dev/og-image.png",
      },
      {
        name: "twitter:image",
        content:
          "https://acharyacrm.dev/og-image.png",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

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

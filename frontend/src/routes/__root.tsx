import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Footer } from "@/components/layout/Footer";
import { FloatingCartBar } from "@/components/layout/FloatingCartBar";
import { Toaster } from "@/components/ui/sonner";
import {
  APP_ID,
  APP_DESCRIPTION,
  APP_FAVICON,
  APP_OG_DESCRIPTION,
  APP_OG_TITLE,
  APP_THEME,
  APP_TWITTER_DESCRIPTION,
  APP_TWITTER_TITLE,
  FEATURES,
} from "@/lib/brand";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_OG_TITLE },
      {
        name: "description",
        content: APP_DESCRIPTION,
      },
      { property: "og:title", content: APP_OG_TITLE },
      {
        property: "og:description",
        content: APP_OG_DESCRIPTION,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

      { name: "twitter:title", content: APP_TWITTER_TITLE },
      {
        name: "twitter:description",
        content: APP_TWITTER_DESCRIPTION,
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0c937cbd-ffb3-4abb-9264-1478895ea69a/id-preview-4762765f--24e9391b-8184-4568-9d2f-9b9a1b7e3130.lovable.app-1782843042235.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0c937cbd-ffb3-4abb-9264-1478895ea69a/id-preview-4762765f--24e9391b-8184-4568-9d2f-9b9a1b7e3130.lovable.app-1782843042235.png",
      },
    ],
    links: [
      { rel: "icon", href: `/${APP_FAVICON}` },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  if (import.meta.env.SPA_BUILD) {
    return <>{children}</>;
  }
  return (
    <html lang="en" data-theme={APP_THEME}>
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
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isAdmin = pathname.startsWith("/admin");
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background">
        {!isAdmin && <Header />}
        <div className="flex flex-1">
          {!isAdmin && <AppSidebar />}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
        {!isAdmin && <Footer />}
        {!isAdmin && FEATURES.floatingCartBar && <FloatingCartBar />}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

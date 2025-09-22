import type { Metadata } from "next";
// Removed Google Fonts for better performance - using system fonts
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider, ThemeScript } from "@/components/theme/theme-provider";
import {
  LoadingProvider as SimpleLoadingProvider,
} from "@/components/providers/simple-loading-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { Toaster } from "sonner";

// Use system fonts as fallback for better performance
const geistSans = {
  variable: "--font-geist-sans",
  className: "font-sans",
};

const geistMono = {
  variable: "--font-geist-mono", 
  className: "font-mono",
};

export const metadata: Metadata = {
  title: {
    default: "Polling App",
    template: "%s | Polling App",
  },
  description: "Create polls, gather opinions, and make data-driven decisions",
  keywords: ["polls", "voting", "surveys", "data collection", "opinions"],
  authors: [{ name: "Polling App Team" }],
  creator: "Polling App",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    title: "Polling App",
    description:
      "Create polls, gather opinions, and make data-driven decisions",
    siteName: "Polling App",
  },
  twitter: {
    card: "summary_large_image",
    title: "Polling App",
    description:
      "Create polls, gather opinions, and make data-driven decisions",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="theme"
          themes={["light", "dark", "system"]}
        >
          <SimpleLoadingProvider
            defaultMessage="Loading your app..."
            enableRouteLoading={true}
          >
            <LoadingProvider>
              <AuthProvider>
                <div
                  vaul-drawer-wrapper=""
                  className="min-h-screen bg-background"
                >
                  {children}
                </div>
                <Toaster
                  position="bottom-right"
                  expand={true}
                  richColors
                  closeButton
                  toastOptions={{
                    style: {
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    },
                  }}
                />
              </AuthProvider>
            </LoadingProvider>
          </SimpleLoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

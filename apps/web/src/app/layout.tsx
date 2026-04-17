import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/auth-provider";
import I18nProvider from "../lib/i18n";
import ThemeProvider from "../components/theme/ThemeProvider";

const inter = Inter({ subsets: ["latin"], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: "JanSetu | Smart Resource Allocation",
  description: "AI-powered community resource allocation and volunteer matching platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JanSetu",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4A62D8" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        {/* Inline theme bootstrap — prevents flash of wrong theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('jansetu-theme');
                  var themeId = stored ? JSON.parse(stored).state?.themeId : 'forest';
                  var isDarkTheme = { forest: true, midnight: true, aurora: false, sunrise: false };
                  var THEMES = {
                    forest: {
                      '--background':'oklch(0.09 0.005 150)','--foreground':'oklch(0.97 0.005 150)',
                      '--card':'oklch(0.13 0.008 150)','--primary':'oklch(0.62 0.20 152)',
                      '--primary-foreground':'oklch(0.05 0 0)','--muted':'oklch(0.18 0.008 150)',
                      '--muted-foreground':'oklch(0.60 0.01 150)','--border':'oklch(0.22 0.015 150)',
                      '--input':'oklch(0.16 0.010 150)','--ring':'oklch(0.62 0.20 152)',
                      '--sidebar':'oklch(0.07 0.006 150)','--sidebar-border':'oklch(0.18 0.012 150)',
                      '--popover':'oklch(0.11 0.008 150)','--popover-foreground':'oklch(0.97 0.005 150)',
                    },
                    midnight: {
                      '--background':'oklch(0.10 0.025 260)','--foreground':'oklch(0.95 0.01 260)',
                      '--card':'oklch(0.14 0.025 260)','--primary':'oklch(0.62 0.22 264)',
                      '--primary-foreground':'oklch(0.985 0 0)','--muted':'oklch(0.20 0.025 260)',
                      '--muted-foreground':'oklch(0.62 0.02 260)','--border':'oklch(0.22 0.025 260)',
                      '--input':'oklch(0.18 0.020 260)','--ring':'oklch(0.62 0.22 264)',
                      '--sidebar':'oklch(0.08 0.028 262)','--sidebar-border':'oklch(0.20 0.025 260)',
                      '--popover':'oklch(0.12 0.025 260)','--popover-foreground':'oklch(0.95 0.01 260)',
                    },
                    aurora: {
                      '--background':'oklch(0.97 0.008 200)','--foreground':'oklch(0.14 0.020 215)',
                      '--card':'oklch(1.00 0.000 0)','--primary':'oklch(0.50 0.18 195)',
                      '--primary-foreground':'oklch(0.99 0 0)','--muted':'oklch(0.93 0.010 200)',
                      '--muted-foreground':'oklch(0.45 0.012 210)','--border':'oklch(0.84 0.015 200)',
                      '--input':'oklch(0.92 0.010 200)','--ring':'oklch(0.50 0.18 195)',
                      '--sidebar':'oklch(0.93 0.018 200)','--sidebar-border':'oklch(0.82 0.015 200)',
                      '--popover':'oklch(0.99 0.005 200)','--popover-foreground':'oklch(0.14 0.020 215)',
                    },
                    sunrise: {
                      '--background':'oklch(0.98 0.010 55)','--foreground':'oklch(0.14 0.015 45)',
                      '--card':'oklch(1.00 0.000 0)','--primary':'oklch(0.58 0.22 40)',
                      '--primary-foreground':'oklch(0.99 0 0)','--muted':'oklch(0.93 0.012 55)',
                      '--muted-foreground':'oklch(0.46 0.010 50)','--border':'oklch(0.85 0.018 55)',
                      '--input':'oklch(0.92 0.012 55)','--ring':'oklch(0.58 0.22 40)',
                      '--sidebar':'oklch(0.94 0.018 50)','--sidebar-border':'oklch(0.83 0.018 50)',
                      '--popover':'oklch(0.99 0.006 55)','--popover-foreground':'oklch(0.14 0.015 45)',
                    },
                  };
                  var vars = THEMES[themeId] || THEMES.forest;
                  var html = document.documentElement;
                  var dark = isDarkTheme[themeId] !== false;
                  if (dark) { html.classList.add('dark'); } else { html.classList.remove('dark'); }
                  html.setAttribute('data-theme', themeId || 'forest');
                  Object.keys(vars).forEach(function(k) { html.style.setProperty(k, vars[k]); });
                } catch(e) {}
              })();
            `,
          }}
        />
        <AuthProvider>
          <ThemeProvider>
            <I18nProvider>
              <div className="min-h-screen flex flex-col">
                {children}
              </div>
            </I18nProvider>
          </ThemeProvider>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('✅ SW registered:', reg.scope); })
                    .catch(function(err) { console.log('SW registration failed:', err); });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

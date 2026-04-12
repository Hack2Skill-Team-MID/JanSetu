import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/auth-provider";

const inter = Inter({ subsets: ["latin"], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: "JanSetu | Smart Resource Allocation",
  description: "AI-powered community resource allocation and volunteer matching platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

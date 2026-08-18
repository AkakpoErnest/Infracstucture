import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { LanguageProvider } from "@/components/providers/language-provider";

export const metadata: Metadata = {
  title: "Interior AI",
  description: "AI-powered interior design & shopping platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

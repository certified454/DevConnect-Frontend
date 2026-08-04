import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

export const metadata: Metadata = {
  title: "DevConnect",
  description: "A platform for developers to connect, share knowledge, and collaborate on projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GluestackUIProvider >
          {children}
        </GluestackUIProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BingeLoop",
  description: "Learn languages from TV and anime with smart episode lessons.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { EmbedResizeBridge } from "@/components/EmbedResizeBridge";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Planner for Lift Brandworks",
  description: "A responsive project planning widget for website service enquiries."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <EmbedResizeBridge />
        {children}
      </body>
    </html>
  );
}

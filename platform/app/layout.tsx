import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DARKTEC Network",
  description: "The collaboration network for artists, organizers, crew and live entertainment professionals."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
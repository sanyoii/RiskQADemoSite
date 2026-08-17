import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host === "localhost" ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "QA Decision Desk — Risk-Based QA Evidence",
    description: "以人類可讀的方式呈現發布判斷、測試證據與風險狀態的 QA 作品集示範。",
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
    openGraph: {
      title: "QA Decision Desk",
      description: "Risk-Based QA Evidence Pack 與 Low-Tech Testing Dashboard 作品集示範。",
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "QA Decision Desk portfolio demo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "QA Decision Desk",
      description: "人類可讀的 QA 發布判斷與測試證據展示。",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}

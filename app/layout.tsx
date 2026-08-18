import type { Metadata } from "next";
import "./globals.css";

const deploymentOrigin = "https://sanyoii.github.io/test-status";

export const dynamic = "force-static";

export const metadata: Metadata = {
    metadataBase: new URL(`${deploymentOrigin}/`),
    title: "QA Decision Desk — Risk-Based QA Records",
    description: "以人類可讀的方式呈現發布判斷、測試記錄與風險狀態的 QA 作品集示範。",
    icons: {
      icon: `${deploymentOrigin}/favicon.png`,
      shortcut: `${deploymentOrigin}/favicon.png`,
    },
    openGraph: {
      title: "QA Decision Desk",
      description: "Risk-Based QA Records 與 Low-Tech Testing Dashboard 作品集示範。",
      images: [{ url: `${deploymentOrigin}/og.png`, width: 1200, height: 630, alt: "QA Decision Desk portfolio demo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "QA Decision Desk",
      description: "人類可讀的 QA 發布判斷與測試記錄展示。",
      images: [`${deploymentOrigin}/og.png`],
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}

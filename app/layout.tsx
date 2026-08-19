import type { Metadata } from "next";
import "./globals.css";
import { LanguageToggle } from "./_language-toggle";

const deploymentOrigin = "https://sanyoii.github.io/test-status";

export const dynamic = "force-static";

export const metadata: Metadata = {
    metadataBase: new URL(`${deploymentOrigin}/`),
    title: "QA Decision Desk — Risk-Based QA Records",
    description: "A human-readable QA portfolio showing release decisions, test records, and risk status.",
    icons: {
      icon: `${deploymentOrigin}/favicon.png`,
      shortcut: `${deploymentOrigin}/favicon.png`,
    },
    openGraph: {
      title: "QA Decision Desk",
      description: "A portfolio demo of Risk-Based QA Records and a Low-Tech Testing Dashboard.",
      images: [{ url: `${deploymentOrigin}/og.png`, width: 1200, height: 630, alt: "QA Decision Desk portfolio demo" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "QA Decision Desk",
      description: "Human-readable QA release decisions and test records.",
      images: [`${deploymentOrigin}/og.png`],
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageToggle />
        {children}
      </body>
    </html>
  );
}

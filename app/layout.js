import { Orbitron, JetBrains_Mono } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-orbitron" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-jetbrains" });

export const metadata = {
  title: "Concrete Builder Suite | Protocol Tools",
  description:
    "Ecosystem tools built for Concrete Protocol — DeFi tooling, interactive onboarding, and arcade-style education.",
  openGraph: {
    title: "Concrete Builder Suite",
    description: "DeFi tools, live vault data & onboarding for Concrete Protocol 🗿",
    url: "https://concrete-builder.vercel.app",
    siteName: "Concrete Builder Suite",
  },
  twitter: {
    card: "summary_large_image",
    title: "Concrete Builder Suite",
    description: "Live vaults, AI tools & more for Concrete Protocol 🗿",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${jetbrains.variable}`}>
      <body style={{ margin: 0, padding: 0, background: "#030303" }}>{children}</body>
    </html>
  );
}

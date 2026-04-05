// app/layout.js
import "./globals.css";
import Navbar from "../components/Navbar";
import { Poppins } from "next/font/google";
import AxolotlBuddy from "@/components/BlobFeature";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Nuruddin - Next.js Developer",
  description:
    "Nuruddin is a full-stack web developer based in Chattogram, Bangladesh. Specializing in Next.js, React, Node.js, and MongoDB — building fast, polished web products for startups and businesses worldwide.",
  keywords: [
    "freelance Next.js developer Bangladesh",
    "freelance web developer Chattogram",
    "React developer Bangladesh",
    "full-stack developer freelance",
    "hire web developer Bangladesh",
    "Next.js freelancer",
    "Node.js developer",
    "web developer portfolio",
  ],
  authors: [{ name: "Nuruddin", url: "https://nuruddin.dev" }],
  creator: "Nuruddin",
  openGraph: {
    title: "Nuruddin — Next.js & React Developer",
    description:
      "I turn ideas into fast, polished web products — on time. Based in Bangladesh, available worldwide.",
    url: "https://nuruddin.dev",
    siteName: "Nuruddin — The Webician",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nuruddin — Freelance Next.js Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nuruddin — Freelance Next.js Developer",
    description: "I turn ideas into fast, polished web products — on time.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/avatar2.png",
    shortcut: "/avatar2.png",
    apple: "/avatar2.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://nuruddin.dev" />
      </head>
      <body
        className={`${poppins.variable} min-h-screen`}
        style={{ color: "var(--text)" }}
      >
        <div className="global-bg">
          <div className="bg-base" />
          <div className="bg-bloom" />
          <div className="bg-bloom-cool" />
          <div className="bg-noise" />
        </div>
        <div className="p-3 sm:p-6 md:p-10 relative z-10">
          <div
            className="rounded-2xl overflow-visible p-4 sm:p-6 md:p-8 bg-transparent"
            style={{ border: "1px solid var(--glass-border)" }}
          >
            <Navbar />
            {/*
              No wrapper div hiding axolotl on mobile.
              BlobFeature itself decides display scale based on screen width.
              pointerEvents: none means it never blocks touch scrolling.
            */}
            <AxolotlBuddy />
            <main className="app-frame">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}

import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Homy — Your home, finally organized.",
  description:
    "Homy is the household operating system for shared homes. Manage rent, bills, tasks, groceries, and more.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" }, // primary favicon (transparent / compact)
    ],
    shortcut: "/favicon.png", // legacy shortcut icon
    apple: "/pageIcon.png", // apple-touch-icon (uses the branding name)
  },
  openGraph: {
    images: ["/pageIcon.png"],
  },
  twitter: {
    images: ["/pageIcon.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* ensure runtime link tags for browsers that rely on them */}
        <head>
          <link rel="icon" href="/favicon.png" />
          <link rel="shortcut icon" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/pageIcon.png" />
          <meta name="theme-color" content="#0b1220" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

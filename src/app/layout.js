import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: "/pageIcon.png",
  },
  openGraph: {
    title: "Homy — Your home, finally organized.",
    description: "Manage rent, bills, tasks, groceries, and more.",
    images: ["/pageIcon.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/pageIcon.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.png" type="image/png" />
          <link rel="shortcut icon" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/pageIcon.png" />
          <meta name="theme-color" content="#0b1220" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0e1520",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#f0ede8",
                fontSize: "0.875rem",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}

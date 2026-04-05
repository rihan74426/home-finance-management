import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

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
        {children}
      </body>
    </html>
  );
}

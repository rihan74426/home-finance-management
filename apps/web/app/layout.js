import '../styles/globals.css'

export const metadata = {
  title: 'Homy — Web (App Router)',
  description: 'Homy — household operating system (App Router)'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

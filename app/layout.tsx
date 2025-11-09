import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Forex Trading Bot',
  description: 'Automated Forex Trading with Gemini AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

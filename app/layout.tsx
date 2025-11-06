import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Money Manager',
  description: 'Track your income, expenses, and transfers',
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

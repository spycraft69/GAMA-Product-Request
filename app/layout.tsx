import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/layouts/Navbar'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GAMA Free Product Requests',
  description: 'Connect non-profits and educational institutions with tabletop game publishers for free product demos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}


import './globals.css'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layouts/Navbar'
import { AuthProvider } from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'GAMA Sample Product Requests',
  description: 'Connect non-profits and educational institutions with tabletop game publishers for sample products',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
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


'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const userLabel = session?.user?.name || session?.user?.email || 'Account'
  const isPublisher = session?.user?.role === 'MANUFACTURER'

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center px-2 py-2 text-xl font-bold text-primary-600">
              GAMA Free Product Requests
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/products"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                Browse Products
              </Link>
              <Link
                href="/publishers"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                Browse Publishers
              </Link>
              <Link
                href="/conventions"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                Convention Schedule
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {status === 'loading' ? (
              <div className="text-gray-500">Loading...</div>
            ) : session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                  className="flex items-center space-x-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <span>{userLabel}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.086l3.71-3.854a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-md border border-gray-100 bg-white py-2 shadow-lg">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      Dashboard
                    </Link>
                    {isPublisher && (
                      <Link
                        href="/dashboard/products/new"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        Add Product
                      </Link>
                    )}
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleSignOut}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col items-end border border-primary-600/60 bg-white/80 px-3 py-2 rounded-lg text-right">
                  <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">For publishers only</span>
                  <span className="text-[11px] text-slate-500">Sign in to manage product requests</span>
                </div>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Sign In
                </Link>
                <Link
                  href="/register?role=manufacturer"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}


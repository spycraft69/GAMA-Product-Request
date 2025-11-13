'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Manufacturer {
  id: string
  companyName: string
  description: string | null
  website: string | null
  logoUrl: string | null
  user: {
    name: string
    email: string
  }
}

export default function ManufacturerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/manufacturers/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setManufacturer(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Error fetching manufacturer:', err)
          setLoading(false)
        })
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!manufacturer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Publisher not found.</p>
          <Link href="/manufacturers" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Back to Publishers
          </Link>
        </div>
      </div>
    )
  }

  const canRequestSampleProduct = session && 
    (session.user?.role === 'NONPROFIT' || session.user?.role === 'EDUCATIONAL')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/manufacturers"
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
      >
        ← Back to Publishers
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {manufacturer.logoUrl && (
          <div className="mb-6 text-center">
            <img
              src={manufacturer.logoUrl}
              alt={manufacturer.companyName}
              className="h-32 w-32 object-contain mx-auto"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {manufacturer.companyName}
        </h1>

        {manufacturer.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-gray-600 whitespace-pre-line">{manufacturer.description}</p>
          </div>
        )}

        <div className="mb-6 space-y-2">
          <p className="text-gray-600">
            <span className="font-semibold">Contact:</span> {manufacturer.user.name}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Email:</span> {manufacturer.user.email}
          </p>
          {manufacturer.website && (
            <p className="text-gray-600">
              <span className="font-semibold">Website:</span>{' '}
              <a
                href={manufacturer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                {manufacturer.website}
              </a>
            </p>
          )}
        </div>

        {canRequestSampleProduct ? (
          <Link
            href={`/requests/new?manufacturerId=${manufacturer.id}`}
            className="inline-block w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition text-center font-semibold"
          >
            Request a Sample Product
          </Link>
        ) : !session ? (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-800">
              Please{' '}
              <Link href="/login" className="font-semibold underline">
                sign in
              </Link>{' '}
              or{' '}
              <Link href="/register" className="font-semibold underline">
                register
              </Link>{' '}
              as a non-profit or educational institution to request a sample product.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}


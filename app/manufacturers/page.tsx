'use client'

import { useEffect, useState } from 'react'
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

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/manufacturers')
      .then(res => res.json())
      .then(data => {
        setManufacturers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching manufacturers:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Loading publishers...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tabletop Game Publishers</h1>
        <p className="mt-2 text-gray-600">
          Browse publishers offering sample products for non-profits and educational institutions
        </p>
      </div>

      {manufacturers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No publishers available at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manufacturers.map((manufacturer) => (
            <div
              key={manufacturer.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              {manufacturer.logoUrl && (
                <div className="mb-4">
                  <img
                    src={manufacturer.logoUrl}
                    alt={manufacturer.companyName}
                    className="h-24 w-24 object-contain mx-auto"
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {manufacturer.companyName}
              </h2>
              {manufacturer.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {manufacturer.description}
                </p>
              )}
              {manufacturer.website && (
                <a
                  href={manufacturer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm mb-4 block"
                >
                  Visit Website →
                </a>
              )}
              <Link
                href={`/manufacturers/${manufacturer.id}`}
                className="inline-block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


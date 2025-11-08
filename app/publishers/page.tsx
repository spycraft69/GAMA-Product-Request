'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

interface PublisherProduct {
  id: string
  name: string
  imageUrl: string | null
  infoUrl: string | null
  genres: string[]
}

interface Publisher {
  id: string
  companyName: string
  description: string | null
  website: string | null
  logoUrl: string | null
  contactName: string | null
  contactEmail: string | null
  products: PublisherProduct[]
}

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch('/api/publishers')
      .then((res) => res.json())
      .then((data) => {
        const publishersData = Array.isArray(data) ? data : []
        setPublishers(publishersData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching publishers:', err)
        setPublishers([])
        setLoading(false)
      })
  }, [])

  const filteredPublishers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) {
      return publishers
    }

    return publishers.filter((publisher) => {
      const matchesPublisher =
        publisher.companyName.toLowerCase().includes(term) ||
        (publisher.description?.toLowerCase() ?? '').includes(term) ||
        (publisher.website?.toLowerCase() ?? '').includes(term)

      const matchesProduct = publisher.products.some((product) =>
        product.name.toLowerCase().includes(term)
      )

      return matchesPublisher || matchesProduct
    })
  }, [publishers, searchTerm])

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Publishers</h1>
        <p className="text-gray-600 mb-6">
          Browse publishers offering free tabletop game demos. Click any product below to request a copy.
        </p>
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search publishers or products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {filteredPublishers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'No publishers found matching your search.' : 'No publishers available at this time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredPublishers.map((publisher) => (
            <div key={publisher.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                    {publisher.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={publisher.logoUrl}
                        alt={publisher.companyName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs text-center px-2">No logo</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{publisher.companyName}</h2>
                    {publisher.website && (
                      <a
                        href={publisher.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        {publisher.website}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">About</h3>
                {publisher.description ? (
                  <p className="text-gray-600">{publisher.description}</p>
                ) : (
                  <p className="text-sm text-gray-400">This publisher hasn’t added a description yet.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Products</h3>
                {publisher.products.length === 0 ? (
                  <p className="text-gray-500 text-sm">No public products yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {publisher.products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}/request`}
                        className="group flex h-full flex-col overflow-hidden rounded-lg border bg-gray-50 hover:shadow-md transition"
                      >
                        <div className="h-40 bg-gray-200 overflow-hidden">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-3">
                          <p className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</p>
                          {product.genres && product.genres.length > 0 && (
                            <p className="text-xs text-blue-700 mt-2">
                              Genres: {product.genres.join(', ')}
                            </p>
                          )}
                          <div className="mt-auto">
                            <p className="text-xs text-primary-600 mt-3">Request Product →</p>
                            {product.infoUrl && (
                              <a
                                href={product.infoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block text-xs text-primary-600 hover:text-primary-700"
                              >
                                Learn More →
                              </a>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

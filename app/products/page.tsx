'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  infoUrl: string | null
  genres: string[]
  minPlayers: number | null
  maxPlayers: number | null
  playTime: string | null
  ageRange: string | null
  manufacturer: {
    id: string
    companyName: string
    logoUrl: string | null
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching products:', err)
        setLoading(false)
      })
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.manufacturer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Loading products...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Available Products</h1>
        <p className="text-gray-600 mb-6">
          Browse available tabletop games and request free demo copies for your organization
        </p>
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search products or publishers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'No products found matching your search.' : 'No products available at this time.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex h-full flex-col rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              {product.imageUrl && (
                <div className="mb-4 h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="px-4 pb-4 flex flex-1 flex-col">
                <div className="mb-2 flex items-center gap-2">
                  {product.manufacturer.logoUrl && (
                    <img
                      src={product.manufacturer.logoUrl}
                      alt={product.manufacturer.companyName}
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                  )}
                  <span className="text-xs text-gray-500 font-medium">{product.manufacturer.companyName}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h2>
                {product.genres && product.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.genres.map((genre, index) => (
                      <span key={index} className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-medium">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                {product.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {product.description}
                  </p>
                )}
                <div className="mt-auto">
                  <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-500">
                    {product.minPlayers && product.maxPlayers && (
                      <span>{product.minPlayers}-{product.maxPlayers} players</span>
                    )}
                    {product.playTime && <span>• {product.playTime}</span>}
                    {product.ageRange && <span>• Ages {product.ageRange}</span>}
                  </div>
                  <Link
                    href={`/products/${product.id}/request`}
                    className="inline-block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition font-semibold"
                  >
                    Request Product
                  </Link>
                  {product.infoUrl && (
                    <a
                      href={product.infoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block w-full text-center px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition text-sm"
                    >
                      Learn More
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  infoUrl: string | null
  genres: string[]
  manufacturer: {
    companyName: string
  }
}

export default function RequestSampleProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    contactName: '',
    contactEmail: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'US',
    message: '',
  })

  useEffect(() => {
    if (params.id) {
      fetch(`/api/products/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Error fetching product:', err)
          setLoading(false)
        })
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: params.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to submit request')
        setSubmitting(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Product not found.</p>
          <Link href="/products" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your request for <strong>{product.name}</strong> has been submitted. The publisher will review your request and contact you via email.
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Browse More Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/products" className="text-primary-600 hover:text-primary-700">
          ← Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {product.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-32 h-32 object-cover rounded-md border"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sample Product: {product.name}</h2>
            {product.genres && product.genres.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {product.genres.map((genre) => (
                  <span
                    key={`${product.id}-${genre}`}
                    className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            <p className="text-gray-600">Published by {product.manufacturer.companyName}</p>
            {product.infoUrl && (
              <a
                href={product.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-700"
              >
                View more product information →
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Request Form</h1>
        <p className="text-gray-600 mb-6">
          Fill out the form below to request a sample product. The publisher will review your request and contact you.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              required
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Type <span className="text-red-500">*</span>
            </label>
            <select
              id="organizationType"
              name="organizationType"
              required
              value={formData.organizationType}
              onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select type</option>
              <option value="Non-Profit">Non-Profit Organization</option>
              <option value="Educational">Educational Institution</option>
              <option value="Library">Library</option>
              <option value="Community Center">Community Center</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                id="contactName"
                name="contactName"
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
            
            <div className="mb-4">
              <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                id="shippingAddress"
                name="shippingAddress"
                type="text"
                required
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="shippingCity" className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="shippingCity"
                  name="shippingCity"
                  type="text"
                  required
                  value={formData.shippingCity}
                  onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="shippingState" className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  id="shippingState"
                  name="shippingState"
                  type="text"
                  required
                  value={formData.shippingState}
                  onChange={(e) => setFormData({ ...formData, shippingState: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="shippingZip" className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="shippingZip"
                  name="shippingZip"
                  type="text"
                  required
                  value={formData.shippingZip}
                  onChange={(e) => setFormData({ ...formData, shippingZip: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="shippingCountry" className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                id="shippingCountry"
                name="shippingCountry"
                type="text"
                required
                value={formData.shippingCountry}
                onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about your organization
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Share details that will help the publisher understand your mission and how you plan to use the sample product."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href="/products"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


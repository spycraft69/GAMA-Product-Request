'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Request {
  id: string
  status: string
  organizationName: string
  organizationType: string
  contactName: string
  contactEmail: string
  contactPhone: string | null
  shippingAddress: string | null
  shippingCity: string | null
  shippingState: string | null
  shippingZip: string | null
  shippingCountry: string | null
  eventDate: string | null
  expectedAttendees: number | null
  message: string | null
  createdAt: string
  product: {
    id: string
    name: string
    genres: string[]
    infoUrl: string | null
    manufacturer: {
      companyName: string
    }
  }
}

export default function RequestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (params.id && session) {
      fetch(`/api/requests/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setRequest(data)
          setLoading(false)
        })
        .catch(err => {
          console.error('Error fetching request:', err)
          setLoading(false)
        })
    }
  }, [params.id, session])

  const handleStatusUpdate = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this request?`)) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/requests/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const updatedRequest = await response.json()
      setRequest(updatedRequest)
    } catch (err) {
      alert('Failed to update status. Please try again.')
    } finally {
      setUpdating(false)
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

  if (!request) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Request not found.</p>
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'DENIED':
        return 'bg-red-100 text-red-800'
      case 'FULFILLED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Request</h1>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Product</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.product.name}</dd>
              </div>
              {request.product.genres && request.product.genres.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Genres</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.product.genres.join(', ')}</dd>
                </div>
              )}
              {request.product.infoUrl && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Product Info</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={request.product.infoUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                      {request.product.infoUrl}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Organization</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.organizationName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Organization Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.organizationType}</dd>
              </div>
              {request.eventDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Event Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(request.eventDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {request.expectedAttendees && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expected Attendees</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.expectedAttendees}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(request.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{request.contactName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a href={`mailto:${request.contactEmail}`} className="text-primary-600 hover:text-primary-700">
                    {request.contactEmail}
                  </a>
                </dd>
              </div>
              {request.contactPhone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`tel:${request.contactPhone}`} className="text-primary-600 hover:text-primary-700">
                      {request.contactPhone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {(request.shippingAddress || request.shippingCity) && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="text-gray-900">
                {request.shippingAddress && <p>{request.shippingAddress}</p>}
                {(request.shippingCity || request.shippingState || request.shippingZip) && (
                  <p>
                    {request.shippingCity}{request.shippingCity && request.shippingState ? ', ' : ''}
                    {request.shippingState} {request.shippingZip}
                  </p>
                )}
                {request.shippingCountry && <p>{request.shippingCountry}</p>}
              </div>
            </div>
          )}

          {request.message && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Message</h2>
              <p className="text-gray-600 whitespace-pre-line">{request.message}</p>
            </div>
          )}

          {session?.user?.role === 'MANUFACTURER' && request.status === 'PENDING' && (
            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleStatusUpdate('APPROVED')}
                  disabled={updating}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Approve Request'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('DENIED')}
                  disabled={updating}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Deny Request'}
                </button>
              </div>
            </div>
          )}

          {session?.user?.role === 'MANUFACTURER' && request.status === 'APPROVED' && (
            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              <button
                onClick={() => handleStatusUpdate('FULFILLED')}
                disabled={updating}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Mark as Fulfilled'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


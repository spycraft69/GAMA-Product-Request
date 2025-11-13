'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  isAvailable: boolean
  imageUrl?: string | null
  genres?: string[]
  infoUrl?: string | null
  _count: {
    requests: number
  }
}

interface Request {
  id: string
  status: string
  organizationName: string
  contactEmail: string
  product: {
    name: string
    genres: string[]
    infoUrl: string | null
  }
  createdAt: string
}

interface Manufacturer {
  companyName: string
  description: string | null
  logoUrl: string | null
}

interface PublisherProfile {
  companyName: string
  description: string | null
  website: string | null
  logoUrl: string | null
  contactName: string
  contactEmail: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [profile, setProfile] = useState<PublisherProfile | null>(null)
  const [profileForm, setProfileForm] = useState({
    companyName: '',
    description: '',
    website: '',
    contactName: '',
  })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [loading, setLoading] = useState(true)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      if (!session) {
        return
      }

      if (session.user?.role === 'MANUFACTURER') {
        try {
          const [profileRes, productsRes, requestsRes] = await Promise.all([
            fetch('/api/publishers/profile'),
            fetch('/api/products/manage'),
            fetch('/api/requests'),
          ])

          if (profileRes.ok) {
            const profileData = await profileRes.json()
            updateProfileState(profileData)
          }

          if (productsRes.ok) {
            const productsData = await productsRes.json()
            setProducts(productsData)
          }

          if (requestsRes.ok) {
            const requestsData = await requestsRes.json()
            setRequests(requestsData)
          }
        } catch (error) {
          console.error('Error loading dashboard data:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status, router])

  const updateProfileState = (data: PublisherProfile) => {
    setProfile(data)
    setProfileForm({
      companyName: data.companyName ?? '',
      description: data.description ?? '',
      website: data.website ?? '',
      contactName: data.contactName ?? '',
    })
  }

  const resetProfileForm = () => {
    if (profile) {
      setProfileForm({
        companyName: profile.companyName ?? '',
        description: profile.description ?? '',
        website: profile.website ?? '',
        contactName: profile.contactName ?? '',
      })
    }
  }

  const handleProfileSave = async () => {
    if (!profile) {
      return
    }

    const companyName = profileForm.companyName.trim()
    const contactName = profileForm.contactName.trim()

    if (!companyName) {
      setProfileError('Company name is required')
      return
    }

    if (!contactName) {
      setProfileError('Contact name is required')
      return
    }

    setProfileError('')
    setProfileSaving(true)

    try {
      const response = await fetch('/api/publishers/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          description: profileForm.description.trim(),
          website: profileForm.website.trim(),
          contactName,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setProfileError(data.error || 'Failed to update profile')
        return
      }

      const updatedProfile = await response.json()
      updateProfileState(updatedProfile)
      setIsEditingProfile(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      setProfileError('Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleProfileCancel = () => {
    resetProfileForm()
    setProfileError('')
    setIsEditingProfile(false)
  }

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setLogoError('')
    setLogoUploading(true)

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/publishers/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        setLogoError(data.error || 'Failed to upload logo')
        return
      }

      const updatedProfile = await response.json()
      updateProfileState(updatedProfile)
    } catch (error) {
      console.error('Error uploading logo:', error)
      setLogoError('Failed to upload logo')
    } finally {
      setLogoUploading(false)
      event.target.value = ''
    }
  }

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null
  }

  const userRole = session.user?.role

  if (userRole === 'MANUFACTURER') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Publisher Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome back, {(profile?.contactName || session.user?.name) ?? 'Publisher'}!</p>
            </div>
            <Link
              href="/dashboard/products/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Add Product
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Publisher Profile</h2>
            {profile && (
              isEditingProfile ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleProfileCancel}
                    disabled={profileSaving}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60"
                  >
                    {profileSaving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    resetProfileForm()
                    setProfileError('')
                    setIsEditingProfile(true)
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit Profile
                </button>
              )
            )}
          </div>
          {profileError && <p className="text-sm text-red-600 mb-4">{profileError}</p>}
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
              {profile?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.logoUrl}
                  alt={profile.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm text-center px-2">No logo</span>
              )}
            </div>
            <div className="flex-1 w-full">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.companyName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, companyName: e.target.value }))}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.contactName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, contactName: e.target.value }))}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      value={profileForm.description}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                    {logoError && <p className="text-sm text-red-600 mt-2">{logoError}</p>}
                    {logoUploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">{profile?.companyName}</p>
                  <div className="text-sm text-gray-600">
                    <p>Contact: {profile?.contactName}</p>
                    <p>Email: {profile?.contactEmail}</p>
                  </div>
                  {profile?.website && (
                    <p className="text-sm">
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {profile.website}
                      </a>
                    </p>
                  )}
                  {profile?.description && (
                    <p className="text-gray-600">{profile.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Total Products</h2>
            <p className="text-3xl font-bold text-primary-600">{products.length}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Pending Requests</h2>
            <p className="text-3xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Your Products</h2>
            {products.length === 0 ? (
              <p className="text-gray-500">No products yet. Add your first product!</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
                      <div className="w-full sm:w-32 h-32 mb-4 sm:mb-0 rounded-md border bg-gray-100 overflow-hidden flex items-center justify-center">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm text-gray-400 text-center px-4">No image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                              <span
                                className={`px-2 py-1 rounded ${
                                  product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {product.isAvailable ? 'Available' : 'Unavailable'}
                              </span>
                              {product.genres && product.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {product.genres.map((genre) => (
                                    <span
                                      key={`${product.id}-${genre}`}
                                      className="px-2 py-1 rounded bg-blue-100 text-blue-800"
                                    >
                                      {genre}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {product.infoUrl && (
                                <a
                                  href={product.infoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary-600 hover:text-primary-700"
                                >
                                  Product info →
                                </a>
                              )}
                              <span>{product._count.requests} requests</span>
                            </div>
                          </div>
                          <Link
                            href={`/dashboard/products/${product.id}`}
                            className="text-primary-600 hover:text-primary-700 flex-shrink-0"
                          >
                            Manage
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Requests</h2>
            {requests.length === 0 ? (
              <p className="text-gray-500">No requests yet.</p>
            ) : (
              <div className="space-y-4">
                {requests.slice(0, 5).map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{request.product.name}</h3>
                        {request.product.genres && request.product.genres.length > 0 && (
                          <p className="text-xs text-blue-700 mt-1">
                            Genres: {request.product.genres.join(', ')}
                          </p>
                        )}
                        {request.product.infoUrl && (
                          <a
                            href={request.product.infoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:text-primary-700"
                          >
                            Product info →
                          </a>
                        )}
                        <p className="text-sm text-gray-600">{request.organizationName}</p>
                        <p className="text-sm text-gray-500">{request.contactEmail}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                          request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          request.status === 'DENIED' ? 'bg-red-100 text-red-800' :
                          request.status === 'FULFILLED' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <Link
                        href={`/dashboard/requests/${request.id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Requestors do not need a dashboard. Browse products to request demos.</p>
        <Link
          href="/products"
          className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Browse Products
        </Link>
      </div>
    </div>
  )
}

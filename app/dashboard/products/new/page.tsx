'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const GENRES = [
  'Strategy',
  'Adventure',
  'Cooperative',
  'Family',
  'Party',
  'Role-Playing',
  'Deck-Building',
  'Dice',
  'War',
  'Abstract',
  'Puzzle',
  'Campaign',
  'Horror',
  'Sci-Fi',
  'Fantasy',
  'Educational',
  'Miniatures',
  'Negotiation',
  'Resource Management',
  'Sports',
  'Storytelling',
  'Other',
]

export default function NewProductPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genres: [] as string[],
    infoUrl: '',
    minPlayers: '',
    maxPlayers: '',
    playTime: '',
    ageRange: '',
    isAvailable: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session || session.user?.role !== 'MANUFACTURER') {
    router.push('/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const submission = new FormData()
      submission.append('name', formData.name)
      submission.append('description', formData.description)
      formData.genres.forEach((genre) => submission.append('genres', genre))
      submission.append('infoUrl', formData.infoUrl)
      submission.append('minPlayers', formData.minPlayers)
      submission.append('maxPlayers', formData.maxPlayers)
      submission.append('playTime', formData.playTime)
      submission.append('ageRange', formData.ageRange)
      if (formData.isAvailable) {
        submission.append('isAvailable', 'on')
      }
      if (imageFile) {
        submission.append('image', imageFile)
      }

      const response = await fetch('/api/products/manage', {
        method: 'POST',
        body: submission,
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create product')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Product</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
                Genres
              </label>
              <select
                id="genre"
                name="genres"
                multiple
                value={formData.genres}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((option) => option.value)
                  setFormData({ ...formData, genres: values })
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 h-40"
              >
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">Hold Command (⌘) on Mac or Control (Ctrl) on Windows to select multiple genres.</p>
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-2">Upload an image to show alongside the product listing.</p>
            </div>
          </div>

          <div>
            <label htmlFor="infoUrl" className="block text-sm font-medium text-gray-700 mb-2">
              More Information URL
            </label>
            <input
              id="infoUrl"
              name="infoUrl"
              type="url"
              value={formData.infoUrl}
              onChange={(e) => setFormData({ ...formData, infoUrl: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://example.com/product-details"
            />
            <p className="text-xs text-gray-500 mt-2">Optional link where requestors can learn more about this product.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minPlayers" className="block text-sm font-medium text-gray-700 mb-2">
                Min Players
              </label>
              <input
                id="minPlayers"
                name="minPlayers"
                type="number"
                min="1"
                value={formData.minPlayers}
                onChange={(e) => setFormData({ ...formData, minPlayers: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700 mb-2">
                Max Players
              </label>
              <input
                id="maxPlayers"
                name="maxPlayers"
                type="number"
                min="1"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="playTime" className="block text-sm font-medium text-gray-700 mb-2">
                Play Time (e.g., "30-60 min")
              </label>
              <input
                id="playTime"
                name="playTime"
                type="text"
                value={formData.playTime}
                onChange={(e) => setFormData({ ...formData, playTime: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-2">
                Age Range (e.g., "8+")
              </label>
              <input
                id="ageRange"
                name="ageRange"
                type="text"
                value={formData.ageRange}
                onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Product is available for demo requests</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


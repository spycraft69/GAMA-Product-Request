import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            GAMA Free Product Requests
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Browse tabletop products and request free demo copies shipped to your organization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
            >
              Browse Products
            </Link>
            <Link
              href="/register?role=manufacturer"
              className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition border border-primary-500"
            >
              I'm a Publisher
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Organizations</h3>
            <p className="text-gray-600">
              Browse available tabletop games and request free demo copies to be shipped to your organization.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Publishers</h3>
            <p className="text-gray-600">
              Create an account and list your products to provide free demo copies to non-profits and educational institutions.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Simple Process</h3>
            <p className="text-gray-600">
              No login required for requestors. Just browse products, fill out a form, and receive your demo copy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

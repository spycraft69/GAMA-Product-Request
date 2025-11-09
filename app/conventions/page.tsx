import type { Metadata } from 'next'
import Link from 'next/link'
import { conventions } from '@/lib/conventions'

export const metadata: Metadata = {
  title: 'Evil Genius Games Convention Schedule',
  description:
    'See where Evil Genius Games will be next. Find upcoming conventions with dates, locations, and links for more information.',
}

const longDate = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const monthDay = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
})

const dayYear = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  year: 'numeric',
})

function formatDateRange(startDate: string, endDate?: string) {
  const start = new Date(`${startDate}T00:00:00`)

  if (!endDate) {
    return longDate.format(start)
  }

  const end = new Date(`${endDate}T00:00:00`)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return `${startDate}${endDate ? ` – ${endDate}` : ''}`
  }

  if (start.toDateString() === end.toDateString()) {
    return longDate.format(start)
  }

  const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()
  const sameYear = start.getFullYear() === end.getFullYear()

  if (sameMonth) {
    return `${monthDay.format(start)} – ${dayYear.format(end)}`
  }

  if (sameYear) {
    return `${monthDay.format(start)} – ${longDate.format(end)}`
  }

  return `${longDate.format(start)} – ${longDate.format(end)}`
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export default function ConventionsPage() {
  const sortedConventions = [...conventions].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )

  return (
    <div className="pb-16">
      <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold tracking-tight">Evil Genius Games Convention Schedule</h1>
          <p className="mt-4 text-lg text-primary-100 max-w-3xl">
            Catch our team at upcoming shows, see what we&apos;re bringing to the exhibit hall, and plan a visit to
            our booth. Dates are updated as new events are confirmed.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {sortedConventions.map((convention) => (
            <article
              key={`${convention.name}-${convention.startDate}`}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-5">
                {convention.logo ? (
                  <img
                    src={convention.logo}
                    alt={`${convention.name} logo`}
                    className="h-16 w-16 flex-shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-primary-100 bg-primary-50 text-xl font-semibold text-primary-700">
                    {getInitials(convention.name)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{convention.name}</h2>
                  <p className="mt-1 text-sm font-medium text-primary-600">
                    {formatDateRange(convention.startDate, convention.endDate)}
                  </p>
                  <p className="text-sm text-gray-600">{convention.location}</p>
                </div>
              </div>

              {convention.description && (
                <p className="px-6 pt-4 text-sm text-gray-600">{convention.description}</p>
              )}

              <div className="mt-auto px-6 pb-6 pt-4">
                <Link
                  href={convention.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700"
                >
                  Visit event site
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="ml-1 h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M5 10a.75.75 0 01.75-.75h5.638L9.23 7.09a.75.75 0 011.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 01-1.04-1.08l2.158-2.16H5.75A.75.75 0 015 10z" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-dashed border-primary-200 bg-primary-50 px-6 py-8 text-sm text-primary-700">
          Want to see Evil Genius Games at a convention near you?{' '}
          <a
            href="mailto:info@evilgeniusgaming.com"
            className="font-semibold text-primary-800 underline hover:text-primary-900"
          >
            Let us know
          </a>{' '}
          and we&apos;ll reach out as we build the schedule.
        </div>
      </div>
    </div>
  )
}


import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import '../assets/styles/categories_new.css'

function ChevronIcon() {
  return (
    <svg
      className="category-card__chevron"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadCategories() {
      try {
        const response = await fetch('/api/categories', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Unable to load categories')
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Unexpected category response')
        }

        if (!controller.signal.aborted) {
          setCategories(data)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadCategories()

    return () => controller.abort()
  }, [])

  return (
    <main className="categories-page">
      <nav className="categories-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Categories</span>
      </nav>

      <h1 className="categories-page__title">Shop by category</h1>

      {loading && (
        <p role="status" className="categories-page__message">
          Loading categories...
        </p>
      )}

      {error && (
        <p role="alert" className="categories-page__message">
          {error}. Please refresh to try again.
        </p>
      )}

      {!loading && !error && categories.length === 0 && (
        <p className="categories-page__message">
          No categories available.
        </p>
      )}

      <ul className="category-grid" aria-label="Product categories">
        {categories.map((category) => (
          <li key={category.id}>
            <article className="category-card">
              <div className="category-card__media">
                {category.image ? (
                  <img src={category.image} alt="" loading="lazy" />
                ) : (
                  <span
                    className="category-card__placeholder"
                    aria-hidden="true"
                  >
                    {category.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="category-card__body">
                <h2 className="category-card__name">
                  {category.name}
                </h2>

                {category.description && (
                  <p className="category-card__description">
                    {category.description}
                  </p>
                )}

                <Link
                  to={`/categories/${category.id}`}
                  className="category-card__cta"
                  aria-label={`Explore ${category.name}`}
                >
                  Explore now
                  <ChevronIcon />
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </main>
  )
}
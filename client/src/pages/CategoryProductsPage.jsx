import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import '../assets/styles/categories_new.css'

export default function CategoryProductsPage() {
  const { categoryId } = useParams()

  const [result, setResult] = useState({
    categoryId: null,
    products: [],
    error: '',
  })

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        const response = await fetch(
          `/api/products?categoryId=${encodeURIComponent(categoryId)}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('Unable to load products')
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Unexpected product response')
        }

        if (!controller.signal.aborted) {
          setResult({
            categoryId,
            products: data,
            error: '',
          })
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({
            categoryId,
            products: [],
            error: error.message,
          })
        }
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [categoryId])

  const loading = result.categoryId !== categoryId

  return (
    <main className="categories-page">
      <nav className="categories-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">›</span>
        <Link to="/categories">Categories</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Products</span>
      </nav>

      <h1 className="categories-page__title">
        Products in this category
      </h1>

      {loading ? (
        <p role="status" className="categories-page__message">
          Loading products...
        </p>
      ) : result.error ? (
        <p role="alert" className="categories-page__message">
          {result.error}. Please refresh to try again.
        </p>
      ) : result.products.length === 0 ? (
        <p className="categories-page__message">
          No products available in this category.
        </p>
      ) : (
        <ul aria-label="Products">
          {result.products.map((product) => (
            <li key={product.id}>
              <h2>{product.name}</h2>
              <p>Price: {Number(product.price).toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}

      <Link to="/categories">← Back to categories</Link>
    </main>
  )
}
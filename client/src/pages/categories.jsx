import { useEffect, useState } from 'react'
import '../assets/styles/categories.css'

function Categories() {
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

  const [productResult, setProductResult] = useState({
    categoryId: null,
    products: [],
    error: '',
  })

  // Load categories when the page opens.
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
        setCategories(data)
      } catch (error) {
        if (!controller.signal.aborted) {
          setCategoriesError(error.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setCategoriesLoading(false)
        }
      }
    }

    loadCategories()

    return () => controller.abort()
  }, [])

  // Load products whenever the selected category changes.
  useEffect(() => {
    if (!selectedCategory) return

    const controller = new AbortController()
    const categoryId = selectedCategory.id

    async function loadProducts() {
      try {
        const response = await fetch(
          `/api/products?categoryId=${categoryId}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('Unable to load products')
        }

        const data = await response.json()

        if (!controller.signal.aborted) {
          setProductResult({
            categoryId,
            products: data,
            error: '',
          })
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setProductResult({
            categoryId,
            products: [],
            error: error.message,
          })
        }
      }
    }

    loadProducts()

    return () => controller.abort()
  }, [selectedCategory])

  const productsLoading =
    selectedCategory !== null &&
    productResult.categoryId !== selectedCategory.id

  return (
    <main className="store-categories">
      <h1>Bhardwaj Store — Categories</h1>

      {categoriesLoading && (
        <p role="status">Loading categories...</p>
      )}

      {categoriesError && (
        <p role="alert">{categoriesError}. Please refresh to try again.</p>
      )}

      {!categoriesLoading &&
        !categoriesError &&
        categories.length === 0 && (
          <p>No categories available.</p>
        )}

      <div role="group" aria-label="Product categories">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-pressed={selectedCategory?.id === category.id}
            onClick={() => setSelectedCategory(category)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {!selectedCategory && <p>Please select a category.</p>}

      {selectedCategory && (
        <section aria-labelledby="products-heading">
          <h2 id="products-heading">
            Products in {selectedCategory.name}
          </h2>

          {productsLoading ? (
            <p role="status">Loading products...</p>
          ) : productResult.error ? (
            <p role="alert">
              {productResult.error}. Please select another category
              and try again.
            </p>
          ) : productResult.products.length === 0 ? (
            <p>No products available in this category.</p>
          ) : (
            <ul>
              {productResult.products.map((product) => (
                <li key={product.id}>
                  {product.name} — ${Number(product.price).toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}

export default Categories
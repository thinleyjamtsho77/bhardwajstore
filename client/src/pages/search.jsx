
import { useEffect, useState } from "react";
import ProductCard from "../components/product-card";
import "../assets/styles/search-results.css";

const PAGE_SIZE = 6;

export default function SearchResults() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [sortBy, setSortBy] = useState("low-to-high");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Fetch products and categories from the database
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, categoriesResponse] =
          await Promise.all([
            fetch("/api/products"),
            fetch("/api/categories"),
          ]);

        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error("Failed to load products or categories.");
        }

        const [productsData, categoriesData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
        ]);

        if (
          !Array.isArray(productsData) ||
          !Array.isArray(categoriesData)
        ) {
          throw new Error("Invalid data received from the server.");
        }

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error loading search page data:", err);
        setError("Unable to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Search suggestions based on product names
  const suggestions = search.trim()
    ? products
        .filter((product) =>
          product.name
            ?.toLowerCase()
            .includes(search.trim().toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Submit keyword search
  function handleSearch(event) {
    event.preventDefault();

    setSubmittedSearch(search.trim());
    setCurrentPage(1);
    setIsSearchFocused(false);
  }

  // Select a suggestion without submitting the search
  function handleSuggestionClick(productName) {
    setSearch(productName);
    setIsSearchFocused(false);
  }

  // Toggle category filter
  function handleCategoryClick(categoryId) {
    setSelectedCategoryId((previous) =>
      Number(previous) === Number(categoryId) ? null : categoryId
    );

    setCurrentPage(1);
  }

  // Filter and sort products
  const filteredProducts = products
    .filter((product) =>
      product.name
        ?.toLowerCase()
        .includes(submittedSearch.toLowerCase())
    )
    .filter((product) => {
      if (selectedCategoryId === null) {
        return true;
      }

      return (
        Number(product.categoryId) === Number(selectedCategoryId)
      );
    })
    .sort((a, b) => {
      const priceA = Number(a.price);
      const priceB = Number(b.price);

      if (sortBy === "low-to-high") {
        return priceA - priceB;
      }

      if (sortBy === "high-to-low") {
        return priceB - priceA;
      }

      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(
    filteredProducts.length / PAGE_SIZE
  );

  const safePage = Math.min(
    currentPage,
    Math.max(1, totalPages)
  );

  const displayedProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  function updateSort(value) {
    setSortBy(value);
    setCurrentPage(1);
  }

  // Loading state
  if (loading) {
    return (
      <div className="search-page">
        <p className="search-status">Loading products...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="search-page">
        <p className="search-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="search-page">
      <aside className="category-sidebar">
        <h2>Categories</h2>

        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={
              Number(selectedCategoryId) === Number(category.id)
                ? "category-button active"
                : "category-button"
            }
            aria-pressed={
              Number(selectedCategoryId) === Number(category.id)
            }
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </button>
        ))}
      </aside>

      <section className="search-content">
        <form className="search-controls" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              type="search"
              placeholder="Search product"
              aria-label="Search product"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />

            {isSearchFocused && suggestions.length > 0 && (
              <ul className="search-suggestions">
                {suggestions.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onMouseDown={(event) =>
                        event.preventDefault()
                      }
                      onClick={() =>
                        handleSuggestionClick(product.name)
                      }
                    >
                      {product.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        <div className="results-heading">
          <div className="results-title">
            <h2>
              {filteredProducts.length} Search Result
              {filteredProducts.length !== 1 ? "s" : ""}
            </h2>

            <p className="current-page-info">
              Page {safePage} of {Math.max(1, totalPages)}
            </p>
          </div>

          <label>
            Sort By{" "}
            <select
              value={sortBy}
              onChange={(event) => updateSort(event.target.value)}
            >
              <option value="low-to-high">Price Low to High</option>
              <option value="high-to-low">Price High to Low</option>
              <option value="name">Product Name</option>
            </select>
          </label>
        </div>

        <div className="product-grid">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="no-results">No products found.</p>
        )}

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Pagination">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setCurrentPage(safePage - 1)}
            >
              ‹ Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                type="button"
                key={page}
                className={
                  page === safePage
                    ? "page-number active"
                    : "page-number"
                }
                aria-current={
                  page === safePage ? "page" : undefined
                }
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
            >
              Next ›
            </button>
          </nav>
        )}

        {totalPages === 1 && (
          <nav className="pagination" aria-label="Pagination">
            <button
              type="button"
              className="page-number active"
              aria-current="page"
            >
              1
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}

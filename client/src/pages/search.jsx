
import { useState } from "react";
import ProductCard from "../components/product-card";
import "../assets/styles/search-results.css";

const sampleProducts = [
  { id: 1, name: "Olive Oil", price: 4.0, stock: "In Stock" },
  { id: 2, name: "Sunflower Oil", price: 3.5, stock: "In Stock" },
  { id: 3, name: "Coconut Oil", price: 6.0, stock: "In Stock" },
];

const categories = [
  "Cereals",
  "Pulses",
  "Spices",
  "Oils",
  "Snacks",
  "More",
];

const PAGE_SIZE = 6;

export default function SearchResults() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("low-to-high");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState({});

  const filteredProducts = sampleProducts
    .filter((product) =>
      product.name.toLowerCase().includes(search.trim().toLowerCase())
    )
    .filter((product) => {
      // Preserve the existing category-filter behavior.
      const selected = selectedCategories.Oils;

      if (!selected || selected === "all") {
        return true;
      }

      return product.name.toLowerCase().includes(selected.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "low-to-high") {
        return a.price - b.price;
      }

      if (sortBy === "high-to-low") {
        return b.price - a.price;
      }

      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));

  const displayedProducts = filteredProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  function updateSearch(value) {
    setSearch(value);
    setCurrentPage(1);
  }

  function updateSort(value) {
    setSortBy(value);
    setCurrentPage(1);
  }

  function updateCategory(category, value) {
    setSelectedCategories((previous) => ({
      ...previous,
      [category]: value,
    }));

    setCurrentPage(1);
  }

  return (
    <div className="search-page">
      <aside className="category-sidebar">
        <h2>Categories</h2>

        {categories.map((category) => (
          <select
            key={category}
            className="category-select"
            aria-label={`${category} category`}
            value={selectedCategories[category] || "all"}
            onChange={(event) =>
              updateCategory(category, event.target.value)
            }
          >
            <option value="all">All {category}</option>
          </select>
        ))}
      </aside>

      <section className="search-content">
        <form
          className="search-controls"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="search"
            placeholder="Search product"
            aria-label="Search product"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
          />

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
            <ProductCard key={product.id} product={product} />
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
                  page === safePage ? "page-number active" : "page-number"
                }
                aria-current={page === safePage ? "page" : undefined}
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

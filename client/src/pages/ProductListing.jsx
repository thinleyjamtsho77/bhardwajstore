import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getCategories, getProducts } from "../api/catalogApi";
import "../assets/styles/products.css";

export default function ProductListing() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState("");
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setError("Could not load categories."));
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({ categoryId, brand, sort })
      .then((rows) => {
        setProducts(rows);
        setError("");
        if (!brand) setBrands([...new Set(rows.map((p) => p.brand).filter(Boolean))]);
      })
      .catch(() => setError("Could not load products."))
      .finally(() => setLoading(false));
  }, [categoryId, brand, sort]);

  const title = categories.find((c) => String(c.id) === String(categoryId))?.name || "All Products";

  return (
    <div className="listing">
      <aside className="sidebar">
        <h3>Categories</h3>
        <button className={!categoryId ? "active" : ""} onClick={() => { setCategoryId(""); setBrand(""); }}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={String(categoryId) === String(c.id) ? "active" : ""}
            onClick={() => { setCategoryId(c.id); setBrand(""); }}
          >
            {c.name}
          </button>
        ))}
      </aside>

      <main className="listing-main">
        <div className="listing-top">
          <h2>{title}</h2>
          <div className="listing-controls">
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort product by</option>
              <option value="brand">Brand</option>
              <option value="price_asc">Price: Min to Max</option>
              <option value="price_desc">Price: Max to Min</option>
            </select>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading...</p>}
        {!loading && !error && products.length === 0 && <p>No products found.</p>}

        <div className="grid">
          {products.map((p) => (
            <div className="card" key={p.id}>
              <Link to={`/products/${p.id}`}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} />
                ) : (
                  <div className="no-image">No image</div>
                )}
                <p className="card-name">{p.name}</p>
              </Link>
              <p className="card-price">
                ₹{Number(p.price)}
                {p.sizeValue ? `/${Number(p.sizeValue)}${p.sizeUnit || ""}` : ""}
              </p>
              {p.stock === 0 && <p className="out">Out of stock</p>}
              <button disabled={p.stock === 0}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
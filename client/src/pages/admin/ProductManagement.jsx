import { useEffect, useMemo, useState } from "react";
import {
  getAdminProducts, getCategories, saveProduct, deleteProduct,
} from "../../api/catalogApi";
import "../../assets/styles/admin/admin-products.css";

const EMPTY = {
  name: "", categoryName: "", price: "", stock: 0, imageUrl: "", isActive: "1",
  brand: "", sizeValue: "", sizeUnit: "g", description: "", sku: "",
};

const svg = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const SearchIcon = () => (<svg {...svg}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>);
const FilterIcon = () => (<svg {...svg}><path d="M3 4h18l-7 8v6l-4 2v-8z" /></svg>);
const EditIcon = () => (<svg {...svg}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>);
const TrashIcon = () => (<svg {...svg}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>);

function Thumb({ src, alt }) {
  const [bad, setBad] = useState(false);
  if (!src || bad) return <div className="ap-thumb ap-thumb-empty" />;
  return <img className="ap-thumb" src={src} alt={alt} onError={() => setBad(true)} />;
}

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [formError, setFormError] = useState("");
  const PER_PAGE = 10;

  const load = () =>
    getAdminProducts()
      .then(setProducts)
      .catch((e) => setMessage({ text: e.message, type: "error" }));

  const loadCategories = () => getCategories().then(setCategories).catch(() => {});

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY);
    setShowMore(false);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      categoryName: p.categoryName,
      price: Number(p.price),
      stock: p.stock,
      imageUrl: p.imageUrl || "",
      isActive: String(p.isActive),
      brand: p.brand || "",
      sizeValue: p.sizeValue ? Number(p.sizeValue) : "",
      sizeUnit: p.sizeUnit || "g",
      description: p.description || "",
      sku: p.sku || "",
    });
    setShowMore(false);
    setFormError("");
    setModalOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await saveProduct({ ...form, isActive: Number(form.isActive) }, editingId);
      setMessage({ text: editingId ? "Product updated" : "Product added", type: "ok" });
      setModalOpen(false);
      load();
      loadCategories();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function onDelete(p) {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    try {
      await deleteProduct(p.id);
      setMessage({ text: "Product deleted", type: "ok" });
      load();
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    }
  }

  const shown = useMemo(() => {
    let rows = products.filter((p) => {
      const q = search.trim().toLowerCase();
      if (q && !p.name.toLowerCase().includes(q) && !p.categoryName.toLowerCase().includes(q)) return false;
      if (statusFilter !== "" && String(p.isActive) !== statusFilter) return false;
      if (categoryFilter && p.categoryName !== categoryFilter) return false;
      return true;
    });
    if (sort === "name") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "price_asc") rows = [...rows].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") rows = [...rows].sort((a, b) => b.price - a.price);
    if (sort === "stock_asc") rows = [...rows].sort((a, b) => a.stock - b.stock);
    return rows;
  }, [products, search, statusFilter, categoryFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = shown.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <>
      {/* AdminLayout already provides <main>, so this is a plain div */}
      <div className="ap-main">
        <div className="ap-title-row">
          <h1>Products</h1>
          <button className="ap-btn-dark" onClick={openAdd}>Add New Product</button>
        </div>

        {message.text && (
          <p className={message.type === "error" ? "ap-msg ap-msg-error" : "ap-msg ap-msg-ok"}>
            {message.text}
          </p>
        )}

        <div className="ap-toolbar">
          <label className="ap-search">
            <SearchIcon />
            <input
              placeholder="Search item"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </label>

          <div className="ap-toolbar-right">
            <div className="ap-filter-wrap">
              <button className="ap-pill" onClick={() => setFilterOpen(!filterOpen)}>
                <FilterIcon /> Filter
              </button>
              {filterOpen && (
                <div className="ap-filter-panel">
                  <label>Status
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                      <option value="">All</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </label>
                  <label>Category
                    <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
                      <option value="">All</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="ap-btn-light"
                    onClick={() => { setStatusFilter(""); setCategoryFilter(""); }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <select className="ap-pill ap-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort By</option>
              <option value="name">Name</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="stock_asc">Stock: lowest first</option>
            </select>
          </div>
        </div>

        <div className="ap-table-card">
          <table className="ap-table">
            <thead>
              <tr>
                <th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th>
                <th>STOCK</th><th>STATUS</th><th className="ap-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="ap-product-cell">
                      <Thumb src={p.imageUrl} alt={p.name} />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.categoryName}</td>
                  <td>₹{Number(p.price).toFixed(2)}</td>
                  <td className={p.stock === 0 ? "ap-zero" : ""}>{p.stock}</td>
                  <td>
                    <span className={`ap-badge ${p.isActive ? "active" : "inactive"}`}>
                      {p.isActive ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="ap-right">
                    <button className="ap-icon-btn" title="Edit" onClick={() => openEdit(p)}><EditIcon /></button>
                    <button className="ap-icon-btn" title="Delete" onClick={() => onDelete(p)}><TrashIcon /></button>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr><td colSpan="6" className="ap-empty">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="ap-pager">
            <button className="ap-btn-light" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button className="ap-btn-light" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="ap-overlay">
          <form className="ap-modal" onSubmit={onSubmit}>
            <div className="ap-modal-head">
              <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
              <button type="button" className="ap-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            {formError && <p className="ap-msg ap-msg-error">{formError}</p>}

            <label>Product Name
              <input name="name" placeholder="e.g. Cumin Seeds (Jeera)" value={form.name} onChange={onChange} required />
            </label>

            <label>Category
              <input
                name="categoryName"
                list="ap-categories"
                placeholder="e.g. Spices"
                value={form.categoryName}
                onChange={onChange}
                required
              />
              <datalist id="ap-categories">
                {categories.map((c) => <option key={c.id} value={c.name} />)}
              </datalist>
            </label>

            <div className="ap-row">
              <label>Price (₹)
                <input name="price" type="number" min="0" step="0.01" placeholder="40.00" value={form.price} onChange={onChange} required />
              </label>
              <label>Stock Quantity
                <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={onChange} required />
              </label>
            </div>

            <label>Image URL
              <input name="imageUrl" placeholder="https://... or /images/jeera.jpg" value={form.imageUrl} onChange={onChange} />
            </label>

            <label>Status
              <select name="isActive" value={form.isActive} onChange={onChange}>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </label>

            <button type="button" className="ap-link-btn" onClick={() => setShowMore(!showMore)}>
              {showMore ? "Hide extra details" : "More details (brand, size, description)"}
            </button>

            {showMore && (
              <>
                <label>Brand
                  <input name="brand" value={form.brand} onChange={onChange} />
                </label>
                <div className="ap-row">
                  <label>Size
                    <input name="sizeValue" type="number" min="0" step="0.01" value={form.sizeValue} onChange={onChange} />
                  </label>
                  <label>Unit
                    <select name="sizeUnit" value={form.sizeUnit} onChange={onChange}>
                      {["g", "kg", "ml", "l", "piece", "pack"].map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>SKU (leave empty to create one automatically)
                  <input name="sku" value={form.sku} onChange={onChange} />
                </label>
                <label>Description
                  <textarea name="description" rows="3" value={form.description} onChange={onChange} />
                </label>
              </>
            )}

            <div className="ap-modal-actions">
              <button type="button" className="ap-btn-light" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="ap-btn-dark">{editingId ? "Save Changes" : "Add Product"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

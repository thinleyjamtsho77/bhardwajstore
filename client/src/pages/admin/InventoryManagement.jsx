import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

async function adminApi(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new Error("Could not reach the server. Check that the backend is running.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "The request failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function getStatus(stock, reserved, reorderLevel) {
  const available = stock - reserved;
  if (available <= 0) return "Out";
  if (available <= reorderLevel) return "Low";
  return "In Stock";
}

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [selectedId, setSelectedId] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [dialog, setDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    adminApi("/api/admin/inventory")
      .then((data) => { if (!ignore) setProducts(data); })
      .catch((requestError) => { if (!ignore) setError(requestError); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const visibleProducts = useMemo(() => {
    const rows = products.filter((product) => filter === "all" || product.status === filter);
    if (sortBy === "product-asc") rows.sort((a, b) => a.product.localeCompare(b.product));
    if (sortBy === "stock-asc") rows.sort((a, b) => a.stock - b.stock);
    return rows;
  }, [products, filter, sortBy]);
  const selectedProduct = products.find((product) => product.id === selectedId) ?? null;

  function openAdjustment() {
    if (!selectedProduct) return;
    setQuantity(String(selectedProduct.stock));
    setDialog(true);
    setError(null);
  }

  function updateProduct(id, update) {
    setProducts((current) => current.map((product) => product.id === id ? {
      ...product,
      stock: update.stock,
      reserved: update.reserved,
      available: update.available,
      status: getStatus(update.stock, update.reserved, product.reorderLevel),
      updated: "Just now",
    } : product));
  }

  async function saveAdjustment(event) {
    event.preventDefault();
    if (!selectedProduct) return;
    setBusy(true);
    setError(null);
    try {
      const update = await adminApi(`/api/admin/inventory/${selectedId}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ stock: Number(quantity) }),
      });
      updateProduct(selectedId, update);
      setMessage(`${selectedProduct.product} stock updated.`);
      setDialog(false);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  }

  async function restockSelected() {
    if (!selectedProduct) return;
    setBusy(true);
    setError(null);
    try {
      const update = await adminApi(`/api/admin/inventory/${selectedId}/restock`, {
        method: "POST",
        body: JSON.stringify({ quantity: 20 }),
      });
      updateProduct(selectedId, update);
      setMessage(`${selectedProduct.product} restocked by 20 units.`);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-manage admin-manage--figma">
      <div className="admin-page-heading">
        <h1>Inventory Management</h1>
        <div className="admin-page-heading__tools">
          <label className="admin-compact-select"><span className="admin-visually-hidden">Filter inventory</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Filter</option><option value="In Stock">In Stock</option><option value="Low">Low</option><option value="Out">Out</option></select><span aria-hidden="true">▽</span></label>
          <label className="admin-compact-select"><span className="admin-visually-hidden">Sort inventory</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="default">Sort By</option><option value="product-asc">Product A–Z</option><option value="stock-asc">Stock: low to high</option></select><span aria-hidden="true">▾</span></label>
        </div>
      </div>

      {error && <div className="admin-api-error" role="alert"><span>{error.message}</span>{error.status === 401 && <Link to="/login" state={{ from: { pathname: "/admin/inventory" } }}>Sign in</Link>}</div>}

      <div className="admin-figma-table-wrap">
        <table className="admin-figma-table admin-figma-table--inventory">
          <thead><tr><th scope="col">Product ID</th><th scope="col">Product</th><th scope="col">Category</th><th scope="col">Stock</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
          <tbody>
            {loading && <tr><td className="admin-figma-empty" colSpan="6">Loading inventory…</td></tr>}
            {!loading && visibleProducts.map((product) => <tr key={product.id} className={selectedId === product.id ? "is-selected" : ""}>
              <td>{product.productId}</td><td>{product.product}</td><td>{product.category}</td><td>{product.available}</td>
              <td><span className={`admin-stock-pill admin-stock-pill--${product.status.toLowerCase().replace(" ", "-")}`}>{product.status}</span></td>
              <td><button type="button" className="admin-figma-view" onClick={() => { setSelectedId(product.id); setMessage(""); setError(null); }}>View</button></td>
            </tr>)}
            {!loading && !error && visibleProducts.length === 0 && <tr><td className="admin-figma-empty" colSpan="6">No products found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="admin-figma-actions admin-figma-actions--inventory" aria-label="Inventory actions">
        <button type="button" className="admin-action admin-action--restock" disabled={!selectedProduct || busy} onClick={restockSelected}><span aria-hidden="true">⬡</span>{busy ? "Updating…" : "Re-Stock"}</button>
        <button type="button" className="admin-action admin-action--update-stock" disabled={!selectedProduct || busy} onClick={openAdjustment}><span aria-hidden="true">♧</span>Update Stock</button>
      </div>
      <p className="admin-figma-message" role="status">{message || (selectedProduct ? `${selectedProduct.product} selected` : "Select View on a product to enable stock actions.")}</p>

      {dialog && selectedProduct && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setDialog(false); }}><form className="admin-modal" onSubmit={saveAdjustment}>
        <button className="admin-modal__close" type="button" aria-label="Close stock form" disabled={busy} onClick={() => setDialog(false)}>×</button><p className="admin-manage__eyebrow">PRODUCT {selectedProduct.productId}</p><h2>Update stock</h2><p className="admin-modal__subtitle">{selectedProduct.product} · {selectedProduct.category}</p>
        {error && <p className="admin-modal__error" role="alert">{error.message}</p>}
        <label className="admin-form-field">Total stock on hand<input type="number" min={selectedProduct.reserved} step="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
        <p className="admin-form-help">{selectedProduct.reserved} units are reserved. Stock cannot go below the reserved amount.</p>
        <div className="admin-modal__actions"><button type="button" className="admin-button admin-button--secondary" disabled={busy} onClick={() => setDialog(false)}>Cancel</button><button type="submit" className="admin-button admin-button--primary" disabled={busy}>{busy ? "Saving…" : "Save stock"}</button></div>
      </form></div>}
    </main>
  );
}

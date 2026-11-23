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

const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [selectedId, setSelectedId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let ignore = false;
    adminApi("/api/admin/customers")
      .then((data) => { if (!ignore) setCustomers(data); })
      .catch((requestError) => { if (!ignore) setError(requestError); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const visibleCustomers = useMemo(() => {
    const rows = customers.filter((customer) => filter === "all" || customer.status === filter);
    if (sortBy === "name-asc") rows.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "name-desc") rows.sort((a, b) => b.name.localeCompare(a.name));
    return rows;
  }, [customers, filter, sortBy]);
  const selectedCustomer = customers.find((customer) => customer.id === selectedId) ?? null;

  function openUpdate() {
    if (!selectedCustomer) return;
    setForm({ name: selectedCustomer.name, phone: selectedCustomer.phone ?? "", email: selectedCustomer.email });
    setDialog("update");
    setError(null);
  }

  async function saveUpdate(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const updated = await adminApi(`/api/admin/customers/${selectedId}`, {
        method: "PATCH",
        body: JSON.stringify({ ...form, phone: form.phone || null }),
      });
      setCustomers((current) => current.map((customer) => customer.id === selectedId ? { ...customer, ...updated } : customer));
      setDialog(null);
      setMessage("Customer details updated.");
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  }

  async function toggleBlock() {
    if (!selectedCustomer) return;
    setBusy(true);
    setError(null);
    const status = selectedCustomer.status === "blocked" ? "active" : "blocked";
    try {
      await adminApi(`/api/admin/customers/${selectedId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setCustomers((current) => current.map((customer) => customer.id === selectedId ? { ...customer, status } : customer));
      setMessage(`${selectedCustomer.name} is now ${statusLabel(status).toLowerCase()}.`);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  }

  async function deleteCustomer() {
    if (!selectedCustomer) return;
    setBusy(true);
    setError(null);
    try {
      await adminApi(`/api/admin/customers/${selectedId}`, { method: "DELETE" });
      setCustomers((current) => current.filter((customer) => customer.id !== selectedId));
      setSelectedId(null);
      setDialog(null);
      setMessage("Customer deleted.");
    } catch (requestError) {
      setError(requestError);
      setDialog(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-manage admin-manage--figma">
      <div className="admin-page-heading">
        <h1>Customer Management</h1>
        <div className="admin-page-heading__tools">
          <label className="admin-compact-select"><span className="admin-visually-hidden">Filter customers</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Filter</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="blocked">Blocked</option></select><span aria-hidden="true">▽</span></label>
          <label className="admin-compact-select"><span className="admin-visually-hidden">Sort customers</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="default">Sort By</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></select><span aria-hidden="true">▾</span></label>
        </div>
      </div>

      {error && <div className="admin-api-error" role="alert"><span>{error.message}</span>{error.status === 401 && <Link to="/login" state={{ from: { pathname: "/admin/customers" } }}>Sign in</Link>}</div>}

      <div className="admin-figma-table-wrap">
        <table className="admin-figma-table">
          <thead><tr><th scope="col">Customer ID</th><th scope="col">Name</th><th scope="col">Phone</th><th scope="col">Email</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
          <tbody>
            {loading && <tr><td className="admin-figma-empty" colSpan="6">Loading customers…</td></tr>}
            {!loading && visibleCustomers.map((customer) => <tr key={customer.id} className={selectedId === customer.id ? "is-selected" : ""}>
              <td>{customer.customerId}</td><td>{customer.name}</td><td>{customer.phone || "—"}</td><td>{customer.email}</td>
              <td><span className={`admin-figma-status admin-figma-status--${customer.status}`}><span aria-hidden="true" />{statusLabel(customer.status)}</span></td>
              <td><button type="button" className="admin-figma-view" onClick={() => { setSelectedId(customer.id); setMessage(""); setError(null); }}>View</button></td>
            </tr>)}
            {!loading && !error && visibleCustomers.length === 0 && <tr><td className="admin-figma-empty" colSpan="6">No customers found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="admin-figma-actions" aria-label="Customer actions">
        <button type="button" className="admin-action admin-action--delete" disabled={!selectedCustomer || busy} onClick={() => setDialog("delete")}><span aria-hidden="true">♧</span>Delete</button>
        <button type="button" className="admin-action admin-action--update" disabled={!selectedCustomer || busy} onClick={openUpdate}><span aria-hidden="true">⇧</span>Update</button>
        <button type="button" className="admin-action admin-action--block" disabled={!selectedCustomer || busy} onClick={toggleBlock}><span aria-hidden="true">⊘</span>{selectedCustomer?.status === "blocked" ? "Unblock" : "Block"}</button>
      </div>
      <p className="admin-figma-message" role="status">{message || (selectedCustomer ? `${selectedCustomer.name} selected` : "Select View on a customer to enable actions.")}</p>

      {dialog === "update" && selectedCustomer && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setDialog(null); }}><form className="admin-modal" onSubmit={saveUpdate}>
        <button className="admin-modal__close" type="button" aria-label="Close update form" disabled={busy} onClick={() => setDialog(null)}>×</button><p className="admin-manage__eyebrow">CUSTOMER {selectedCustomer.customerId}</p><h2>Update customer</h2>
        {error && <p className="admin-modal__error" role="alert">{error.message}</p>}
        <label className="admin-form-field">Name<input required maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="admin-form-field">Phone<input maxLength="20" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
        <label className="admin-form-field">Email<input required maxLength="100" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <div className="admin-modal__actions"><button type="button" className="admin-button admin-button--secondary" disabled={busy} onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="admin-button admin-button--primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button></div>
      </form></div>}

      {dialog === "delete" && selectedCustomer && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setDialog(null); }}><section className="admin-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-customer-title">
        <button className="admin-modal__close" type="button" aria-label="Close confirmation" disabled={busy} onClick={() => setDialog(null)}>×</button><p className="admin-manage__eyebrow">CUSTOMER {selectedCustomer.customerId}</p><h2 id="delete-customer-title">Delete {selectedCustomer.name}?</h2><p className="admin-modal__note">This permanently removes the customer account. Accounts with order history cannot be deleted.</p>
        <div className="admin-modal__actions"><button type="button" className="admin-button admin-button--secondary" disabled={busy} onClick={() => setDialog(null)}>Cancel</button><button type="button" className="admin-button admin-button--danger" disabled={busy} onClick={deleteCustomer}>{busy ? "Deleting…" : "Delete customer"}</button></div>
      </section></div>}
    </main>
  );
}

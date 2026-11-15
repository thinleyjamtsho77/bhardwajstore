import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../assets/styles/admin/admin-categories.css";

// The design shows ids like CP12; the database id is just 12
const formatId = (id) => `CP${id}`;

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });
const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : "—");

// Calls the Express API. Throws an Error (with .status) carrying the server's message.
async function api(path = "", options = {}) {
  let res;
  try {
    res = await fetch(`/api/admin/categories${path}`, {
      ...options,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("Could not reach the server. Please try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.message || `Request failed (HTTP ${res.status}).`), { status: res.status });
  }
  return data;
}

const iconProps = {
  width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: "false",
};
const FilterIcon = () => (<svg {...iconProps} width="20" height="20"><path d="M3 4h18l-7 8v6l-4 2v-8z" /></svg>);
const TrashIcon = () => (<svg {...iconProps}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></svg>);
const EditIcon = () => (<svg {...iconProps}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>);

function StatusBadge({ active }) {
  return <span className={`cm-badge ${active ? "cm-badge--active" : "cm-badge--inactive"}`}>{active ? "Active" : "Inactive"}</span>;
}

function CategoryImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="cm-image cm-image--empty">No image</div>;
  return <img className="cm-image" src={src} alt={alt} onError={() => setFailed(true)} />;
}

// Native <dialog>: focus is trapped and Escape closes it
function Modal({ title, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="cm-dialog"
      aria-labelledby="cm-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose(); // click on the backdrop
      }}
    >
      <div className="cm-dialog__content">
        <h2 id="cm-dialog-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

/* ---------- Details modal: every column of the categories table ---------- */

function CategoryDetails({ category, onClose }) {
  const rows = [
    ["Category ID", formatId(category.id)],
    ["Category Name", category.name],
    ["Description", category.description || "—"],
    ["Status", <StatusBadge key="status" active={category.isActive} />],
    ["Image URL", category.imageUrl || "—"],
    ["Created", formatDate(category.createdAt)],
    ["Last updated", formatDate(category.updatedAt)],
    ["Products", category.productCount],
  ];

  return (
    <div className="cm-form">
      <CategoryImage src={category.imageUrl} alt={category.name} />

      <dl className="cm-details">
        {rows.map(([label, value]) => (
          <div key={label} className="cm-details__row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="cm-dialog__actions">
        <button type="button" className="cm-btn cm-btn--green" onClick={onClose} autoFocus>Close</button>
      </div>
    </div>
  );
}

/* ---------- Add / Edit form ---------- */

function CategoryForm({ category, onSaved, onCancel }) {
  const editing = Boolean(category);
  const [form, setForm] = useState({
    name: category?.name ?? "",
    description: category?.description ?? "",
    imageUrl: category?.imageUrl ?? "",
    isActive: category ? (category.isActive ? "1" : "0") : "1",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const setField = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const imageUrl = form.imageUrl.trim();

    if (!name) return setError("Enter a category name.");
    if (imageUrl && !/^(https?:\/\/|\/)/.test(imageUrl)) {
      return setError("Image URL must start with http://, https:// or /.");
    }

    setPending(true);
    setError("");
    try {
      const saved = await api(editing ? `/${category.id}` : "", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify({
          name,
          description: form.description.trim(),
          imageUrl,
          isActive: form.isActive === "1",
        }),
      });
      onSaved(saved, editing); // the parent closes the dialog
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  return (
    <form className="cm-form" onSubmit={handleSubmit} aria-busy={pending} noValidate>
      <div className="cm-field">
        <label htmlFor="cm-name">Category name</label>
        <input id="cm-name" value={form.name} onChange={setField("name")} maxLength={100} disabled={pending} autoFocus />
      </div>

      <div className="cm-field">
        <label htmlFor="cm-description">Description <span>(optional)</span></label>
        <textarea id="cm-description" rows={3} value={form.description} onChange={setField("description")} maxLength={2000} disabled={pending} />
      </div>

      <div className="cm-field">
        <label htmlFor="cm-image">Image URL <span>(optional)</span></label>
        <input id="cm-image" value={form.imageUrl} onChange={setField("imageUrl")} placeholder="https://… or /images/spices.jpg" maxLength={500} disabled={pending} />
      </div>

      <div className="cm-field">
        <label htmlFor="cm-status">Status</label>
        <select id="cm-status" value={form.isActive} onChange={setField("isActive")} disabled={pending}>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
        <small>Inactive categories are hidden from customers.</small>
      </div>

      {error && <p className="cm-notice cm-notice--error" role="alert">{error}</p>}

      <div className="cm-dialog__actions">
        <button type="button" className="cm-btn cm-btn--outline" onClick={onCancel} disabled={pending}>Cancel</button>
        <button type="submit" className="cm-btn cm-btn--green" disabled={pending}>
          {pending ? "Saving…" : editing ? "Save changes" : "Add category"}
        </button>
      </div>
    </form>
  );
}

/* ---------- Delete confirmation ---------- */

function DeleteConfirm({ category, onDeleted, onCancel }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setPending(true);
    setError("");
    try {
      await api(`/${category.id}`, { method: "DELETE" });
      onDeleted(category.id);
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  return (
    <div className="cm-form">
      <p>
        Delete <strong>{category.name}</strong> ({formatId(category.id)})? This can’t be undone.
      </p>
      {category.productCount > 0 && (
        <p className="cm-notice cm-notice--warn">
          This category has {category.productCount} {category.productCount === 1 ? "product" : "products"}.
          It can’t be deleted until they’re moved or removed. You can set it to inactive instead.
        </p>
      )}

      {error && <p className="cm-notice cm-notice--error" role="alert">{error}</p>}

      <div className="cm-dialog__actions">
        <button type="button" className="cm-btn cm-btn--outline" onClick={onCancel} disabled={pending}>Cancel</button>
        <button type="button" className="cm-btn cm-btn--red" onClick={handleDelete} disabled={pending}>
          {pending ? "Deleting…" : "Delete category"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

const SORTERS = {
  id: (a, b) => a.id - b.id,
  name_asc: (a, b) => a.name.localeCompare(b.name),
  name_desc: (a, b) => b.name.localeCompare(a.name),
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
};

export default function CategoryManagement() {
  const { setUser } = useAuth();
  const [categories, setCategories] = useState(null); // null until the first load finishes
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [dialog, setDialog] = useState(null); // { type: "view" | "add" | "edit" | "delete", category? }
  const [statusFilter, setStatusFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState("id");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;

    api()
      .then((data) => {
        if (!ignore) setCategories(data);
      })
      .catch((err) => {
        if (ignore) return;
        if (err.status === 401) setUser(null); // session ended, RequireAuth redirects to login
        setLoadError(err.status === 403 ? "You don’t have permission to manage categories." : err.message);
      });

    return () => {
      ignore = true;
    };
  }, [attempt, setUser]);

  const shown = useMemo(() => {
    if (!categories) return [];
    return categories
      .filter((c) => statusFilter === "" || String(Number(c.isActive)) === statusFilter)
      .sort(SORTERS[sort] ?? SORTERS.id);
  }, [categories, statusFilter, sort]);

  // Edit and Delete act on the selected row, as in the design
  const selected = shown.find((c) => c.id === selectedId) ?? null;

  const closeDialog = () => setDialog(null);

  function handleSaved(saved, wasEditing) {
    setCategories((list) =>
      wasEditing ? list.map((c) => (c.id === saved.id ? saved : c)) : [...list, saved]
    );
    setSelectedId(saved.id);
    setNotice(wasEditing ? `${saved.name} was updated.` : `${saved.name} was added.`);
    closeDialog();
  }

  function handleDeleted(id) {
    const removed = categories.find((c) => c.id === id);
    setCategories((list) => list.filter((c) => c.id !== id));
    setSelectedId(null);
    setNotice(`${removed?.name ?? "The category"} was deleted.`);
    closeDialog();
  }

  const open = (type, category) => {
    setNotice("");
    setDialog({ type, category });
  };

  return (
    <div className="cm-page">
      <div className="cm-head">
        <h1>Category Management</h1>

        <div className="cm-controls">
          <button type="button" className="cm-btn cm-btn--green cm-btn--small" onClick={() => open("add")} disabled={!categories}>
            Add Category
          </button>

          <div className="cm-filter-wrap">
            <button
              type="button"
              className="cm-pill"
              aria-expanded={filterOpen}
              aria-controls="cm-filter-panel"
              onClick={() => setFilterOpen((o) => !o)}
            >
              Filter <FilterIcon />
            </button>
            {filterOpen && (
              <div id="cm-filter-panel" className="cm-filter-panel">
                <label htmlFor="cm-filter-status">Status</label>
                <select id="cm-filter-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
                <button type="button" className="cm-btn cm-btn--outline cm-btn--small" onClick={() => setStatusFilter("")}>
                  Clear
                </button>
              </div>
            )}
          </div>

          <label className="cm-sort">
            <span className="cm-visually-hidden">Sort by</span>
            <select className="cm-pill" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="id">Sort By</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="newest">Newest first</option>
            </select>
          </label>
        </div>
      </div>

      <p className="cm-notice-region" role="status">
        {notice && <span className="cm-notice cm-notice--success">{notice}</span>}
      </p>

      <section className="cm-card" aria-label="Categories">
        {!categories && !loadError && <p className="cm-empty" role="status">Loading categories…</p>}

        {loadError && !categories && (
          <div className="cm-empty">
            <p className="cm-notice cm-notice--error" role="alert">{loadError}</p>
            <button
              type="button"
              className="cm-btn cm-btn--green cm-btn--small"
              onClick={() => { setLoadError(""); setAttempt((n) => n + 1); }}
            >
              Try again
            </button>
          </div>
        )}

        {categories && (
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr>
                  <th scope="col" className="cm-select"><span className="cm-visually-hidden">Select</span></th>
                  <th scope="col">Category ID</th>
                  <th scope="col">Category Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 && (
                  <tr><td colSpan={5} className="cm-empty">No categories found.</td></tr>
                )}
                {shown.map((c) => (
                  <tr
                    key={c.id}
                    className={selected?.id === c.id ? "cm-row--selected" : ""}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <td className="cm-select">
                      <input
                        type="radio"
                        name="selected-category"
                        aria-label={`Select ${c.name}`}
                        checked={selected?.id === c.id}
                        onChange={() => setSelectedId(c.id)}
                      />
                    </td>
                    <td>{formatId(c.id)}</td>
                    <td>{c.name}</td>
                    <td><StatusBadge active={c.isActive} /></td>
                    <td>
                      <button type="button" className="cm-view" onClick={() => open("view", c)} aria-label={`View details for ${c.name}`}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="cm-actions">
        <button
          type="button"
          className="cm-btn cm-btn--red cm-btn--wide"
          onClick={() => open("delete", selected)}
          disabled={!selected}
        >
          <TrashIcon /> Delete
        </button>
        <button
          type="button"
          className="cm-btn cm-btn--lightgreen cm-btn--wide"
          onClick={() => open("edit", selected)}
          disabled={!selected}
        >
          <EditIcon /> Edit
        </button>
      </div>
      <p className="cm-hint">
        {selected ? `Selected: ${selected.name}` : "Select a category in the table to edit or delete it."}
      </p>

      {dialog?.type === "view" && (
        <Modal title="Category details" onClose={closeDialog}>
          <CategoryDetails category={dialog.category} onClose={closeDialog} />
        </Modal>
      )}
      {dialog?.type === "add" && (
        <Modal title="Add category" onClose={closeDialog}>
          <CategoryForm onSaved={handleSaved} onCancel={closeDialog} />
        </Modal>
      )}
      {dialog?.type === "edit" && (
        <Modal title="Edit category" onClose={closeDialog}>
          <CategoryForm category={dialog.category} onSaved={handleSaved} onCancel={closeDialog} />
        </Modal>
      )}
      {dialog?.type === "delete" && (
        <Modal title="Delete category" onClose={closeDialog}>
          <DeleteConfirm category={dialog.category} onDeleted={handleDeleted} onCancel={closeDialog} />
        </Modal>
      )}
    </div>
  );
}

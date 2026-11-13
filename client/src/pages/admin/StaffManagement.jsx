import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../assets/styles/admin/admin-staff.css";

const ROLE_LABELS = { admin: "Admin", staff: "Staff" };
const STATUS_LABELS = { active: "Active", inactive: "Inactive", blocked: "Blocked" };

const sortStaff = (list) =>
  [...list].sort((a, b) =>
    a.role === b.role ? a.name.localeCompare(b.name) : a.role === "admin" ? -1 : 1
  );

// Calls the Express API. Throws an Error (with .status) carrying the server's message.
async function api(path = "", options = {}) {
  let res;
  try {
    res = await fetch(`/api/admin/staff${path}`, {
      ...options,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("Could not reach the server. Please try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.message || "Something went wrong."), { status: res.status });
  }
  return data;
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
      className="staff-dialog"
      aria-labelledby="staff-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose(); // click on the backdrop
      }}
    >
      <div className="staff-dialog__content">
        <h2 id="staff-dialog-title">{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

function AddStaffForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "staff", password: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const setField = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!name) return setError("Enter a name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (phone && !/^\+?[0-9\s-]{6,20}$/.test(phone)) return setError("Enter a valid phone number.");
    if (form.password.length < 8 || form.password.length > 72) {
      return setError("Password must be 8 to 72 characters.");
    }

    setPending(true);
    setError("");
    try {
      const created = await api("", {
        method: "POST",
        body: JSON.stringify({ name, email, phone: phone || null, role: form.role, password: form.password }),
      });
      onSaved(created); // the parent closes the dialog
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="staff-form" aria-busy={pending} noValidate>
      <div className="staff-field">
        <label htmlFor="staff-name">Full name</label>
        <input id="staff-name" value={form.name} onChange={setField("name")} maxLength={100} disabled={pending} autoFocus />
      </div>
      <div className="staff-field">
        <label htmlFor="staff-email">Email</label>
        <input id="staff-email" type="email" value={form.email} onChange={setField("email")} maxLength={100} disabled={pending} />
      </div>
      <div className="staff-field">
        <label htmlFor="staff-phone">Phone <span>(optional)</span></label>
        <input id="staff-phone" type="tel" value={form.phone} onChange={setField("phone")} maxLength={20} disabled={pending} />
      </div>
      <div className="staff-field">
        <label htmlFor="staff-role">Role</label>
        <select id="staff-role" value={form.role} onChange={setField("role")} disabled={pending}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="staff-field">
        <label htmlFor="staff-password">Temporary password</label>
        <input
          id="staff-password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={setField("password")}
          maxLength={72}
          disabled={pending}
          aria-describedby="staff-password-help"
        />
        <small id="staff-password-help">At least 8 characters. Share it with them securely.</small>
      </div>

      {error && <p className="staff-notice staff-notice--error" role="alert">{error}</p>}

      <div className="staff-actions">
        <button type="button" className="staff-btn staff-btn--secondary" onClick={onCancel} disabled={pending}>Cancel</button>
        <button type="submit" className="staff-btn" disabled={pending}>{pending ? "Adding…" : "Add staff"}</button>
      </div>
    </form>
  );
}

function EditStaffForm({ person, onSaved, onCancel }) {
  const [role, setRole] = useState(person.role);
  const [status, setStatus] = useState(person.accountStatus);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const unchanged = role === person.role && status === person.accountStatus;

  async function handleSubmit(event) {
    event.preventDefault();
    if (unchanged) return;

    // Only send what changed
    const body = {};
    if (role !== person.role) body.role = role;
    if (status !== person.accountStatus) body.accountStatus = status;

    setPending(true);
    setError("");
    try {
      onSaved(await api(`/${person.id}`, { method: "PATCH", body: JSON.stringify(body) }));
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="staff-form" aria-busy={pending}>
      <p className="staff-summary"><strong>{person.name}</strong><br />{person.email}</p>

      <div className="staff-field">
        <label htmlFor="edit-role">Role</label>
        <select id="edit-role" value={role} onChange={(e) => setRole(e.target.value)} disabled={pending}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        {role === "admin" && role !== person.role && (
          <small>Admins can manage other staff accounts and roles.</small>
        )}
      </div>

      <div className="staff-field">
        <label htmlFor="edit-status">Account status</label>
        <select id="edit-status" value={status} onChange={(e) => setStatus(e.target.value)} disabled={pending}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {error && <p className="staff-notice staff-notice--error" role="alert">{error}</p>}

      <div className="staff-actions">
        <button type="button" className="staff-btn staff-btn--secondary" onClick={onCancel} disabled={pending}>Cancel</button>
        <button type="submit" className="staff-btn" disabled={pending || unchanged}>{pending ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}

function DeleteStaffConfirm({ person, onDeleted, onCancel }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setPending(true);
    setError("");
    try {
      await api(`/${person.id}`, { method: "DELETE" });
      onDeleted(person.id);
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  return (
    <div className="staff-form">
      <p>
        Delete <strong>{person.name}</strong> ({person.email})? They will lose access immediately.
        This can’t be undone.
      </p>

      {error && <p className="staff-notice staff-notice--error" role="alert">{error}</p>}

      <div className="staff-actions">
        <button type="button" className="staff-btn staff-btn--secondary" onClick={onCancel} disabled={pending}>Cancel</button>
        <button type="button" className="staff-btn staff-btn--danger" onClick={handleDelete} disabled={pending}>
          {pending ? "Deleting…" : "Delete account"}
        </button>
      </div>
    </div>
  );
}

export default function StaffManagement() {
  const { user, setUser } = useAuth();
  const isAdmin = user?.role === "admin";
  const [staff, setStaff] = useState(null); // null until the first load finishes
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null);
  const [dialog, setDialog] = useState(null); // { type: "add" | "edit" | "delete", person? }

  useEffect(() => {
    // Staff can open this page, but only admins should request its data.
    if (!isAdmin) return;

    let ignore = false;

    api()
      .then((data) => {
        if (!ignore) setStaff(sortStaff(data));
      })
      .catch((err) => {
        if (ignore) return;
        if (err.status === 401) setUser(null);
        setLoadError(
          err.status === 403 ? "Only administrators can manage staff accounts." : err.message
        );
      });

    return () => {
      ignore = true;
    };
  }, [isAdmin, user?.id, setUser]);

  if (!isAdmin) {
    return (
      <div className="staff-page">
        <div className="staff-access-box">
            <h1>Staff Management</h1>
            <p role="alert">Only admin can view this feature.</p>
        </div>
      </div>
    );
  }

  const closeDialog = () => setDialog(null);

  function handleCreated(created) {
    setStaff((list) => sortStaff([...list, created]));
    setNotice({ type: "success", text: `${created.name} was added as ${ROLE_LABELS[created.role]}.` });
    closeDialog();
  }

  function handleUpdated(updated) {
    setStaff((list) => sortStaff(list.map((p) => (p.id === updated.id ? updated : p))));
    setNotice({ type: "success", text: `${updated.name} was updated.` });
    closeDialog();
  }

  function handleDeleted(id) {
    const removed = staff.find((p) => p.id === id);
    setStaff((list) => list.filter((p) => p.id !== id));
    setNotice({ type: "success", text: `${removed?.name ?? "The account"} was deleted.` });
    closeDialog();
  }

  return (
    <div className="staff-page">
      <div className="staff-page__head">
        <h1>Staff Management</h1>
        <button
          type="button"
          className="staff-btn"
          onClick={() => {
            setNotice(null);
            setDialog({ type: "add" });
          }}
          disabled={!staff}
        >
          Add staff
        </button>
      </div>

      <p className="staff-notice-region" role="status">
        {notice && <span className={`staff-notice staff-notice--${notice.type}`}>{notice.text}</span>}
      </p>

      <section className="staff-panel" aria-label="Staff accounts">
        {!staff && !loadError && <p className="staff-empty" role="status">Loading staff…</p>}
        {loadError && !staff && <p className="staff-notice staff-notice--error" role="alert">{loadError}</p>}

        {staff && (
          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="staff-visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 && (
                  <tr><td colSpan={6} className="staff-empty">No staff accounts yet.</td></tr>
                )}
                {staff.map((person) => {
                  const isYou = person.id === user?.id;
                  return (
                    <tr key={person.id}>
                      <td>
                        {person.name}
                        {isYou && <span className="staff-you">You</span>}
                      </td>
                      <td>{person.email}</td>
                      <td>{person.phone || "—"}</td>
                      <td>
                        <span className={`staff-badge staff-badge--${person.role}`}>{ROLE_LABELS[person.role]}</span>
                      </td>
                      <td>
                        <span className={`staff-status staff-status--${person.accountStatus}`}>
                          {STATUS_LABELS[person.accountStatus]}
                        </span>
                      </td>
                      <td className="staff-row-actions">
                        <button
                          type="button"
                          className="staff-btn staff-btn--small staff-btn--secondary"
                          onClick={() => { setNotice(null); setDialog({ type: "edit", person }); }}
                          disabled={isYou}
                          aria-label={`Edit ${person.name}`}
                          title={isYou ? "You can't change your own role" : undefined}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="staff-btn staff-btn--small staff-btn--danger-outline"
                          onClick={() => { setNotice(null); setDialog({ type: "delete", person }); }}
                          disabled={isYou}
                          aria-label={`Delete ${person.name}`}
                          title={isYou ? "You can't delete your own account" : undefined}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {dialog?.type === "add" && (
        <Modal title="Add staff account" onClose={closeDialog}>
          <AddStaffForm onSaved={handleCreated} onCancel={closeDialog} />
        </Modal>
      )}
      {dialog?.type === "edit" && (
        <Modal title="Edit staff account" onClose={closeDialog}>
          <EditStaffForm person={dialog.person} onSaved={handleUpdated} onCancel={closeDialog} />
        </Modal>
      )}
      {dialog?.type === "delete" && (
        <Modal title="Delete staff account" onClose={closeDialog}>
          <DeleteStaffConfirm person={dialog.person} onDeleted={handleDeleted} onCancel={closeDialog} />
        </Modal>
      )}
    </div>
  );
}

const API = "http://localhost:5000/api";

async function request(path, options) {
  const res = await fetch(`${API}${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Something went wrong");
  return body;
}

export const getCategories = () => request("/categories");

export const getProducts = (params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
  return request(`/catalog?${new URLSearchParams(clean)}`);
};

export const getProduct = (id) => request(`/catalog/${id}`);
export const getAdminProducts = () => request("/catalog/admin/list");

export const saveProduct = (product, id) =>
  request(`/catalog/admin${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

export const deleteProduct = (id) => request(`/catalog/admin/${id}`, { method: "DELETE" });
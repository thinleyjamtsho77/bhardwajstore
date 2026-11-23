import { useMemo, useState } from "react";
import { Link } from "react-router";
import riceImage from "../assets/images/351533443_ef9d3cfd-da03-4945-ace8-e7958356074f.jpg";
import coconutImage from "../assets/images/5668951_58216.jpg";
import "../assets/styles/wishlist.css";

const initialItems = [
  { id: 1, name: "Organic Basmati Rice 5kg", price: 12.99, stock: true, image: riceImage },
  { id: 2, name: "Organic Coconut Oil 5L", price: 21.99, stock: false, image: coconutImage },
];

export default function WishlistPage() {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const visibleItems = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  function submitSearch(event) {
    event.preventDefault();
    setSearch(query.trim());
  }

  function removeItem(id) {
    setItems((current) => current.filter((item) => item.id !== id));
    setNotice("Item removed from your wishlist.");
  }

  return (
    <main className="wishlist-page">
      <nav className="wishlist-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span aria-hidden="true">&gt;</span>
        <Link to="/profile">Profile</Link><span aria-hidden="true">&gt;</span>
        <span aria-current="page">Wishlist</span>
      </nav>

      <form className="wishlist-search" onSubmit={submitSearch} role="search">
        <label className="wishlist-visually-hidden" htmlFor="wishlist-query">Search wishlist</label>
        <input id="wishlist-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Wishlist" />
        <button type="submit">Search</button>
      </form>

      {notice && <p className="wishlist-notice" role="status">{notice}</p>}

      <ul className="wishlist-items">
        {visibleItems.map((item) => (
          <li className="wishlist-item" key={item.id}>
            <img className="wishlist-item__image" src={item.image} alt={item.name} />
            <div className="wishlist-item__details">
              <h1>{item.name}</h1>
              <p className={`wishlist-stock ${item.stock ? "is-in-stock" : "is-out-of-stock"}`}>
                <span aria-hidden="true" />{item.stock ? "In Stock" : "Out of Stock"}
              </p>
              <div className="wishlist-item__actions">
                {item.stock ? (
                  <button className="wishlist-button wishlist-button--primary" type="button" onClick={() => setNotice(`${item.name} is ready to move to your cart when wishlist data is connected.`)}>
                    Move to Cart
                  </button>
                ) : (
                  <button className="wishlist-button" type="button" onClick={() => setNotice(`We’ll notify you when ${item.name} is back in stock.`)}>
                    Notify Me
                  </button>
                )}
                <Link className="wishlist-button" to="/all-products">View Product</Link>
              </div>
            </div>
            <p className="wishlist-item__price">${item.price.toFixed(2)}</p>
            <button className="wishlist-item__remove" type="button" aria-label={`Remove ${item.name} from wishlist`} onClick={() => removeItem(item.id)}>×</button>
          </li>
        ))}
      </ul>

      {visibleItems.length === 0 && <p className="wishlist-empty">No wishlist items match your search.</p>}

      <nav className="wishlist-pagination" aria-label="Wishlist pages">
        <button type="button" disabled>&lt; Previous</button>
        <button type="button" className="is-current" aria-current="page">1</button>
        <button type="button" disabled>2</button>
        <button type="button" disabled>Next</button>
        <span aria-hidden="true">&gt;</span>
      </nav>
    </main>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getProduct } from "../api/catalogApi";
import "../assets/styles/products.css";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    setProduct(null);
    setError("");
    getProduct(id).then(setProduct).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="detail-message">
        <p>{error}</p>
        <Link to="/products">Back to products</Link>
      </div>
    );
  }
  if (!product) return <p className="detail-message">Loading...</p>;

  const size = product.sizeValue ? `${Number(product.sizeValue)}${product.sizeUnit || ""}` : "";
  const outOfStock = product.stock === 0;

  return (
    <div className="detail">
      <div className="detail-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="no-image big">No image</div>
        )}
      </div>

      <div className="detail-info">
        <p className="breadcrumb">
          <Link to="/products">Products</Link> / {product.categoryName}
        </p>
        <h2>{product.name}</h2>
        {product.brand && <p className="muted">Brand: {product.brand}</p>}
        <h3>₹{Number(product.price)}{size && `/${size}`}</h3>
        <p>{product.description}</p>

        <p className={outOfStock ? "out" : "in-stock"}>
          {outOfStock ? "Out of stock" : `In stock (${product.stock} available)`}
        </p>

        <p>Quantity</p>
        <div className="qty">
          <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
          <span>{qty}</span>
          <button onClick={() => setQty(Math.min(product.stock || 1, qty + 1))}>+</button>
        </div>

        <button className="primary" disabled={outOfStock}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
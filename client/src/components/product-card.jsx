
export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-image-placeholder">
        Product Image
      </div>

      <div className="product-info">
        <strong>{product.name}</strong>
        <strong>${product.price.toFixed(2)}</strong>
      </div>

      <span className="stock-label">{product.stock}</span>

      <div className="product-actions">
        <button
          type="button"
          className="wishlist-button"
          title="Add to Wishlist"
          aria-label={`Add ${product.name} to wishlist`}
        >
          ♡
        </button>

        <button
          type="button"
          className="add-cart-button"
          title="Add to Cart"
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

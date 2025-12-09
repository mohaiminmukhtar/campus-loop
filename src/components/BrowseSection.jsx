import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaHeart, FaShoppingCart, FaEye, FaFilter, FaTimes } from "react-icons/fa";
import "../styles/BrowseSection.css";

export default function BrowseSection() {
  const { products, addToCart, addToFavorites, removeFromFavorites, isFavorite } = useProducts();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    let result = [...products];

    // Filter out bid products (they go to Live Hunting page)
    result = result.filter(p => !p.bidding_enabled && !p.biddingenabled);

    // Apply price filter
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return new Date(b.datePosted || b.createdAt || 0) - new Date(a.datePosted || a.createdAt || 0);
        case "oldest":
          return new Date(a.datePosted || a.createdAt || 0) - new Date(b.datePosted || b.createdAt || 0);
        default:
          return 0;
      }
    });

    // Limit to 8 products for home page
    setFilteredProducts(result.slice(0, 8));
  }, [products, sortBy, priceRange]);

  const ProductCard = ({ product }) => {
    const isFav = isFavorite(product.id);

    return (
      <div className="browse-product-card">
        <Link to={`/product/${product.id}`} className="browse-product-link">
          {/* Product Image */}
          <div className="browse-product-image-container">
            <img
              src={product.image_url || product.image || "/logo.PNG"}
              alt={product.title}
              className="browse-product-image"
            />
          </div>

          {/* Favorite Button */}
          {isAuthenticated && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isFav) {
                  removeFromFavorites(product.id);
                } else {
                  addToFavorites(product);
                }
              }}
              className={`browse-product-favorite-button ${isFav ? 'active' : ''}`}
            >
              <FaHeart style={{ fill: isFav ? "#FF6A2A" : "none" }} />
            </button>
          )}

          {/* Product Info */}
          <div className="browse-product-info">
            <h3 className="browse-product-title">
              {product.title}
            </h3>
            <p className="browse-product-description">
              {product.description}
            </p>

            <div className="browse-product-price-row">
              <div>
                <span className="browse-product-price">PKR {product.price}</span>
              </div>
              <div className="browse-product-views">
                <FaEye /> {product.views || 0}
              </div>
            </div>

            <div className="browse-product-tags">
              <span className="browse-product-tag browse-product-tag-condition">
                {product.condition}
              </span>
              <span className="browse-product-tag browse-product-tag-location">
                {product.location}
              </span>
            </div>

            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isAuthenticated) {
                  const result = await addToCart(product);
                  if (result.success) {
                    showToast(result.message, 'success');
                  } else {
                    showToast(result.message, 'error');
                  }
                } else {
                  showToast('Please login to add items to cart', 'error');
                }
              }}
              className="browse-product-add-cart-button"
            >
              <FaShoppingCart /> Add to Cart
            </button>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <section className="browse-section">
      <div className="browse-container">
        {/* Section Header */}
        <div className="browse-header">
          <div>
            <h2 className="browse-title">
              Browse Products
            </h2>
            <p className="browse-subtitle">
              {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"} found
            </p>
          </div>

          {/* Filter Bar */}
          <div className="browse-filter-bar">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="browse-sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`browse-filter-button ${showFilters ? 'active' : ''}`}
            >
              <FaFilter /> Filters
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="browse-filters-panel"
              >
                <div className="browse-filters-header">
                  <h3 className="browse-filters-title">Price Range</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="browse-filters-close"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="browse-filters-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min || ""}
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                    className="browse-filters-input"
                  />
                  <span className="browse-filters-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max || ""}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 100000 })}
                    className="browse-filters-input"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="browse-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <p style={{ fontSize: "1.2rem", color: "#2B2B2C", opacity: "0.7", marginBottom: "1rem" }}>No products available yet</p>
            {isAuthenticated && (
              <Link
                to="/sell"
                style={{
                  display: "inline-block",
                  padding: "1rem 2rem",
                  background: "#FF6A2A",
                  color: "#fff",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: 700,
                  boxShadow: "0 0 20px rgba(255, 106, 42, 0.4), 0 0 40px rgba(255, 106, 42, 0.2)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 106, 42, 0.6), 0 0 60px rgba(255, 106, 42, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 106, 42, 0.4), 0 0 40px rgba(255, 106, 42, 0.2)";
                }}
              >
                List Your First Item
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}


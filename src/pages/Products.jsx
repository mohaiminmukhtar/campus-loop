import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaSearch, FaHeart, FaShoppingCart, FaFilter, FaTimes, FaEye, FaExchangeAlt, FaHandshake, FaTshirt, FaPlug, FaGift, FaCouch, FaLaptopCode, FaCrown } from "react-icons/fa";
import "../styles/Products.css";

const CATEGORIES = [
  { value: "rentals", label: "Rentals", icon: <FaExchangeAlt /> },
  { value: "barter", label: "Barter", icon: <FaHandshake /> },
  { value: "fashion", label: "Fashion", icon: <FaTshirt /> },
  { value: "electronics", label: "Electronics", icon: <FaPlug /> },
  { value: "free-for-all", label: "Free for All", icon: <FaGift /> },
  { value: "furniture", label: "Furniture", icon: <FaCouch /> },
  { value: "digital-services", label: "Digital Services", icon: <FaLaptopCode /> },
];

export default function Products() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const urlSearch = searchParams.get("search");
  const { products, addToCart, addToFavorites, removeFromFavorites, isFavorite, searchProducts } = useProducts();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState(urlSearch || "");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(category || "");

  // Update search query when URL param changes
  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  // Update selected category when URL param changes
  useEffect(() => {
    setSelectedCategory(category || "");
  }, [category]);

  useEffect(() => {
    let result = selectedCategory 
      ? products.filter(p => p.category === selectedCategory)
      : products;

    // Filter out bid products (they go to Live Hunting page)
    result = result.filter(p => !p.bidding_enabled && !p.biddingenabled);

    // Apply search
    if (searchQuery) {
      result = searchProducts(searchQuery);
      if (selectedCategory) {
        result = result.filter(p => p.category === selectedCategory);
      }
      // Filter out bids from search results too
      result = result.filter(p => !p.bidding_enabled && !p.biddingenabled);
    }

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
          return new Date(b.dateposted) - new Date(a.dateposted);
        case "oldest":
          return new Date(a.dateposted) - new Date(b.dateposted);
        default:
          return 0;
      }
    });

    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery, sortBy, priceRange, searchProducts]);

  const ProductCard = ({ product }) => {
    const isFav = isFavorite(product.id);
    const isOwner = user && product.owner_id === user.id;

    const handleAddToCart = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const result = await addToCart(product);
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="product-card"
      >
        <Link to={`/product/${product.id}`} className="product-card-link">
          {/* Product Image */}
          <div className="product-image-container">
            <img
              src={product.image_url || product.image || "/logo.PNG"}
              alt={product.title}
              className="product-image"
            />
            {isOwner && (
              <div className="product-owner-badge">
                <FaCrown /> Your Product
              </div>
            )}
          </div>

          {/* Favorite Button */}
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
            className={`product-favorite-button ${isFav ? 'active' : ''}`}
          >
            <FaHeart style={{ fill: isFav ? "#FF6A2A" : "none" }} />
          </button>

          {/* Product Info */}
          <div className="product-info">
            <h3 className="product-title">
              {product.title}
            </h3>
            <p className="product-description">
              {product.description}
            </p>

            <div className="product-price-row">
              <div>
                <span className="product-price">
                  PKR {product.price}
                </span>
              </div>
              <div className="product-views">
                <FaEye /> {product.views || 0}
              </div>
            </div>

            <div className="product-tags">
              <span className="product-tag product-tag-condition">
                {product.condition}
              </span>
              <span className="product-tag product-tag-location">
                {product.location}
              </span>
            </div>

            <div className="product-actions">
              {!isOwner ? (
                <button
                  onClick={handleAddToCart}
                  className="product-add-cart-button"
                >
                  <FaShoppingCart /> Add to Cart
                </button>
              ) : (
                <div className="product-owner-label">
                  Your Listing
                </div>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="products-page">
      <div className="products-container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="products-header">
          <h1 className="products-title">
            {selectedCategory ? `Browse ${CATEGORIES.find(c => c.value === selectedCategory)?.label || selectedCategory}` : "Browse All Products"}
          </h1>
          <p className="products-subtitle">
            {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"} found
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="products-filter-bar">
          {/* Search */}
          <div className="products-search-container">
            <FaSearch className="products-search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="products-search-input"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="products-sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`products-filter-button ${showFilters ? 'active' : ''}`}
          >
            <FaFilter /> Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="products-filters-panel"
          >
            <div className="products-filters-header">
              <h3 className="products-filters-title">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="products-filters-close">
                <FaTimes />
              </button>
            </div>

            {/* Category Filter */}
            <div className="products-filters-section">
              <h4 className="products-filters-subtitle">Category</h4>
              <div className="products-category-filters">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`products-category-chip ${selectedCategory === "" ? 'active' : ''}`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`products-category-chip ${selectedCategory === cat.value ? 'active' : ''}`}
                  >
                    <span className="products-category-icon">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="products-filters-section">
              <h4 className="products-filters-subtitle">Price Range</h4>
              <div className="products-filters-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                  className="products-filters-input"
                />
                <span className="products-filters-separator">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 100000 })}
                  className="products-filters-input"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="products-empty">
            <p className="products-empty-text">No products found</p>
            {isAuthenticated && (
              <Link to="/sell" className="products-empty-link">
                List Your First Item
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


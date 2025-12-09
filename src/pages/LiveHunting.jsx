import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { FaGavel, FaFire, FaEye, FaHeart, FaShoppingBag } from "react-icons/fa";
import "../styles/LiveHunting.css";

export default function LiveHunting() {
  const { products, addToFavorites, removeFromFavorites, isFavorite } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayProducts, setDisplayProducts] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Filter only products with bidding enabled
    let filtered = products.filter(p => p.bidding_enabled || p.biddingenabled);
    
    // Sort based on filter
    if (filter === "recent") {
      filtered = filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (filter === "popular") {
      filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      filtered = filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    
    setDisplayProducts(filtered);
  }, [products, filter]);



  const ProductCard = ({ product }) => {
    const isFav = isFavorite(product.id);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="auction-card"
        onClick={() => navigate(`/product/${product.id}`)}
        style={{ cursor: 'pointer' }}
      >
        {/* Image Section */}
        <div className="auction-image-wrapper">
          <img
            src={product.image_url || product.image || "/logo.PNG"}
            alt={product.title}
            className="auction-image"
          />
          
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isFav) {
                removeFromFavorites(product.id);
              } else {
                addToFavorites(product);
              }
            }}
            className={`auction-favorite-btn ${isFav ? 'active' : ''}`}
          >
            <FaHeart />
          </button>
        </div>

        {/* Content Section */}
        <div className="auction-content">
          <h3 className="auction-title">{product.title}</h3>
          
          {/* Price */}
          <div className="auction-price">
            <span className="auction-price-label">Price</span>
            <span className="auction-price-amount">PKR {product.price}</span>
          </div>

          {/* Category */}
          <div className="auction-category">
            <FaShoppingBag /> {product.category || 'General'}
          </div>

          {/* Views */}
          <div className="auction-views">
            <FaEye /> {product.views || 0} views
          </div>
        </div>

        {/* Bidding Coming Soon Badge */}
        <div className="auction-coming-soon-badge">
          <FaGavel /> Bidding Coming Soon
        </div>
      </motion.div>
    );
  };

  return (
    <div className="live-hunting-page">
      <div className="live-hunting-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="live-hunting-header"
        >
          <div className="header-icon-wrapper">
            <FaGavel className="header-icon" />
          </div>
          <h1 className="live-hunting-title">
            <span className="title-live">Live</span>
            <span className="title-hunting">Hunting</span>
          </h1>
          <p className="live-hunting-subtitle">
            <FaFire /> Browse exclusive items
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="filter-tabs"
        >
          <button
            onClick={() => setFilter("all")}
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
          >
            <FaShoppingBag /> All Products
          </button>
          <button
            onClick={() => setFilter("recent")}
            className={`filter-tab ${filter === "recent" ? "active" : ""}`}
          >
            <FaFire /> Recent
          </button>
          <button
            onClick={() => setFilter("popular")}
            className={`filter-tab ${filter === "popular" ? "active" : ""}`}
          >
            <FaEye /> Popular
          </button>
        </motion.div>

        {/* Product Grid */}
        {displayProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="auction-grid"
          >
            {displayProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="no-auctions"
          >
            <FaGavel className="no-auctions-icon" />
            <h3 className="no-auctions-title">No Bidding Products Available</h3>
            <p className="no-auctions-text">Products with bidding enabled will appear here!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

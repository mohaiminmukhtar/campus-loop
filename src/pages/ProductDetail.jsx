import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Bidding from "../components/Bidding";
import { FaHeart, FaShoppingCart, FaArrowLeft, FaUser, FaStar, FaEye, FaWhatsapp, FaGavel, FaCrown } from "react-icons/fa";
import "../styles/ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, addToFavorites, removeFromFavorites, isFavorite } = useProducts();
  const { user } = useAuth();
  const { showToast } = useToast();
  const product = products.find((p) => p.id === parseInt(id));

  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    const result = await addToCart(product);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  if (!product) {
    return (
      <div className="product-detail-page" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem'
      }}>
        <h2 style={{ fontSize: "1.5rem", color: "#2B2B2C" }}>Loading...</h2>
      </div>
    );
  }

  const isFav = isFavorite(product.id);
  const isOwner = user && product.owner_id === user.id;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="product-detail-back-button"
        >
          <FaArrowLeft /> Back
        </motion.button>

        <div className="product-detail-grid">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="product-detail-image-card"
          >
            <div className="product-detail-image-wrapper">
              <img
                src={imageError ? "/logo.PNG" : product.image_url || product.image || "/logo.PNG"}
                alt={product.title}
                onError={() => setImageError(true)}
                className="product-detail-image"
              />
              {isOwner && (
                <div className="product-detail-owner-overlay">
                  <FaCrown /> Your Product
                </div>
              )}
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="product-detail-info-card"
          >
            <div className="product-detail-header">
              <div style={{ flex: 1 }}>
                <h1 className="product-detail-title">
                  {product.title}
                </h1>
                <div className="product-detail-tags">
                  <span className="product-detail-tag product-detail-tag-condition">
                    {product.condition}
                  </span>
                  <span className="product-detail-tag product-detail-tag-location">
                    {product.location}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isFav) {
                    removeFromFavorites(product.id);
                  } else {
                    addToFavorites(product);
                  }
                }}
                className={`product-detail-favorite-button ${isFav ? 'active' : ''}`}
              >
                <FaHeart style={{ fill: isFav ? "#fff" : "none" }} />
              </button>
            </div>

            <div className="product-detail-price-section">
              {product.biddingenabled ? (
                <div className="product-detail-bidding-info">
                  <div className="product-detail-bidding-badge">
                    <FaGavel style={{ color: "#FF6A2A" }} />
                    <span className="product-detail-bidding-label">Auction Item</span>
                  </div>
                  <div className="product-detail-bidding-text">
                    Starting Bid: PKR {product.startingbid || product.price}
                  </div>
                  <div className="product-detail-bidding-current">
                    Current Bid: PKR {product.currentbid || product.startingbid || product.price}
                  </div>
                </div>
              ) : (
                <div className="product-detail-price">
                  PKR {product.price}
                </div>
              )}
              <p className="product-detail-description">
                {product.description}
              </p>
            </div>

            {/* Seller Info */}
            <div className="product-detail-seller-card">
              <div className="product-detail-seller-header">
                <div className="product-detail-seller-avatar">
                  <FaUser />
                </div>
                <div className="product-detail-seller-info">
                  <div className="product-detail-seller-label">Seller</div>
                  <div className="product-detail-seller-id">{product.seller}</div>
                </div>
                <div className="product-detail-seller-rating">
                  <FaStar /> {product.sellerRating || 5.0}
                </div>
              </div>
              {!isOwner && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a
                    href={`https://wa.me/?text=Hi, I'm interested in ${product.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "#25D366",
                      color: "#fff",
                      borderRadius: "10px",
                      textAlign: "center",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      fontWeight: 600,
                    }}
                  >
                    <FaWhatsapp /> Contact Seller
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!product.biddingenabled && (
              <div className="product-detail-actions">
                {!isOwner ? (
                  <button
                    onClick={handleAddToCart}
                    className="product-detail-button product-detail-button-primary"
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                ) : (
                  <div className="product-detail-owner-badge">
                    <FaCrown /> This is your listing
                  </div>
                )}
              </div>
            )}

            {/* Product Info */}
            <div className="product-detail-meta" style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(255, 106, 42, 0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaEye /> {product.views || 0} views
              </div>
              <div>Posted: {new Date(product.dateposted).toLocaleDateString()}</div>
            </div>
          </motion.div>
        </div>

        {/* Bidding Section */}
        {product.biddingenabled && <Bidding product={product} />}
      </div>
    </div>
  );
}


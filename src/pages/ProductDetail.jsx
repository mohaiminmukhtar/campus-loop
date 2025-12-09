import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Bidding from "../components/Bidding";
import { FaHeart, FaShoppingCart, FaArrowLeft, FaUser, FaStar, FaEye, FaWhatsapp, FaGavel, FaCrown, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, addToFavorites, removeFromFavorites, isFavorite, deleteProduct } = useProducts();
  const { user } = useAuth();
  const { showToast } = useToast();
  const product = products.find((p) => p.id === parseInt(id));

  const [imageError, setImageError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleAddToCart = async () => {
    const result = await addToCart(product);
    if (result.success) {
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleDelete = async () => {
    const result = await deleteProduct(product.id);
    if (result.success) {
      showToast(result.message, 'success');
      setTimeout(() => navigate('/products'), 1000);
    } else {
      showToast(result.message, 'error');
    }
    setShowDeleteConfirm(false);
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
            <div className="product-detail-actions">
              {!isOwner ? (
                !product.biddingenabled && (
                  <button
                    onClick={handleAddToCart}
                    className="product-detail-button product-detail-button-primary"
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="product-detail-owner-badge">
                    <FaCrown /> This is your listing
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => showToast('Edit functionality coming soon!', 'info')}
                      style={{
                        flex: 1,
                        padding: '0.875rem 1.5rem',
                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{
                        flex: 1,
                        padding: '0.875rem 1.5rem',
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>

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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#2B2B2C' }}>
              Delete Product?
            </h3>
            <p style={{ color: '#2B2B2C', opacity: 0.7, marginBottom: '2rem' }}>
              Are you sure you want to delete "{product.title}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: '#f5f5f5',
                  color: '#2B2B2C',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


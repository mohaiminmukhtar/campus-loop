import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaHeart, FaTrash, FaShoppingCart, FaEye } from "react-icons/fa";
import "../styles/Wishlist.css";

export default function Wishlist() {
  const { favorites, removeFromFavorites, addToCart, refreshFavorites } = useProducts();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Refresh favorites when page loads
  useEffect(() => {
    if (refreshFavorites) {
      refreshFavorites();
    }
  }, [refreshFavorites]);

  if (favorites.length === 0) {
    return (
      <div
        style={{
          minHeight: "80vh",
          padding: "8rem 2rem 4rem",
          background: "#FFFFFF",
          backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255, 106, 42, 0.03) 0%, transparent 70%)",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: "5rem",
              color: "#FF6A2A",
              marginBottom: "2rem",
              filter: "drop-shadow(0 0 20px rgba(255, 106, 42, 0.5))",
            }}
          >
            <FaHeart />
          </motion.div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: "#FF6A2A",
              marginBottom: "1rem",
            }}
          >
            Your Wishlist is Empty
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "#2B2B2C",
              opacity: "0.7",
              marginBottom: "2rem",
            }}
          >
            Start saving items you love for later!
          </p>
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "1rem 2rem",
              background: "#FF6A2A",
              color: "#fff",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "1.1rem",
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
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "80vh",
        padding: "8rem 2rem 4rem",
        background: "#FFFFFF",
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255, 106, 42, 0.03) 0%, transparent 70%)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: "3rem" }}
        >
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #FF6A2A, #F08A34)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1rem",
              filter: "drop-shadow(0 0 8px rgba(255, 106, 42, 0.4))",
            }}
          >
            My Wishlist
          </h1>
          <p style={{ fontSize: "1.2rem", color: "#2B2B2C", opacity: "0.7" }}>
            {favorites.length} {favorites.length === 1 ? "item" : "items"} saved for later
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem",
          }}
        >
          {favorites.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -5 }}
              style={{
                background: "#F2F2F4",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid rgba(255, 106, 42, 0.2)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1), 0 0 10px rgba(255, 106, 42, 0.15)",
                position: "relative",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 106, 42, 0.4)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.15), 0 0 20px rgba(255, 106, 42, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 106, 42, 0.2)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1), 0 0 10px rgba(255, 106, 42, 0.15)";
              }}
            >
              {/* Wishlist Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromFavorites(product.id);
                }}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#F2F2F4",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 106, 42, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1), 0 0 8px rgba(255, 106, 42, 0.15)",
                  color: "#FF6A2A",
                  fontSize: "1.2rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FF6A2A";
                  e.currentTarget.style.borderColor = "#FF6A2A";
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 106, 42, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F2F2F4";
                  e.currentTarget.style.borderColor = "rgba(255, 106, 42, 0.3)";
                  e.currentTarget.style.color = "#FF6A2A";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1), 0 0 8px rgba(255, 106, 42, 0.15)";
                }}
              >
                <FaTrash />
              </button>

              {/* Product Image */}
              <div
                style={{
                  width: "100%",
                  height: "250px",
                  overflow: "hidden",
                  background: "#FFFFFF",
                }}
              >
                <img
                  src={product.image || "/logo.PNG"}
                  alt={product.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Product Info */}
              <div style={{ padding: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "#2B2B2C",
                    marginBottom: "0.5rem",
                    lineHeight: "1.4",
                  }}
                >
                  {product.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#2B2B2C",
                    opacity: "0.7",
                    marginBottom: "1rem",
                    lineHeight: "1.5",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {product.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        color: "#FF6A2A",
                      }}
                    >
                      PKR {product.price}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <FaEye style={{ color: "#2B2B2C", opacity: "0.7", fontSize: "0.9rem" }} />
                    <span style={{ fontSize: "0.9rem", color: "#2B2B2C", opacity: "0.7" }}>
                      {product.views || 0}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: "rgba(255, 106, 42, 0.15)",
                      color: "#FF6A2A",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      border: "1px solid rgba(255, 106, 42, 0.3)",
                    }}
                  >
                    {product.condition}
                  </span>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: "#FFFFFF",
                      color: "#2B2B2C",
                      opacity: "0.7",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      border: "1px solid rgba(255, 106, 42, 0.1)",
                    }}
                  >
                    {product.location}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const result = await addToCart(product);
                      if (result.success) {
                        showToast(result.message, 'success');
                      } else {
                        showToast(result.message, 'error');
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "#FF6A2A",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      boxShadow: "0 0 20px rgba(255, 106, 42, 0.4), 0 0 40px rgba(255, 106, 42, 0.2)",
                      transition: "all 0.3s ease",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FaShoppingCart />
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


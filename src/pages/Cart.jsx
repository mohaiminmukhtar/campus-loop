import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { FaTrash, FaShoppingCart, FaArrowLeft, FaMinus, FaPlus } from "react-icons/fa";
import "../styles/Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartItemCount } = useProducts();

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="cart-empty-content">
          <div className="cart-empty-icon">
            <FaShoppingCart />
          </div>
          <h1 className="cart-empty-title">Your Cart is Empty</h1>
          <p className="cart-empty-text">Start adding items to your cart!</p>
          <Link to="/products" className="cart-empty-link">
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="cart-header">
          <div>
            <h1 className="cart-title">
              Shopping Cart
            </h1>
            <p className="cart-subtitle">{cartItemCount} {cartItemCount === 1 ? "item" : "items"} in your cart</p>
          </div>
          <button onClick={() => navigate(-1)} className="cart-back-button">
            <FaArrowLeft /> Continue Shopping
          </button>
        </motion.div>

        <div className="cart-grid">
          {/* Cart Items */}
          <div>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="cart-item-card"
              >
                <div className="cart-item">
                  <Link to={`/product/${item.id}`} className="cart-item-image-link">
                    <div className="cart-item-image-wrapper">
                      <img src={item.image_url || item.image || "/logo.PNG"} alt={item.title} className="cart-item-image" />
                    </div>
                  </Link>
                  <div className="cart-item-content">
                    <Link to={`/product/${item.id}`} className="cart-item-title-link">
                      <h3 className="cart-item-title">{item.title}</h3>
                    </Link>
                    <p className="cart-item-meta">{item.condition} • {item.location}</p>
                    
                    <div className="cart-item-actions">
                      <div>
                        <div className="cart-item-price">
                          PKR {item.price}
                        </div>
                        <div className="cart-item-quantity">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="cart-quantity-button"
                          >
                            <FaMinus />
                          </button>
                          <span className="cart-quantity-value">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="cart-quantity-button"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(item.id);
                          window.location.reload();
                        }}
                        className="cart-item-remove"
                        style={{ padding: "0.75rem 1rem", background: "rgba(255, 77, 77, 0.1)", border: "1px solid rgba(255, 77, 77, 0.3)", borderRadius: "10px", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{ position: "sticky", top: "100px", height: "fit-content" }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="cart-summary-card"
            >
              <h2 className="cart-summary-title">Order Summary</h2>
              
              <div style={{ marginBottom: "1.5rem" }}>
                <div className="cart-summary-row">
                  <span>Subtotal ({cartItemCount} items)</span>
                  <span>PKR {cartTotal.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Service Fee</span>
                  <span>Free</span>
                </div>
                <div style={{ height: "1px", background: "rgba(255, 106, 42, 0.2)", margin: "1rem 0" }} />
                <div className="cart-summary-total">
                  <span>Total</span>
                  <span>PKR {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ padding: "1.5rem", background: "rgba(255, 106, 42, 0.1)", backdropFilter: "blur(10px)", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid rgba(255, 106, 42, 0.2)", boxShadow: "0 0 20px rgba(255, 106, 42, 0.1)" }}>
                <p style={{ fontSize: "0.9rem", color: "#2B2B2C", opacity: "0.7", lineHeight: "1.6", textAlign: "center" }}>
                  💬 Contact sellers directly via WhatsApp to complete your purchase. Payment integration coming soon!
                </p>
              </div>

              <button
                onClick={() => {
                  alert("Contact sellers via WhatsApp to complete purchase. Payment integration coming soon!");
                }}
                className="cart-checkout-button"
              >
                Contact Sellers
              </button>

              <button
                onClick={clearCart}
                className="cart-clear-button"
              >
                Clear Cart
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}


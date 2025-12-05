import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { FaGavel, FaClock, FaUser, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "../styles/Bidding.css";

export default function Bidding({ product }) {
  const { placeBid, getBids, products } = useProducts();
  const { user, isAuthenticated } = useAuth();
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentProduct = products.find((p) => p.id === product.id) || product;
  const biddingEnabled = currentProduct.bidding_enabled || currentProduct.biddingenabled;
  const startingBid = currentProduct.starting_bid || currentProduct.startingbid || currentProduct.price;
  const currentBid = currentProduct.current_bid || currentProduct.currentbid || startingBid;
  const bidCount = currentProduct.bid_count || currentProduct.bidcount || 0;
  const endDate = currentProduct.bid_end_date || currentProduct.bidenddate;

  // Load bids
  const loadBids = async () => {
    if (biddingEnabled) {
      const productBids = await getBids(product.id);
      setBids(productBids || []);
    }
  };

  useEffect(() => {
    loadBids();
  }, [biddingEnabled, product.id]);

  // Refresh bids when products update - real-time polling
  useEffect(() => {
    if (biddingEnabled) {
      const interval = setInterval(() => {
        loadBids();
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [biddingEnabled, product.id]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!isAuthenticated) {
      setError("Please login to place a bid");
      setIsSubmitting(false);
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid bid amount");
      setIsSubmitting(false);
      return;
    }

    if (amount <= currentBid) {
      setError(`Your bid must be higher than PKR ${currentBid}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await placeBid(
        product.id,
        amount,
        user.id,
        user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      );

      setIsSubmitting(false);

      if (result.success) {
        setSuccess(`Bid placed successfully! Your bid of PKR ${amount} is now the highest.`);
        setBidAmount("");
        await loadBids();
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(result.error || "Failed to place bid. Please try again.");
      }
    } catch (err) {
      setIsSubmitting(false);
      setError("Failed to place bid. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No end date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAuctionEnded = endDate ? new Date(endDate) < new Date() : false;

  if (!biddingEnabled) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bidding-container"
    >
      <div className="bidding-header">
        <FaGavel style={{ fontSize: "1.5rem", color: "#FF6A2A" }} />
        <h2 className="bidding-title">Bidding</h2>
      </div>

      {isAuctionEnded ? (
        <div className="bidding-ended">
          <FaTimesCircle className="bidding-ended-icon" />
          <p className="bidding-ended-title">Auction Ended</p>
          <p className="bidding-ended-text">
            Final bid: PKR {currentBid}
          </p>
        </div>
      ) : (
        <>
          {/* Current Bid Info */}
          <div className="bidding-stats">
            <div className="bidding-stat-card">
              <div className="bidding-stat-label">Current Bid</div>
              <div className="bidding-stat-value">PKR {currentBid}</div>
            </div>
            <div className="bidding-stat-card">
              <div className="bidding-stat-label">Total Bids</div>
              <div className="bidding-stat-value">{bidCount}</div>
            </div>
            {endDate && (
              <div className="bidding-stat-card">
                <div className="bidding-stat-label-with-icon">
                  <FaClock /> Ends
                </div>
                <div className="bidding-stat-value" style={{ fontSize: "0.95rem" }}>{formatDate(endDate)}</div>
              </div>
            )}
          </div>

          {/* Place Bid Form */}
          {isAuthenticated && (
            <form onSubmit={handlePlaceBid} className="bidding-form">
              {error && (
                <div className="bidding-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="bidding-success">
                  <FaCheckCircle /> {success}
                </div>
              )}

              <div className="bidding-form-row">
                <div className="bidding-input-group">
                  <label className="bidding-label">
                    Your Bid (Minimum: PKR {currentBid + 1})
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => {
                      setBidAmount(e.target.value);
                      setError("");
                    }}
                    placeholder={`Enter amount (min: ${currentBid + 1})`}
                    min={currentBid + 1}
                    step="1"
                    required
                    className="bidding-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bidding-submit-button"
                >
                  {isSubmitting ? "Placing..." : "Place Bid"}
                </button>
              </div>
            </form>
          )}

          {!isAuthenticated && (
            <div className="bidding-login-prompt">
              <p className="bidding-login-text">Please login to place a bid</p>
            </div>
          )}
        </>
      )}

      {/* Bids History */}
      {bids.length > 0 && (
        <div className="bidding-history">
          <h3 className="bidding-history-title">
            Bidding History ({bids.length})
          </h3>
          <div className="bidding-history-list">
            {bids.map((bid, index) => (
              <motion.div
                key={bid.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bidding-history-item"
                style={{
                  background: index === 0 ? "rgba(255, 106, 42, 0.15)" : "rgba(255, 255, 255, 0.8)",
                  border: index === 0 ? "2px solid #FF6A2A" : "1px solid rgba(255, 106, 42, 0.1)",
                }}
              >
                <div className="bidding-history-user">
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: index === 0 ? "#FF6A2A" : "rgba(255, 106, 42, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: index === 0 ? "#fff" : "#FF6A2A",
                      fontWeight: 700,
                      boxShadow: index === 0 ? "0 0 15px rgba(255, 106, 42, 0.4)" : "none",
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <FaUser style={{ fontSize: "0.85rem", color: "#2B2B2C", opacity: "0.7" }} />
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#2B2B2C" }}>
                        {bid.biddername || bid.bidder_name || 'Anonymous'}
                      </span>
                      {index === 0 && (
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            background: "#FF6A2A",
                            color: "#fff",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            boxShadow: "0 0 10px rgba(255, 106, 42, 0.4)",
                          }}
                        >
                          Highest
                        </span>
                      )}
                    </div>
                    <div className="bidding-history-time">
                      {new Date(bid.created_at || bid.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="bidding-history-amount">
                  PKR {bid.amount}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {bids.length === 0 && !isAuctionEnded && (
        <div style={{ textAlign: "center", padding: "2rem", color: "#2B2B2C", opacity: "0.7" }}>
          <FaGavel style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.5, color: "#FF6A2A" }} />
          <p>No bids yet. Be the first to bid!</p>
        </div>
      )}
    </motion.div>
  );
}


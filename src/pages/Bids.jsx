import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { FaGavel, FaClock, FaCheckCircle, FaTimesCircle, FaArrowRight } from "react-icons/fa";
import "../styles/Bids.css";

export default function Bids() {
  const { getUserBids, getBids, products } = useProducts();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userBids, setUserBids] = useState([]);
  const [bidProducts, setBidProducts] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadBids = async () => {
      if (user) {
        const bids = await getUserBids(user.id);
        setUserBids(bids || []);

        // Get product details for each bid
        const productsWithBids = await Promise.all(
          (bids || []).map(async (bid) => {
            const product = products.find((p) => p.id === (bid.productid || bid.product_id));
            if (!product) return null;
            
            // Get all bids for this product to find highest
            const productBids = await getBids(bid.productid || bid.product_id);
            const highestBid = productBids && productBids.length > 0 ? productBids[0] : null;
            const isHighest = highestBid && highestBid.id === bid.id;
            return { ...bid, product, isHighest };
          })
        );
        setBidProducts(productsWithBids.filter(Boolean));
      }
    };

    // Initial load
    loadBids();

    // Real-time polling - refresh every 5 seconds
    const bidsPollingInterval = setInterval(() => {
      loadBids();
    }, 5000);

    return () => {
      clearInterval(bidsPollingInterval);
    };
  }, [isAuthenticated, user, products, navigate, getUserBids, getBids]);

  if (!isAuthenticated) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAuctionEnded = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  return (
    <div className="bids-page">
      <div className="bids-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bids-header"
        >
          <div className="bids-header-icon-wrapper">
            <FaGavel className="bids-header-icon" />
            <h1 className="bids-title">My Bids</h1>
          </div>
          <p className="bids-subtitle">
            Track all your bidding activity and auction status
          </p>
        </motion.div>

        {/* Bids List */}
        {bidProducts.length > 0 ? (
          <div className="bids-list">
            {bidProducts.map((bidData) => {
              const { product, isHighest, ...bid } = bidData;
              if (!product) return null;

              const ended = isAuctionEnded(product.bid_end_date || product.bidenddate);
              const currentHighestBid = product.current_bid || product.currentbid || product.starting_bid || product.startingbid || product.price;

              return (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`bid-card ${isHighest ? 'bid-card--highest' : ''}`}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="bid-card-content">
                    {/* Product Image */}
                    <div className="bid-product-image">
                      <img
                        src={product.image || "/logo.PNG"}
                        alt={product.title}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="bid-product-info">
                      <div className="bid-product-header">
                        <div className="bid-product-details">
                          <h3 className="bid-product-title">{product.title}</h3>
                          <p className="bid-product-description">{product.description}</p>
                        </div>
                        {isHighest && (
                          <div className="bid-highest-badge">
                            <FaCheckCircle /> Highest Bid
                          </div>
                        )}
                      </div>

                      <div className="bid-stats">
                        <div className="bid-stat">
                          <div className="bid-stat-label">Your Bid</div>
                          <div className="bid-stat-value bid-stat-value--your">
                            PKR {bid.amount}
                          </div>
                        </div>
                        <div className="bid-stat">
                          <div className="bid-stat-label">Current Highest</div>
                          <div className={`bid-stat-value ${isHighest ? 'bid-stat-value--highest' : 'bid-stat-value--current'}`}>
                            PKR {currentHighestBid}
                          </div>
                        </div>
                        <div className="bid-stat">
                          <div className="bid-stat-label">Bid Placed</div>
                          <div className="bid-stat-value bid-stat-value--date">
                            {formatDate(bid.created_at || bid.timestamp)}
                          </div>
                        </div>
                        {(product.bid_end_date || product.bidenddate) && (
                          <div className="bid-stat">
                            <div className="bid-stat-label bid-stat-label--time">
                              <FaClock /> {ended ? "Ended" : "Ends"}
                            </div>
                            <div className={`bid-stat-value bid-stat-value--date ${ended ? 'bid-stat-value--ended' : 'bid-stat-value--active'}`}>
                              {formatDate(product.bid_end_date || product.bidenddate)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="bid-status-section">
                      {ended ? (
                        <div className="bid-status-badge bid-status-badge--ended">
                          <FaTimesCircle className="bid-status-icon" />
                          <div>Auction Ended</div>
                        </div>
                      ) : (
                        <div className="bid-status-badge bid-status-badge--active">
                          <FaClock className="bid-status-icon" />
                          <div>Active</div>
                        </div>
                      )}
                      <Link
                        to={`/product/${product.id}`}
                        className="bid-view-button"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Product <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bids-empty"
          >
            <FaGavel className="bids-empty-icon" />
            <h2 className="bids-empty-title">No Bids Yet</h2>
            <p className="bids-empty-text">
              You haven't placed any bids yet. Start bidding on products to see them here!
            </p>
            <Link to="/products" className="bids-empty-button">
              Browse Products <FaArrowRight />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

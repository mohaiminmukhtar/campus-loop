import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LiveHuntingGuide from "../components/LiveHuntingGuide";
import { FaGavel, FaClock, FaFire, FaTrophy, FaEye, FaBolt, FaHeart, FaTimes, FaCheckCircle } from "react-icons/fa";
import "../styles/LiveHunting.css";

export default function LiveHunting() {
  const { products, addToFavorites, removeFromFavorites, isFavorite, placeBid } = useProducts();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [auctionProducts, setAuctionProducts] = useState([]);
  const [filter, setFilter] = useState("all"); // all, ending-soon, hot
  const [bidModal, setBidModal] = useState({ isOpen: false, product: null });
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Filter products with bidding enabled
    const auctions = products.filter((p) => p.bidding_enabled || p.biddingenabled);
    
    // Sort based on filter
    let sorted = [...auctions];
    if (filter === "ending-soon") {
      sorted = sorted.sort((a, b) => {
        const aEnd = new Date(a.bid_end_date || a.bidenddate);
        const bEnd = new Date(b.bid_end_date || b.bidenddate);
        return aEnd - bEnd;
      });
    } else if (filter === "hot") {
      sorted = sorted.sort((a, b) => (b.bid_count || b.bidcount || 0) - (a.bid_count || a.bidcount || 0));
    } else {
      sorted = sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    
    setAuctionProducts(sorted);
  }, [products, filter]);

  const getTimeRemaining = (endDate) => {
    if (!endDate) return "No end date";
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isEndingSoon = (endDate) => {
    if (!endDate) return false;
    const diff = new Date(endDate) - new Date();
    return diff > 0 && diff < 24 * 60 * 60 * 1000; // Less than 24 hours
  };

  const openBidModal = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    setBidModal({ isOpen: true, product });
    setBidAmount("");
  };

  const closeBidModal = () => {
    setBidModal({ isOpen: false, product: null });
    setBidAmount("");
    setIsSubmitting(false);
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showToast("Please login to place a bid", "error");
      return;
    }

    const amount = parseFloat(bidAmount);
    const currentBid = bidModal.product.current_bid || bidModal.product.currentbid || bidModal.product.starting_bid || bidModal.product.startingbid || bidModal.product.price;

    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid bid amount", "error");
      return;
    }

    if (amount <= currentBid) {
      showToast(`Your bid must be higher than PKR ${currentBid}`, "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await placeBid(
        bidModal.product.id,
        amount,
        user.id,
        user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      );

      setIsSubmitting(false);

      if (result.success) {
        showToast(`Bid placed successfully! PKR ${amount}`, "success");
        closeBidModal();
      } else {
        showToast(result.error || "Failed to place bid", "error");
      }
    } catch (error) {
      setIsSubmitting(false);
      showToast("Failed to place bid. Please try again.", "error");
    }
  };

  const AuctionCard = ({ product }) => {
    const isFav = isFavorite(product.id);
    const timeRemaining = getTimeRemaining(product.bid_end_date || product.bidenddate);
    const endingSoon = isEndingSoon(product.bid_end_date || product.bidenddate);
    const isOwner = user && product.owner_id === user.id;
    const currentBid = product.current_bid || product.currentbid || product.starting_bid || product.startingbid || product.price;
    const bidCount = product.bid_count || product.bidcount || 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.03, y: -8 }}
        transition={{ duration: 0.3 }}
        className="auction-card"
      >
        <Link to={`/product/${product.id}`} className="auction-card-link">
          {/* Image Section */}
          <div className="auction-image-wrapper">
            <img
              src={product.image_url || product.image || "/logo.PNG"}
              alt={product.title}
              className="auction-image"
            />
            
            {/* Overlays */}
            <div className="auction-overlays">
              {endingSoon && (
                <div className="auction-badge auction-badge-ending">
                  <FaBolt /> Ending Soon
                </div>
              )}
              {bidCount > 10 && (
                <div className="auction-badge auction-badge-hot">
                  <FaFire /> Hot
                </div>
              )}
              {isOwner && (
                <div className="auction-badge auction-badge-owner">
                  <FaTrophy /> Your Auction
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
              className={`auction-favorite-btn ${isFav ? 'active' : ''}`}
            >
              <FaHeart />
            </button>
          </div>

          {/* Content Section */}
          <div className="auction-content">
            <h3 className="auction-title">{product.title}</h3>
            
            {/* Bid Info */}
            <div className="auction-bid-info">
              <div className="auction-price-section">
                <div className="auction-starting-price">
                  <span className="auction-bid-label">Starting Price</span>
                  <span className="auction-starting-amount">PKR {product.starting_bid || product.startingbid || product.price}</span>
                </div>
                <div className="auction-current-bid">
                  <span className="auction-bid-label">Current Bid</span>
                  <span className="auction-bid-amount">PKR {currentBid}</span>
                </div>
              </div>
              <div className="auction-bid-count">
                <FaGavel /> {bidCount} {bidCount === 1 ? 'bid' : 'bids'}
              </div>
            </div>

            {/* Time Remaining */}
            <div className={`auction-time ${endingSoon ? 'ending-soon' : ''} ${timeRemaining === 'Ended' ? 'ended' : ''}`}>
              <FaClock />
              <span>{timeRemaining === 'Ended' ? 'Auction Ended' : `${timeRemaining} left`}</span>
            </div>

            {/* Views */}
            <div className="auction-views">
              <FaEye /> {product.views || 0} views
            </div>
          </div>
        </Link>

        {/* Quick Bid Button */}
        {!isOwner && timeRemaining !== 'Ended' && (
          <button
            onClick={(e) => openBidModal(product, e)}
            className="auction-bid-btn"
          >
            <FaGavel /> Place Bid
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="live-hunting-page">
      {/* Guide Popup */}
      <LiveHuntingGuide />
      
      <div className="live-hunting-container">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="live-hunting-header"
        >
          <div className="header-icon-wrapper">
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <FaGavel className="header-icon" />
            </motion.div>
          </div>
          <h1 className="live-hunting-title">
            <span className="title-live">Live</span>
            <span className="title-hunting">Hunting</span>
          </h1>
          <p className="live-hunting-subtitle">
            <FaFire /> Bid on exclusive items before time runs out
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
            <FaGavel /> All Auctions
          </button>
          <button
            onClick={() => setFilter("ending-soon")}
            className={`filter-tab ${filter === "ending-soon" ? "active" : ""}`}
          >
            <FaClock /> Ending Soon
          </button>
          <button
            onClick={() => setFilter("hot")}
            className={`filter-tab ${filter === "hot" ? "active" : ""}`}
          >
            <FaFire /> Hot Bids
          </button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="stats-bar"
        >
          <div className="stat-item">
            <FaGavel className="stat-icon" />
            <span className="stat-value">{auctionProducts.length}</span>
            <span className="stat-label">Live Auctions</span>
          </div>
          <div className="stat-item">
            <FaFire className="stat-icon" />
            <span className="stat-value">
              {auctionProducts.filter(p => isEndingSoon(p.bid_end_date || p.bidenddate)).length}
            </span>
            <span className="stat-label">Ending Soon</span>
          </div>
          <div className="stat-item">
            <FaTrophy className="stat-icon" />
            <span className="stat-value">
              {auctionProducts.reduce((sum, p) => sum + (p.bid_count || p.bidcount || 0), 0)}
            </span>
            <span className="stat-label">Total Bids</span>
          </div>
        </motion.div>

        {/* Auction Grid */}
        {auctionProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="auction-grid"
          >
            {auctionProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <AuctionCard product={product} />
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
            <h3 className="no-auctions-title">No Live Auctions</h3>
            <p className="no-auctions-text">Check back later for exciting bidding opportunities!</p>
          </motion.div>
        )}
      </div>

      {/* Bid Modal */}
      <AnimatePresence>
        {bidModal.isOpen && bidModal.product && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bid-modal-backdrop"
              onClick={closeBidModal}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bid-modal"
            >
              {/* Close Button */}
              <button onClick={closeBidModal} className="bid-modal-close">
                <FaTimes />
              </button>

              {/* Product Info */}
              <div className="bid-modal-header">
                <div className="bid-modal-image">
                  <img
                    src={bidModal.product.image_url || bidModal.product.image || "/logo.PNG"}
                    alt={bidModal.product.title}
                  />
                </div>
                <div className="bid-modal-info">
                  <h3 className="bid-modal-title">{bidModal.product.title}</h3>
                  <div className="bid-modal-current">
                    <span className="bid-modal-label">Current Highest Bid</span>
                    <span className="bid-modal-amount">
                      PKR {bidModal.product.current_bid || bidModal.product.currentbid || bidModal.product.starting_bid || bidModal.product.startingbid || bidModal.product.price}
                    </span>
                  </div>
                  <div className="bid-modal-stats">
                    <span><FaGavel /> {bidModal.product.bid_count || bidModal.product.bidcount || 0} bids</span>
                    <span><FaClock /> {getTimeRemaining(bidModal.product.bid_end_date || bidModal.product.bidenddate)} left</span>
                  </div>
                </div>
              </div>

              {/* Bid Form */}
              <form onSubmit={handlePlaceBid} className="bid-modal-form">
                <label className="bid-modal-input-label">
                  Your Bid Amount (PKR)
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Enter amount (min: ${(bidModal.product.current_bid || bidModal.product.currentbid || bidModal.product.starting_bid || bidModal.product.startingbid || bidModal.product.price) + 1})`}
                  min={(bidModal.product.current_bid || bidModal.product.currentbid || bidModal.product.starting_bid || bidModal.product.startingbid || bidModal.product.price) + 1}
                  step="1"
                  required
                  className="bid-modal-input"
                  autoFocus
                />
                <div className="bid-modal-actions">
                  <button
                    type="button"
                    onClick={closeBidModal}
                    className="bid-modal-btn bid-modal-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bid-modal-btn bid-modal-btn-submit"
                  >
                    {isSubmitting ? (
                      "Placing Bid..."
                    ) : (
                      <>
                        <FaCheckCircle /> Place Bid
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

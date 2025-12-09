import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaComments, FaUser, FaSignOutAlt, FaShoppingCart, FaSearch, FaTimes, FaCog, FaHome, FaBox, FaChevronDown, FaInfoCircle, FaGavel, FaFire } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItemCount, searchProducts } = useProducts();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const userDropdownRef = useRef(null);
  const settingsDropdownRef = useRef(null);
  
  // Get favorites count from localStorage (works outside context too)
  useEffect(() => {
    const updateCounts = () => {
      try {
        const favorites = JSON.parse(localStorage.getItem("campusloop_favorites") || "[]");
        setFavoritesCount(favorites.length);
      } catch (err) {
        setFavoritesCount(0);
      }
    };
    updateCounts();
    // Update when storage changes
    const interval = setInterval(updateCounts, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  // Handle search
  const [allSearchResults, setAllSearchResults] = useState([]);
  
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchProducts(searchQuery);
      setAllSearchResults(results);
      setSearchResults(results.slice(0, 5)); // Show top 5 results
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setAllSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, searchProducts]);

  // Close search results and dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setSettingsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="navbar navbar-scrollbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo-link">
          <motion.img src="/logo.PNG" alt="Campusloop" className="navbar-logo" />
          {!isMobile && (
            <span className="navbar-logo-text">Campusloop</span>
          )}
        </Link>

        {/* Global Search Bar */}
        <div ref={searchRef} className={`navbar-search-container ${isMobile ? 'mobile' : ''}`}>
            <form onSubmit={handleSearchSubmit} className="navbar-search-form">
              <div>
                <FaSearch className="navbar-search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={(e) => {
                    if (searchQuery.trim()) setShowSearchResults(true);
                  }}
                  className="navbar-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                    className="navbar-search-clear"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="navbar-search-results navbar-scrollbar"
              >
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                    className="navbar-search-result-item"
                  >
                    <div className="navbar-search-result-image">
                      <img src={product.image_url || product.image || "/logo.PNG"} alt={product.title} />
                    </div>
                    <div className="navbar-search-result-content">
                      <h4 className="navbar-search-result-title">
                        {product.title}
                      </h4>
                      <p className="navbar-search-result-description">
                          {product.description}
                        </p>
                      <div className="navbar-search-result-price">
                        PKR {product.price}
                      </div>
                    </div>
                  </Link>
                ))}
                {allSearchResults.length > 5 && (
                  <div className="navbar-search-view-all">
                    <button
                      onClick={() => {
                        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                        setSearchQuery("");
                        setShowSearchResults(false);
                      }}
                      className="navbar-search-view-all-button"
                    >
                      View All Results ({allSearchResults.length})
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>

        {/* Desktop Links */}
        {!isMobile && (
          <div className="navbar-desktop-links">
            <Link 
              to="/cart" 
              className="navbar-link navbar-cart-link"
            >
              <FaShoppingCart style={{ fontSize: "1.2rem" }} />
              {cartItemCount > 0 && (
                <span className="navbar-cart-badge">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {/* Settings Dropdown */}
            <div ref={settingsDropdownRef} className="navbar-settings-container">
              <button
                onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                className={`navbar-settings-button ${settingsDropdownOpen ? 'active' : ''}`}
              >
                <FaCog style={{ fontSize: "1.2rem" }} />
                <FaChevronDown style={{ fontSize: "0.7rem" }} />
              </button>

              <AnimatePresence>
                {settingsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="navbar-settings-dropdown"
                  >
                    <Link
                      to="/wishlist"
                      onClick={() => setSettingsDropdownOpen(false)}
                      className="navbar-dropdown-link"
                    >
                      <FaHeart style={{ color: "#FF6A2A", fontSize: "1rem" }} />
                      <span className="navbar-dropdown-link-text">Wishlist</span>
                      {favoritesCount > 0 && (
                        <span className="navbar-dropdown-badge">
                          {favoritesCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/chat"
                      onClick={() => setSettingsDropdownOpen(false)}
                      className="navbar-dropdown-link"
                    >
                      <FaComments style={{ color: "#FF6A2A", fontSize: "1rem" }} />
                      <span className="navbar-dropdown-link-text">Chat</span>
                    </Link>
                    <Link
                      to="/about"
                      onClick={() => setSettingsDropdownOpen(false)}
                      className="navbar-dropdown-link"
                    >
                      <FaInfoCircle style={{ color: "#FF6A2A", fontSize: "1rem" }} />
                      <span className="navbar-dropdown-link-text">About</span>
                    </Link>
                    {isAuthenticated && (
                      <>
                        <Link
                          to="/live-hunting"
                          onClick={() => setSettingsDropdownOpen(false)}
                          className="navbar-dropdown-link"
                        >
                          <FaFire style={{ color: "#FF6A2A", fontSize: "1rem" }} />
                          <span className="navbar-dropdown-link-text">Live Hunting</span>
                        </Link>
                        <Link
                          to="/bids"
                          onClick={() => setSettingsDropdownOpen(false)}
                          className="navbar-dropdown-link"
                        >
                          <FaGavel style={{ color: "#FF6A2A", fontSize: "1rem" }} />
                          <span className="navbar-dropdown-link-text">My Bids</span>
                        </Link>
                        <Link
                          to="/sell"
                          onClick={() => setSettingsDropdownOpen(false)}
                          className="navbar-dropdown-link"
                        >
                          <FaBox style={{ color: "#FF6A2A", fontSize: "1rem" }} />
                          <span className="navbar-dropdown-link-text">Sell</span>
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Section */}
            {isAuthenticated ? (
              <div className="navbar-user-section">
                <Link
                  to="/profile"
                  className="navbar-profile-link"
                >
                  <FaUser style={{ color: "#ff6600", fontSize: "1rem" }} />
                  <span className="navbar-profile-text">
                    {user?.name || user?.studentId?.toUpperCase()}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="navbar-logout-button"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="navbar-login-link"
              >
                <FaUser /> Login
              </Link>
            )}
          </div>
        )}

        {/* Mobile Cart and Hamburger */}
        {isMobile && (
          <div className="navbar-mobile-actions">
            <Link 
              to="/cart" 
              className="navbar-mobile-cart-link"
            >
              <FaShoppingCart style={{ fontSize: "1.5rem" }} />
              {cartItemCount > 0 && (
                <span className="navbar-mobile-cart-badge">
                  {cartItemCount}
                </span>
              )}
            </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="navbar-hamburger">
            <span className={`navbar-hamburger-line ${menuOpen ? 'open-1' : ''}`} />
            <span className={`navbar-hamburger-line ${menuOpen ? 'open-2' : ''}`} />
            <span className={`navbar-hamburger-line ${menuOpen ? 'open-3' : ''}`} />
          </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && isMobile && (
          <>
            <motion.div
              className="navbar-mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="navbar-mobile-menu navbar-scrollbar"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mobile Settings Section */}
              <div className="navbar-mobile-section">
                <div className="navbar-mobile-section-title">
                  Settings
                </div>
                <Link 
                  to="/"
                  className="navbar-mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="navbar-mobile-link-content">
                    <FaHome /> Home
                  </span>
                </Link>
                <Link 
                  to="/wishlist" 
                  className="navbar-mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="navbar-mobile-link-content">
                    <FaHeart /> Wishlist
                    {favoritesCount > 0 && (
                      <span className="navbar-mobile-link-badge">
                        {favoritesCount}
                      </span>
                    )}
                  </span>
                </Link>
                <Link 
                  to="/chat" 
                  className="navbar-mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="navbar-mobile-link-content">
                    <FaComments /> Chat
                  </span>
                </Link>
                <Link 
                  to="/about" 
                  className="navbar-mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="navbar-mobile-link-content">
                    <FaInfoCircle /> About
                  </span>
                </Link>
                {isAuthenticated && (
                  <>
                    <Link 
                      to="/live-hunting" 
                      className="navbar-mobile-link"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="navbar-mobile-link-content">
                        <FaFire /> Live Hunting
                      </span>
                    </Link>
                    <Link 
                      to="/bids" 
                      className="navbar-mobile-link"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="navbar-mobile-link-content">
                        <FaGavel /> My Bids
                      </span>
                    </Link>
                    <Link 
                      to="/sell" 
                      className="navbar-mobile-link"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="navbar-mobile-link-content">
                        <FaBox /> Sell
                      </span>
                    </Link>
                  </>
                )}
              </div>
              
              {/* Mobile User Section */}
              {isAuthenticated ? (
                <div className="navbar-mobile-section">
                  <Link
                    to="/profile"
                    className="navbar-mobile-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="navbar-mobile-link-content">
                      <FaUser /> Profile
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="navbar-mobile-logout-button"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="navbar-mobile-login-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <FaUser /> Login
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaUpload, FaCheckCircle, FaTimes, FaGavel } from "react-icons/fa";
import "../styles/Sell.css";

const categories = [
  { value: "rentals", label: "Rentals" },
  { value: "barter", label: "Barter" },
  { value: "fashion", label: "Fashion" },
  { value: "electronics", label: "Electronics" },
  { value: "free-for-all", label: "Free for All" },
  { value: "furniture", label: "Furniture" },
  { value: "digital-services", label: "Digital Services" },
];

// Categories that don't require price
const noPriceCategories = ["barter", "free-for-all"];

const conditions = ["New", "Like New", "Excellent", "Good", "Fair"];

export default function Sell() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    image: "",
    biddingenabled: false,
    startingbid: "",
    bidenddate: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If category changes to barter or free-for-all, clear price
    if (name === "category" && noPriceCategories.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        price: "0",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file");
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Check if price is required for this category
    const isPriceRequired = !noPriceCategories.includes(formData.category);

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.condition) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Validate price only if required
    if (isPriceRequired) {
      if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
        setError("Please enter a valid price");
        setIsSubmitting(false);
        return;
      }
    }

    // Validate bidding fields if enabled
    if (formData.biddingenabled) {
      if (!formData.startingbid || isNaN(formData.startingbid) || parseFloat(formData.startingbid) <= 0) {
        setError("Please enter a valid starting bid");
        setIsSubmitting(false);
        return;
      }

      // Validate bid end date is within 7 days
      if (formData.bidenddate) {
        const endDate = new Date(formData.bidenddate);
        const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        if (endDate > maxDate) {
          setError("Auction end date cannot be more than 7 days from now");
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      let imageUrl = formData.image || "/logo.PNG";

      // Upload image if file is selected
      if (imageFile) {
        const { uploadProductImage } = await import("../services/productService");
        const tempId = `temp-${Date.now()}`;
        const uploadResult = await uploadProductImage(imageFile, tempId);
        
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          setError("Failed to upload image. Using default image.");
          // Continue with default image instead of failing
        }
      }

      const newProduct = await addProduct({
        title: formData.title,
        description: formData.description,
        price: noPriceCategories.includes(formData.category) ? 0 : parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location || user?.user_metadata?.studentId?.toUpperCase() || "Campus",
        seller: user?.user_metadata?.studentId?.toUpperCase() || "Student",
        sellerrating: 5.0,
        image: imageUrl,
        biddingenabled: formData.biddingenabled || false,
        startingbid: formData.biddingenabled ? parseFloat(formData.startingbid) : undefined,
        bidenddate: formData.bidenddate || undefined,
        currentbid: formData.biddingenabled ? parseFloat(formData.startingbid) : undefined,
        bidcount: 0,
      });

      if (newProduct) {
        showToast("Product listed successfully! Redirecting to products page...", "success");
        setSuccess(true);
        setTimeout(() => {
          navigate("/products");
        }, 1500);
      } else {
        showToast("Failed to list item. Please try again.", "error");
        setError("Failed to list item. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Error adding product:", err);
      showToast("Failed to list item. Please try again.", "error");
      setError("Failed to list item. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="sell-page">
      <div className="sell-container">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sell-header">
          <h1 className="sell-title">
            List Your Item
          </h1>
          <p className="sell-subtitle">
            Sell your items to fellow students on Campusloop
          </p>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="sell-success-card"
          >
            <FaCheckCircle className="sell-success-icon" />
            <h2 className="sell-success-title">
              Item Listed Successfully!
            </h2>
            <p className="sell-success-text">Redirecting to your product page...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sell-form-card"
          >
            {error && (
              <div className="sell-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="sell-form-group">
                <label className="sell-label">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., MacBook Pro 13-inch (2020)"
                  required
                  className="sell-input"
                />
              </div>

              {/* Description */}
              <div className="sell-form-group">
                <label className="sell-label">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your item in detail..."
                  rows={5}
                  required
                  className="sell-textarea"
                />
              </div>

              {/* Category */}
              <div className="sell-form-group">
                <label className="sell-label">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="sell-select"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price - Only show if not Barter or Free for All */}
              {!noPriceCategories.includes(formData.category) && (
                <div className="sell-form-group">
                  <label className="sell-label">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    className="sell-input"
                  />
                </div>
              )}

              {/* Show info for Barter and Free for All */}
              {formData.category === "barter" && (
                <div style={{ 
                  padding: "1rem", 
                  background: "#FFF4E6", 
                  borderRadius: "8px", 
                  marginBottom: "1rem",
                  border: "1px solid #FF6A2A"
                }}>
                  <p style={{ margin: 0, color: "#2B2B2C", fontSize: "0.9rem" }}>
                    💱 <strong>Barter Item:</strong> Describe what you're looking to trade for in the description.
                  </p>
                </div>
              )}

              {formData.category === "free-for-all" && (
                <div style={{ 
                  padding: "1rem", 
                  background: "#E8F5E9", 
                  borderRadius: "8px", 
                  marginBottom: "1rem",
                  border: "1px solid #4CAF50"
                }}>
                  <p style={{ margin: 0, color: "#2B2B2C", fontSize: "0.9rem" }}>
                    🎁 <strong>Free Item:</strong> This item will be listed as free for anyone to claim!
                  </p>
                </div>
              )}

              {/* Condition and Location Row */}
              <div className="sell-form-row">
                <div>
                  <label className="sell-label">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    required
                    className="sell-select"
                  >
                    <option value="">Select Condition</option>
                    {conditions.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="sell-label">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={user?.studentId?.toUpperCase() || "Your location"}
                    className="sell-input"
                  />
                </div>
              </div>

              {/* Bidding Option */}
              <div className="sell-bidding-section">
                <label className="sell-checkbox-group">
                  <input
                    type="checkbox"
                    name="biddingenabled"
                    checked={formData.biddingenabled}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        biddingenabled: e.target.checked,
                        startingbid: e.target.checked ? prev.price : "",
                      }));
                    }}
                    className="sell-checkbox"
                  />
                  <FaGavel style={{ color: "#FF6A2A" }} />
                  <span className="sell-checkbox-label">Enable Bidding / Auction</span>
                </label>
                {formData.biddingenabled && (
                  <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label className="sell-label">
                        Starting Bid (PKR) *
                      </label>
                      <input
                        type="number"
                        name="startingbid"
                        value={formData.startingbid}
                        onChange={handleChange}
                        placeholder={formData.price || "Enter starting bid"}
                        min="0"
                        step="0.01"
                        required={formData.biddingenabled}
                        className="sell-input"
                      />
                    </div>
                    <div>
                      <label className="sell-label">
                        Auction End Date & Time (Optional - Max 7 days)
                      </label>
                      <input
                        type="datetime-local"
                        name="bidenddate"
                        value={formData.bidenddate}
                        onChange={handleChange}
                        min={new Date().toISOString().slice(0, 16)}
                        max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                        className="sell-input"
                      />
                      <p style={{ fontSize: "0.8rem", color: "#2B2B2C", opacity: "0.7", marginTop: "0.5rem" }}>
                        Maximum auction duration is 7 days
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="sell-form-group" style={{ marginBottom: "2rem" }}>
                <label className="sell-label">
                  Product Image
                </label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div style={{ marginBottom: "1rem", position: "relative" }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        width: "100%", 
                        maxWidth: "300px", 
                        height: "200px", 
                        objectFit: "cover", 
                        borderRadius: "8px",
                        border: "2px solid #FF6A2A"
                      }} 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "#FF6A2A",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                {/* File Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <label 
                    htmlFor="image-upload" 
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      background: "#FF6A2A",
                      color: "white",
                      borderRadius: "8px",
                      cursor: "pointer",
                      width: "fit-content",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#E55A1A"}
                    onMouseLeave={(e) => e.target.style.background = "#FF6A2A"}
                  >
                    <FaUpload /> Upload Image
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  
                  {/* Or divider */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ flex: 1, height: "1px", background: "#E0E0E0" }}></div>
                    <span style={{ color: "#2B2B2C", opacity: "0.7", fontSize: "0.9rem" }}>OR</span>
                    <div style={{ flex: 1, height: "1px", background: "#E0E0E0" }}></div>
                  </div>

                  {/* URL Input */}
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                    className="sell-input"
                  />
                  <p style={{ fontSize: "0.8rem", color: "#2B2B2C", opacity: "0.7" }}>
                    Upload an image (max 5MB) or provide a URL. Leave empty to use default image.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="sell-button"
              >
                <FaUpload /> {isSubmitting ? "Listing Item..." : "List Item for Sale"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}


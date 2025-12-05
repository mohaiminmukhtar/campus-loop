import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../supabaseClient";
import "../styles/Profile.css";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaSave,
  FaTimes,
  FaLock,
  FaGraduationCap,
  FaCalendarAlt,
  FaBox,
  FaHeart,
  FaShoppingCart,
  FaStar,
  FaCamera,
  FaVenus,
  FaMars,
} from "react-icons/fa";


export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const { products } = useProducts();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    profileImage: "",
    gender: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userProducts, setUserProducts] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load user data and profile image from database
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Fetch user data from database to get avatar_url
        const { data: userData } = await supabase
          .from('users')
          .select('avatar_url, phone, bio')
          .eq('id', user.id)
          .single();

        const metadata = user.user_metadata || {};
        
        // Get profile image from database avatar_url or fallback to metadata
        const profileImageUrl = userData?.avatar_url || 
                               metadata.profileImageUrl || 
                               metadata.profileImage || 
                               "";

        setFormData({
          name: metadata.name || user.name || metadata.studentId?.toUpperCase() || "",
          email: user.email || "",
          phone: userData?.phone || metadata.phone || "",
          bio: userData?.bio || metadata.bio || "",
          profileImage: profileImageUrl,
          gender: metadata.gender || user.gender || "",
        });
      }
    };

    loadUserData();
  }, [user]);

  // Get user's products (real-time from ProductContext)
  useEffect(() => {
    if (user) {
      const userProductsList = products.filter(
        (p) => p.owner_id === user.id
      );
      setUserProducts(userProductsList);
    }
  }, [products, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      showToast("Please enter a valid phone number", "error");
      return;
    }

    // Separate metadata from files
    const metadata = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      gender: formData.gender,
    };

    // Don't send base64 image data - it's already uploaded
    const result = await updateUser(metadata);
    
    if (result.success) {
      showToast("Profile updated successfully!", "success");
      setIsEditing(false);
    } else {
      showToast(result.error || "Failed to update profile", "error");
    }
  };

  const handlePasswordSave = () => {
    // Validation
    if (!passwordData.currentPassword) {
      showToast("Please enter your current password", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    // Check current password
    if (user.password && user.password !== passwordData.currentPassword) {
      showToast("Current password is incorrect", "error");
      return;
    }

    updateUser({ password: passwordData.newPassword });
    showToast("Password updated successfully!", "success");
    setIsEditingPassword(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: reader.result,
        }));
      };
      reader.readAsDataURL(file);

      // Upload to storage in background
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.user_metadata?.studentId || user.id}.${fileExt}`;
        
        // Upload file to student-cards bucket (reuse existing bucket)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("student-cards")
          .upload(`avatars/${fileName}`, file, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          showToast("Failed to upload image. Make sure the student-cards bucket exists in Supabase Storage.", "error");
          return;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("student-cards")
          .getPublicUrl(`avatars/${fileName}`);

        const publicUrl = urlData.publicUrl;

        // Update database avatar_url field
        const { error: dbError } = await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (dbError) {
          console.error("Database update error:", dbError);
          showToast("Failed to update profile image in database", "error");
          return;
        }

        // Also update auth metadata for consistency
        await updateUser({ profileImageUrl: publicUrl });
        
        // Update local state
        setFormData((prev) => ({
          ...prev,
          profileImage: publicUrl,
        }));

        showToast("Profile image updated!", "success");
      } catch (err) {
        console.error("Image upload error:", err);
        showToast("Failed to upload image", "error");
      }
    }
  };

  const handleCancelEdit = async () => {
    setIsEditing(false);
    
    // Reload from database
    const { data: userData } = await supabase
      .from('users')
      .select('avatar_url, phone, bio')
      .eq('id', user.id)
      .single();

    const metadata = user.user_metadata || {};
    const profileImageUrl = userData?.avatar_url || 
                           metadata.profileImageUrl || 
                           metadata.profileImage || 
                           "";

    setFormData({
      name: metadata.name || user.name || metadata.studentId?.toUpperCase() || "",
      email: user.email || "",
      phone: userData?.phone || metadata.phone || "",
      bio: userData?.bio || metadata.bio || "",
      profileImage: profileImageUrl,
      gender: metadata.gender || user.gender || "",
    });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // Use real-time data from ProductContext
  const { favorites, cart } = useProducts();
  const totalSold = userProducts.filter((p) => p.sold).length;
  const totalEarnings = userProducts
    .filter((p) => p.sold)
    .reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="profile-header"
        >
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account and preferences</p>
        </motion.div>



        <div className="profile-grid">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="profile-card"
          >
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" />
                  ) : (
                    (formData.name || user.user_metadata?.studentId?.toUpperCase() || "U")[0]
                  )}
                </div>
                {isEditing && (
                  <label className="profile-avatar-upload">
                    <FaCamera />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
              <h2 className="profile-name">
                {formData.name || user.user_metadata?.studentId?.toUpperCase()}
              </h2>
              <div className="profile-student-id">
                <FaGraduationCap /> {user.user_metadata?.studentId?.toUpperCase()}
              </div>
            </div>

            <div className="profile-info">
              <div className="profile-info-item">
                <FaEnvelope className="profile-info-icon" />
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className="profile-input"
                  />
                ) : (
                  <span className={`profile-info-text ${!formData.email ? 'profile-info-text--empty' : ''}`}>
                    {formData.email || "No email set"}
                  </span>
                )}
              </div>

              <div className="profile-info-item">
                <FaPhone className="profile-info-icon" />
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                    className="profile-input"
                  />
                ) : (
                  <span className={`profile-info-text ${!formData.phone ? 'profile-info-text--empty' : ''}`}>
                    {formData.phone || "No phone set"}
                  </span>
                )}
              </div>

              <div className="profile-info-item profile-info-item--textarea">
                <FaUser className="profile-info-icon" />
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    rows="3"
                    className="profile-textarea"
                  />
                ) : (
                  <span className={`profile-info-text ${!formData.bio ? 'profile-info-text--empty' : ''}`}>
                    {formData.bio || "No bio set"}
                  </span>
                )}
              </div>

              <div className="profile-info-item">
                <FaCalendarAlt className="profile-info-icon" />
                <span className="profile-info-text profile-info-text--empty">
                  Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>

              {/* Gender Selection */}
              <div className="profile-info-item">
                {formData.gender === "Female" ? (
                  <FaVenus className="profile-info-icon" />
                ) : formData.gender === "Male" ? (
                  <FaMars className="profile-info-icon" />
                ) : (
                  <FaUser className="profile-info-icon" />
                )}
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="profile-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <span className={`profile-info-text ${!formData.gender ? 'profile-info-text--empty' : ''}`}>
                    {formData.gender || "Not set"}
                  </span>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="profile-button-group">
                <button onClick={handleSave} className="profile-button profile-button--primary">
                  <FaSave /> Save
                </button>
                <button onClick={handleCancelEdit} className="profile-button profile-button--secondary">
                  <FaTimes /> Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="profile-button profile-button--outline">
                <FaEdit /> Edit Profile
              </button>
            )}
          </motion.div>

          {/* Stats & Activity Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="profile-activity-card"
          >
            <h3 className="profile-activity-title">Activity Overview</h3>

            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <FaBox className="profile-stat-icon" />
                <div className="profile-stat-value">{userProducts.length}</div>
                <div className="profile-stat-label">Listings</div>
              </div>

              <div className="profile-stat-card">
                <FaHeart className="profile-stat-icon" />
                <div className="profile-stat-value">{favorites.length}</div>
                <div className="profile-stat-label">Wishlist</div>
              </div>

              <div className="profile-stat-card">
                <FaShoppingCart className="profile-stat-icon" />
                <div className="profile-stat-value">{cart.length}</div>
                <div className="profile-stat-label">Cart Items</div>
              </div>

              <div className="profile-stat-card">
                <FaStar className="profile-stat-icon" />
                <div className="profile-stat-value">{totalSold}</div>
                <div className="profile-stat-label">Sold</div>
              </div>
            </div>

            {totalEarnings > 0 && (
              <div className="profile-earnings-card">
                <div className="profile-earnings-label">Total Earnings</div>
                <div className="profile-earnings-value">PKR {totalEarnings.toFixed(2)}</div>
              </div>
            )}

            {/* Password Change Section */}
            <div className="profile-password-section">
              <div className="profile-password-header">
                <h4 className="profile-password-title">
                  <FaLock /> Change Password
                </h4>
                {!isEditingPassword && (
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="profile-password-edit-btn"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingPassword ? (
                <div className="profile-password-form">
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Current password"
                    className="profile-password-input"
                  />
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="New password"
                    className="profile-password-input"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="profile-password-input"
                  />
                  <div className="profile-button-group">
                    <button onClick={handlePasswordSave} className="profile-button profile-button--primary">
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPassword(false);
                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      }}
                      className="profile-button profile-button--secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="profile-password-text">Click Edit to change your password</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* My Listings */}
        {userProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="profile-listings-section"
          >
            <h3 className="profile-listings-title">
              My Listings ({userProducts.length})
            </h3>
            <div className="profile-listings-grid">
              {userProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="profile-listing-card"
                >
                  <div
                    className="profile-listing-image"
                    style={{
                      backgroundImage: product.image ? `url(${product.image})` : 'none',
                      backgroundColor: product.image ? 'transparent' : '#ddd'
                    }}
                  >
                    {product.sold && (
                      <div className="profile-listing-sold-badge">SOLD</div>
                    )}
                  </div>
                  <div className="profile-listing-info">
                    <h4 className="profile-listing-title">{product.title}</h4>
                    <div className="profile-listing-price">PKR {product.price}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

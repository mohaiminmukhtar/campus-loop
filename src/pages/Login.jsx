import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { 
  FaUser, FaLock, FaArrowRight, FaGraduationCap, FaUserPlus, 
  FaIdCard, FaVenusMars, FaCheckCircle, FaUpload
} from "react-icons/fa";
import "../styles/LoginNew.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
    name: "",
    gender: "",
    studentCard: null,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleStudentIdChange = (e) => {
    let value = e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase();

    // Auto-insert dashes for format sp22-bse-051
    if (value.length > 2 && !value.includes("-") && /^(sp|fa)\d{2}/.test(value)) {
      value = value.slice(0, 4) + "-" + value.slice(4);
    }
    if (value.length > 8 && value.split("-").length === 2) {
      value = value.slice(0, 8) + "-" + value.slice(8);
    }

    setFormData(prev => ({ ...prev, studentId: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate student ID
    const pattern = /^(sp|fa)\d{2}-[a-z]{3}-\d{3}$/i;
    if (!pattern.test(formData.studentId)) {
      setError("Invalid format. Use: sp22-bse-051 or fa22-bse-051");
      return;
    }

    // Signup validation
    if (isSignUp) {
      if (!formData.name.trim()) { setError("Full Name is required."); return; }
      if (!formData.password || formData.password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (!formData.gender) { setError("Please select your gender."); return; }
      if (!formData.studentCard) { setError("Please upload your student card."); return; }
    } else {
      if (!formData.password) { setError("Password is required."); return; }
    }

    setIsLoading(true);

    const result = isSignUp
      ? await signup(
          formData.studentId, 
          formData.password, 
          formData.name, 
          formData.gender, 
          formData.studentCard
        )
      : await login(formData.studentId, formData.password);

    setIsLoading(false);

    if (result.success) {
      // Navigate immediately after successful login
      navigate("/");
    } else {
      setError(result.error || (isSignUp ? "Sign up failed." : "Login failed."));
    }
  };

  return (
    <div className="login-page">
      {/* Animated Background Circles */}
      <div className="login-bg-circle"></div>
      <div className="login-bg-circle"></div>
      <div className="login-bg-circle"></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="login-wrapper">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="login-card">

          {/* Logo Section */}
          <div className="login-logo">
            <motion.img 
              src="/logo.PNG" 
              alt="CampusLoop" 
              className="login-logo-img"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            />
            <h1 className="login-logo-text">CampusLoop</h1>
            <p className="login-logo-tagline">Your Campus Marketplace</p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="login-error"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>

            {/* Sign Up fields */}
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="login-form-group"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="login-label">
                      <FaUser /> Full Name
                    </label>
                    <motion.div 
                      className={`login-input-wrapper ${focusedField === 'name' ? 'focused' : ''}`}
                      whileFocus={{ scale: 1.02 }}
                    >
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Your full name" 
                        className="login-input" 
                        required
                      />
                      {formData.name && <FaCheckCircle className="login-check-icon" />}
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className="login-form-group"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="login-label">
                      <FaVenusMars /> Gender
                    </label>
                    <div className="login-gender-options">
                      {['Male', 'Female', 'Other'].map((option) => (
                        <motion.button
                          key={option}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, gender: option }))}
                          className={`login-gender-btn ${formData.gender === option ? 'active' : ''}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div 
                    className="login-form-group"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="login-label">
                      <FaIdCard /> Student Card
                    </label>
                    <motion.label 
                      className={`login-file-upload ${formData.studentCard ? 'has-file' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input 
                        type="file" 
                        name="studentCard" 
                        accept="image/*,application/pdf" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setFormData(prev => ({ ...prev, studentCard: file }));
                          setFileName(file?.name || "");
                        }}
                        className="login-file-input" 
                        required
                      />
                      <FaUpload />
                      <span>{fileName || "Upload Student Card"}</span>
                      {formData.studentCard && <FaCheckCircle className="login-file-check" />}
                    </motion.label>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Student ID */}
            <motion.div 
              className="login-form-group"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: isSignUp ? 0.4 : 0.1 }}
            >
              <label className="login-label">
                <FaGraduationCap /> Student ID
              </label>
              <motion.div 
                className={`login-input-wrapper ${focusedField === 'studentId' ? 'focused' : ''}`}
                whileFocus={{ scale: 1.02 }}
              >
                <input 
                  type="text" 
                  name="studentId" 
                  value={formData.studentId} 
                  onChange={handleStudentIdChange}
                  onFocus={() => setFocusedField('studentId')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g., sp22-bse-051" 
                  maxLength={12} 
                  required 
                  className="login-input"
                />
                {formData.studentId.length >= 12 && <FaCheckCircle className="login-check-icon" />}
              </motion.div>
              <div className="login-input-hint">
                Format: <span className="login-hint-example">spxx-xxx-xxx</span> or <span className="login-hint-example">faxx-xxx-xxx</span>
              </div>
            </motion.div>

            {/* Password */}
            <motion.div 
              className="login-form-group"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: isSignUp ? 0.5 : 0.2 }}
            >
              <label className="login-label">
                <FaLock /> Password
              </label>
              <motion.div 
                className={`login-input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}
                whileFocus={{ scale: 1.02 }}
              >
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={isSignUp ? "Create password (min 6 chars)" : "Enter your password"} 
                  className="login-input" 
                  required
                />
                {formData.password.length >= 6 && <FaCheckCircle className="login-check-icon" />}
              </motion.div>
            </motion.div>

            <motion.button 
              type="submit" 
              disabled={isLoading} 
              whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(220, 20, 60, 0.4)" }} 
              whileTap={{ scale: 0.98 }} 
              className="login-button"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: isSignUp ? 0.6 : 0.3 }}
            >
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="login-loading"
                >
                  <div className="login-spinner"></div>
                  <span>{isSignUp ? "Creating account..." : "Logging in..."}</span>
                </motion.div>
              ) : (
                <motion.div
                  className="login-button-content"
                >
                  <span>{isSignUp ? "Sign Up" : "Login"}</span>
                  <FaArrowRight />
                </motion.div>
              )}
            </motion.button>
          </form>

          {/* Toggle between Login and Sign Up */}
          <motion.div 
            className="login-toggle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="login-toggle-text">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <motion.button
              onClick={() => { 
                setIsSignUp(!isSignUp); 
                setError(""); 
                setFormData({ studentId: "", password: "", name: "", gender: "", studentCard: null }); 
                setFileName("");
              }}
              className="login-toggle-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSignUp ? (
                <>
                  <FaGraduationCap /> Login
                </>
              ) : (
                <>
                  <FaUserPlus /> Sign Up
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

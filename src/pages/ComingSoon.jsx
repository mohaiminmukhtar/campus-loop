import { motion } from "framer-motion";
import { FaGavel } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/ComingSoon.css";

export default function ComingSoon() {
  return (
    <div className="coming-soon-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="coming-soon-container"
      >
        <div className="coming-soon-icon">
          <FaGavel />
        </div>

        <h1 className="coming-soon-title">Coming Soon</h1>

        <p className="coming-soon-description">
          This feature is currently under development.
        </p>

        <Link to="/products" className="coming-soon-button">
          Browse Products
        </Link>
      </motion.div>
    </div>
  );
}

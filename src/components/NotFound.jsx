import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255, 106, 42, 0.03) 0%, transparent 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Poppins', sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >

      <motion.h1
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
        style={{
          fontSize: "8rem",
          fontWeight: "900",
          marginBottom: "1rem",
          background: "linear-gradient(135deg, #FF6A2A, #FF8A47)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 8px rgba(255, 106, 42, 0.4))",
        }}
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ fontSize: "1.5rem", marginBottom: "2rem", color: "#2B2B2C", opacity: "0.7" }}
      >
        The page you are looking for does not exist.
      </motion.p>

      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        onClick={() => navigate("/")}
        style={{
          background: "linear-gradient(90deg, #FF6A2A, #FF8A47)",
          color: "#FFFFFF",
          padding: "0.8rem 2rem",
          fontSize: "1.1rem",
          fontWeight: "700",
          borderRadius: "50px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(255, 106, 42, 0.4), 0 0 40px rgba(255, 106, 42, 0.2)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 0 30px rgba(255, 106, 42, 0.6), 0 0 60px rgba(255, 106, 42, 0.3)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 0 20px rgba(255, 106, 42, 0.4), 0 0 40px rgba(255, 106, 42, 0.2)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        Go Home
      </motion.button>
    </div>
  );
}

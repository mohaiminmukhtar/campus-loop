import React from "react";
import { motion } from "framer-motion";
import "../styles/LogoIntro.css";

export default function LogoIntro() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2.8, duration: 0.8, ease: "easeInOut" }}
      className="logo-intro"
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="intro-bg-gradient"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 1, 1, 0],
          background: [
            "radial-gradient(circle at 50% 50%, rgba(255,106,42,0.15) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 50%, rgba(255,106,42,0.25) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 50%, rgba(255,106,42,0.15) 0%, transparent 70%)",
          ]
        }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="intro-particle"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50,
            opacity: 0 
          }}
          animate={{ 
            y: -50,
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 1.5,
            ease: "linear"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
          }}
        />
      ))}

      <div className="logo-intro-content">
        {/* Logo with Advanced Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: [180, 0, 0],
          }}
          transition={{ 
            duration: 1.2,
            ease: [0.34, 1.56, 0.64, 1]
          }}
          className="logo-wrapper"
        >
          <motion.img
            src="/logo.PNG"
            alt="Campusloop Logo"
            animate={{
              filter: [
                "drop-shadow(0 0 20px rgba(255,106,42,0.6))",
                "drop-shadow(0 0 40px rgba(255,106,42,0.9))",
                "drop-shadow(0 0 20px rgba(255,106,42,0.6))",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="logo-intro-image"
          />
        </motion.div>

        {/* Text with Letter Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="logo-intro-text-wrapper"
        >
          <h1 className="logo-intro-text">
            {"CampusLoop".split("").map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.8 + i * 0.05,
                  duration: 0.3
                }}
                style={{ display: "inline-block" }}
              >
                {letter}
              </motion.span>
            ))}
          </h1>
          
          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="logo-intro-tagline"
          >
            Your Campus Marketplace
          </motion.p>
        </motion.div>

        {/* Loading Bar */}
        <motion.div
          className="intro-loading-bar"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import Spline from "@splinetool/react-spline";
import "../styles/Hero.css";

export default function Hero() {
  const navigate = useNavigate();
  const goToProducts = () => navigate("/products");
  const goToSell = () => navigate("/sell");

  const [deviceType, setDeviceType] = useState("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setDeviceType("mobile");
      } else if (width <= 768) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="hero-section">
      {/* Hero Banner with Spline 3D Scene */}
      <div className="hero-banner">
        <div className="hero-spline-container">
          <Spline scene="https://prod.spline.design/rhoT3UO3kAxkMnFW/scene.splinecode" />
        </div>

        {/* Hero Text */}
        <div className="hero-text-container">
          <h1 className="hero-title">Your Campus Marketplace</h1>
          <p className="hero-subtitle">
            Buy, sell, and exchange everything you need for campus life.
          </p>
          <div className="hero-buttons">
            <button
              onClick={goToProducts}
              className={`hero-button primary ${deviceType}`}
            >
              Start Shopping
            </button>
            <button
              onClick={goToSell}
              className={`hero-button secondary ${deviceType}`}
            >
              Sell Your Items
            </button>
          </div>
        </div>

        {/* Badge Cover Card */}
        <div className="hero-badge-cover">
          <img src="/logo.PNG" alt="Campusloop" className="badge-cover-logo" />
          <span className="badge-cover-text">Campusloop</span>
        </div>
      </div>
    </section>
  );
}

import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import "../styles/CategorySlider.css";
import {
  FaExchangeAlt,
  FaHandshake,
  FaTshirt,
  FaPlug,
  FaGift,
  FaCouch,
  FaLaptopCode,
} from "react-icons/fa";

const CATEGORIES = [
  { slug: "rentals", icon: <FaExchangeAlt />, title: "Rentals", desc: "Rent furniture, electronics, and more at student-friendly prices." },
  { slug: "barter", icon: <FaHandshake />, title: "Barter", desc: "Trade items with fellow students - no money needed!" },
  { slug: "fashion", icon: <FaTshirt />, title: "Fashion", desc: "Buy and sell clothing, shoes, and fashion items." },
  { slug: "electronics", icon: <FaPlug />, title: "Electronics", desc: "Electronics, gadgets, and tech products at great prices." },
  { slug: "free-for-all", icon: <FaGift />, title: "Free for All", desc: "Free items for anyone to claim - give and receive!" },
  { slug: "furniture", icon: <FaCouch />, title: "Furniture", desc: "Furniture, room decor, and home essentials." },
  { slug: "digital-services", icon: <FaLaptopCode />, title: "Digital Services", desc: "Freelance services, tutoring, design, coding, and more." },
];

export default function CategorySlider() {
  const controls = useAnimation();
  const containerRef = useRef();

  const repeatedCategories = Array(3).fill(CATEGORIES).flat();

  useEffect(() => {
    controls.start({
      x: ["0%", "-33.33%"],
      transition: {
        x: { repeat: Infinity, repeatType: "loop", duration: 50, ease: "linear" },
      },
    });
  }, [controls]);

  const handleCategoryClick = (slug) => {
    // Navigate to category page or filter products
    window.location.href = `/#categories?category=${slug}`;
  };

  return (
    <div className="category-slider">
      <h2 className="category-slider-title">
        Shop by Category
        <span className="category-slider-underline" />
      </h2>

      <motion.div
        animate={controls}
        ref={containerRef}
        className="category-slider-track"
      >
        {repeatedCategories.map((category, idx) => (
          <motion.div
            key={`${category.slug}-${idx}`}
            className="category-slider-card"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 18px 50px rgba(255,178,77,0.25), 0 0 35px rgba(255,102,0,0.15)",
            }}
            onClick={() => handleCategoryClick(category.slug)}
          >
            <div className="category-slider-icon-wrapper" aria-label={category.title}>
              {category.icon}
            </div>
            <h3 className="category-slider-card-title">
              {category.title}
            </h3>
            <p className="category-slider-card-desc">
              {category.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}


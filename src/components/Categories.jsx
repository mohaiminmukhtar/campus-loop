import React from "react";
import { useNavigate } from "react-router-dom";
import { FaExchangeAlt, FaHandshake, FaTshirt, FaPlug, FaGift, FaCouch, FaLaptopCode } from "react-icons/fa";
import "../styles/Categories.css";

const HomeCategories = () => {
  const navigate = useNavigate();
  
  const categories = [
    { name: "Rentals", icon: <FaExchangeAlt />, slug: "rentals" },
    { name: "Barter", icon: <FaHandshake />, slug: "barter" },
    { name: "Fashion", icon: <FaTshirt />, slug: "fashion" },
    { name: "Electronics", icon: <FaPlug />, slug: "electronics" },
    { name: "Free for All", icon: <FaGift />, slug: "free-for-all" },
    { name: "Furniture", icon: <FaCouch />, slug: "furniture" },
    { name: "Digital Services", icon: <FaLaptopCode />, slug: "digital-services" },
  ];

  return (
    <div className="categories-wrapper">
      <div className="categories-header">
        <h2 className="categories-title">Browse by Category</h2>
        <p className="categories-subtitle">Find exactly what you're looking for</p>
      </div>
      <div className="categories-row">
        {categories.map((c, index) => (
          <div
            key={index}
            className="categories-box"
            onClick={() => navigate(`/products?category=${c.slug}`)}
          >
            <div className="categories-icon">{c.icon}</div>
            <p className="categories-name">{c.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeCategories;

import React from "react";
import { motion } from "framer-motion";
import "../styles/About.css";

export default function About() {
  return (
    <>

      <section className="about-hero">
        {/* HERO TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="about-hero-title"
        >
          Welcome to Campusloop
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="about-hero-subtitle"
        >
          A secure, student-only marketplace built exclusively for university communities. 
          Buy, sell, rent, or exchange goods with verified students in a trusted environment.
        </motion.p>

        {/* SECTION: WHO WE ARE */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="about-section"
        >
          <h2 className="about-section-title">
            Who We Are
          </h2>
          <p className="about-section-text">
            Campusloop is a student-focused marketplace platform designed to solve the challenges students face 
            when buying and selling items. We create a <strong>safe, verified community</strong> where only 
            university students can trade books, electronics, furniture, fashion, and more — all within their campus ecosystem.
          </p>
        </motion.div>

        {/* SECTION: OUR MISSION, VISION, VALUES */}
        <div className="about-cards-grid">
          {[
            {
              title: "Our Mission",
              text: "To create a trusted marketplace where students can affordably buy, sell, and exchange essential items while building a sustainable campus community.",
            },
            {
              title: "Our Vision",
              text: "To become the go-to platform for student commerce across universities, fostering affordability, sustainability, and student entrepreneurship.",
            },
            {
              title: "Our Values",
              text: "Trust, safety, affordability, and community. We verify every student to ensure a scam-free environment where students help each other thrive.",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              className="about-card"
            >
              <h3 className="about-card-title">
                {card.title}
              </h3>
              <p className="about-card-text">
                {card.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* SECTION: WHAT WE OFFER */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="about-section"
        >
          <h2 className="about-section-title">
            What We Offer
          </h2>

          <div className="about-offer-grid">
            {["Verified Student Accounts", "Secure Marketplace", "Live Bidding System", "Multiple Categories", "Wishlist & Cart", "Real-time Chat", "Product Rentals", "Barter Exchange"].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="about-offer-item"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </motion.div>


      {/* NEW SECTION: OUR STORY */}
      <section className="about-story-section">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="about-story-title"
        >
          Our Story
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="about-story-text"
        >
          Campusloop was born from a simple observation: students struggle with unreliable public marketplaces filled with scams and irrelevant listings. We created a platform exclusively for verified university students to trade safely within their campus community. Today, Campusloop helps students save money, reduce waste, and support each other through responsible commerce.
        </motion.p>
      </section>

      {/* NEW SECTION: THE CAMPUSLOOP ECOSYSTEM */}
      <section className="about-ecosystem-section">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="about-ecosystem-title"
        >
          The Campusloop Ecosystem
        </motion.h2>
        <div className="about-ecosystem-grid">
          {[
            {
              title: "Verified Marketplace",
              text: "Every user is verified through their university credentials, ensuring a safe and trusted trading environment free from scammers.",
            },
            {
              title: "Live Hunting",
              text: "Participate in real-time bidding auctions for exclusive items. Compete with other students to win great deals on products.",
            },
            {
              title: "Multiple Categories",
              text: "Browse through Rentals, Barter, Fashion, Electronics, Free for All, Furniture, and Digital Services — everything students need.",
            },
            {
              title: "Smart Features",
              text: "Wishlist your favorite items, add to cart, chat with sellers, track your bids, and manage your listings all in one place.",
            },
            {
              title: "Student Community",
              text: "Connect with fellow students, share resources, exchange items, and build a sustainable campus economy together.",
            },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="about-ecosystem-card"
            >
              <h3 className="about-ecosystem-card-title">{c.title}</h3>
              <p className="about-ecosystem-card-text">{c.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW SECTION: TIMELINE */}
      <section className="about-timeline-section">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="about-timeline-title"
        >
          Your Journey With Campusloop
        </motion.h2>
        <div className="about-timeline-container">
          {["Sign Up & Verify", "Browse Products", "Add to Wishlist or Cart", "Chat With Sellers", "Make a Purchase or Bid", "List Your Own Items"].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className={`about-timeline-item ${index % 2 === 0 ? 'even' : ''}`}
            >
              Step {index + 1}: {step}
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW SECTION: SUCCESS STATS */}
      <section className="about-stats-section">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="about-stats-title"
        >
          Campusloop in Numbers
        </motion.h2>
        <div className="about-stats-grid">
          {["100% Verified Students", "8 Product Categories", "Live Bidding System", "Secure & Trusted Platform"].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="about-stat-card"
            >
              {stat}
            </motion.div>
          ))}
        </div>
      </section>

      </section>
    </>
  );
}

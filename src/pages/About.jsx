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
          The leading Amazon FBA Academy for UAE & KSA sellers. We transform beginners into confident,
          profitable e-commerce entrepreneurs with expert-guided training, real-world strategies, and
          weekly live mentorship.
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
            Campusloop is a modern Amazon training platform created for ambitious individuals ready to build
            long-term income. Our programs are built on years of hands-on Amazon experience in multiple
            marketplaces — especially <strong>UAE & Saudi Arabia</strong>, the fastest-growing e-commerce
            regions in the world.
          </p>
        </motion.div>

        {/* SECTION: OUR MISSION, VISION, VALUES */}
        <div className="about-cards-grid">
          {[
            {
              title: "Our Mission",
              text: "To empower global entrepreneurs with the knowledge, tools, and mentorship needed to build profitable Amazon FBA businesses and achieve financial independence.",
            },
            {
              title: "Our Vision",
              text: "To become the most trusted and impactful Amazon academy in the Middle East, helping thousands build successful online brands.",
            },
            {
              title: "Our Values",
              text: "Integrity, transparency, innovation, and student success. We believe in teaching strategies that truly work — no shortcuts, no false promises.",
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
            {["Amazon UAE/KSA Training", "Product Hunting Mastery", "Supplier Sourcing Guidance", "Private Label Coaching", "Amazon PPC Advertising", "SEO & Ranking Strategies", "Weekly Live Sessions", "Student Community & Support"].map((item, index) => (
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
          Campusloop began as a small initiative to help friends and colleagues enter the booming world of Amazon selling. As demand grew, so did our mission. Today, Campusloop is a global Amazon FBA academy trusted by students across the UAE, KSA, Pakistan, India, and beyond. Our goal has remained the same — to make e-commerce success accessible, structured, and achievable for everyone.
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
              title: "Campusloop Academy",
              text: "Our flagship education platform offering structured Amazon FBA courses, beginner to advanced modules, and deep-dive masterclasses.",
            },
            {
              title: "Campusloop Live Mentorship",
              text: "Weekly live classes, Q&A sessions, success strategies, and real-time product analysis directly with our expert mentors.",
            },
            {
              title: "Campusloop Community",
              text: "A private network of Amazon sellers, sharing insights, discoveries, supplier recommendations, and marketplace updates.",
            },
            {
              title: "Campusloop Tools & Templates",
              text: "Access product research sheets, sourcing templates, PL branding guides, PPC structures, and AI-powered scripts.",
            },
            {
              title: "Campusloop PL Accelerator",
              text: "A dedicated program for students who want to launch their private label brand, from idea to sourcing to listing launch.",
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
          {["Enroll in the Academy", "Learn Product Hunting & Sourcing", "Create Your Amazon Account", "Build a Winning Listing", "Launch With PPC", "Scale With Mentorship"].map((step, index) => (
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
          {["1200+ Students Trained", "300+ Private Labels Built", "7+ Years Amazon Experience", "Active Across 8+ Countries"].map((stat, index) => (
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

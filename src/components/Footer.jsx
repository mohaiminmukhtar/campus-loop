import React, { useState } from "react";
import { FaWhatsapp, FaEnvelope, FaFacebook, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import emailjs from "emailjs-com";
import "../styles/Footer.css";

export default function Footer() {
  const email = import.meta.env.VITE_RECEIVER_EMAIL || "support@campusloop.com";
  const whatsapp = import.meta.env.VITE_WHATSAPP || "971501234567";
  const facebook = import.meta.env.VITE_FACEBOOK || "https://facebook.com/campusloop";
  const instagram = import.meta.env.VITE_INSTAGRAM || "https://instagram.com/campusloop";

  // Updated Quick Links (matching Campusloop app/navigation)
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Chat", path: "/chat" },
    { name: "About", path: "/about" },
    { name: "Cart", path: "/cart" },
  ];

  const socialLinks = [
    { icon: FaEnvelope, url: `mailto:${email}` },
    { icon: FaWhatsapp, url: `https://wa.me/${whatsapp}` },
    { icon: FaFacebook, url: facebook },
    { icon: FaInstagram, url: instagram },
  ];

  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscriberEmail) return alert("Please enter your email");

    setSubmitting(true);
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { email: subscriberEmail },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setPopup("Subscribed successfully!");
      setSubscriberEmail("");
      setTimeout(() => setPopup(""), 2000);
    } catch (err) {
      console.error(err);
      setPopup("Subscription failed. Try again.");
      setTimeout(() => setPopup(""), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="footer">

      {/* Popup */}
      {popup && <div className="footer-popup">{popup}</div>}

      {/* Logo + Description */}
      <div className="footer-logo-text">
        <img src="/logo.PNG" alt="Campusloop" className="footer-logo" />

        <p className="footer-description">
          Campusloop is a secure, student-only marketplace built for university
          communities. Students often struggle with unreliable public platforms
          filled with scams and irrelevant listings. Campusloop solves this by
          creating a trusted environment where only verified students can buy, sell,
          rent, or exchange goods such as books, electronics, hostel essentials,
          and project materials. The platform encourages affordability,
          sustainability, and student entrepreneurship.
        </p>
      </div>

      {/* Quick Links + Trusted Card */}
      <div className="footer-links-services">

        {/* Quick Links */}
        <div>
          <h3 className="footer-quick-links-title">Quick Links</h3>
          <ul className="footer-quick-links-list">
            {quickLinks.map((link, i) => (
              <li key={i} className="footer-quick-links-item">
                <Link to={link.path} className="footer-link">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Trusted Section */}
        <div className="footer-trusted-card">
          <h3 className="footer-trusted-title">Trusted Community</h3>
          <p className="footer-trusted-text">
            Campusloop maintains a safe marketplace by verifying every student
            through their university details. This ensures genuine listings,
            prevents scams, and builds a close-knit student community focused on
            sharing resources, reducing costs, and enabling students to help each
            other through responsible trading.
          </p>
        </div>
      </div>

      {/* Newsletter + Social */}
      <div className="footer-newsletter-section">
        <h3 className="footer-newsletter-title">Stay Connected</h3>

        <div className="footer-social-links">
          {socialLinks.map(({ icon: Icon, url }, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Icon className="footer-social-icon" />
            </a>
          ))}
        </div>

        <form onSubmit={handleSubscribe} className="footer-newsletter-form">
          <input
            type="email"
            placeholder="Subscribe to newsletter"
            className="footer-newsletter-input"
            value={subscriberEmail}
            onChange={(e) => setSubscriberEmail(e.target.value)}
          />

          <button className="footer-newsletter-button" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Subscribe"}
          </button>
        </form>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} Campusloop. All rights reserved.
      </div>

    </footer>
  );
}

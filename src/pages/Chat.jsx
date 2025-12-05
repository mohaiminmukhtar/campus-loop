import React from "react";
import { motion } from "framer-motion";
import { FaComments, FaClock, FaBell } from "react-icons/fa";
import "../styles/Chat.css";

export default function Chat() {
  return (
    <div className="chat-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="chat-container"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="chat-icon-container"
        >
          <FaComments />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="chat-title"
        >
          Chat System
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="chat-badge"
        >
          <FaClock />
          <span>Coming Soon</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="chat-subtitle"
        >
          We're working hard to bring you an amazing chat experience! Soon you'll be able to
          message sellers directly, ask questions about products, and negotiate deals in real-time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="chat-features"
        >
          <div className="chat-feature">
            <FaBell className="chat-feature-icon-small" />
            <div className="chat-feature-content">
              <div className="chat-feature-title">
                Get Notified
              </div>
              <div className="chat-feature-text">
                We'll let you know when chat is ready!
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


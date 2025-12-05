import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaGavel, FaClock, FaFire, FaTrophy, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import "../styles/LiveHuntingGuide.css";

export default function LiveHuntingGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if guide has been shown in this session
    const hasSeenGuide = sessionStorage.getItem('hasSeenLiveHuntingGuide');
    
    if (!hasSeenGuide) {
      // Show guide after 1 second
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('hasSeenLiveHuntingGuide', 'true');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      icon: <FaGavel />,
      title: "Welcome to Live Hunting!",
      description: "Bid on exclusive items and win amazing deals. Here's how it works:",
      color: "#FF6A2A",
      features: [
        "Browse live auctions from fellow students",
        "Place bids on items you want",
        "Win items at competitive prices"
      ]
    },
    {
      icon: <FaClock />,
      title: "Time is Ticking",
      description: "Every auction has a countdown timer. Act fast!",
      color: "#FFD700",
      features: [
        "Watch the countdown timer on each item",
        "Items marked 'Ending Soon' have < 24 hours left",
        "Auction ends when timer reaches zero"
      ]
    },
    {
      icon: <FaFire />,
      title: "Hot Bids & Competition",
      description: "See what's trending and join the action:",
      color: "#FF4500",
      features: [
        "'Hot' badges show items with 10+ bids",
        "Current bid shows the highest offer",
        "Bid count shows total competition"
      ]
    },
    {
      icon: <FaTrophy />,
      title: "How to Win",
      description: "Follow these tips to secure your items:",
      color: "#4CAF50",
      features: [
        "Click any auction card to view details",
        "Place your bid higher than current bid",
        "Highest bidder when timer ends wins!",
        "You'll be notified if you're outbid"
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hunting-guide-backdrop"
            onClick={handleClose}
          />

          {/* Guide Popup */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="hunting-guide-popup"
          >
            {/* Close Button */}
            <button onClick={handleClose} className="hunting-guide-close">
              <FaTimes />
            </button>

            {/* Animated Background Glow */}
            <div className="hunting-guide-glow" style={{ background: `radial-gradient(circle at 50% 50%, ${steps[currentStep].color}20 0%, transparent 70%)` }} />

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="hunting-guide-content"
              >
                {/* Icon */}
                <motion.div
                  className="hunting-guide-icon"
                  style={{ background: `linear-gradient(135deg, ${steps[currentStep].color}, ${steps[currentStep].color}dd)` }}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {steps[currentStep].icon}
                </motion.div>

                {/* Title */}
                <h2 className="hunting-guide-title">
                  {steps[currentStep].title}
                </h2>

                {/* Description */}
                <p className="hunting-guide-description">
                  {steps[currentStep].description}
                </p>

                {/* Features List */}
                <div className="hunting-guide-features">
                  {steps[currentStep].features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="hunting-guide-feature"
                    >
                      <FaCheckCircle style={{ color: steps[currentStep].color }} />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress Dots */}
            <div className="hunting-guide-progress">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`hunting-guide-dot ${index === currentStep ? 'active' : ''}`}
                  onClick={() => setCurrentStep(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: index === currentStep ? steps[currentStep].color : '#E0E0E0'
                  }}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="hunting-guide-actions">
              {currentStep < steps.length - 1 ? (
                <>
                  <button onClick={handleSkip} className="hunting-guide-btn hunting-guide-btn-skip">
                    Skip Guide
                  </button>
                  <button 
                    onClick={handleNext} 
                    className="hunting-guide-btn hunting-guide-btn-next"
                    style={{ background: `linear-gradient(135deg, ${steps[currentStep].color}, ${steps[currentStep].color}dd)` }}
                  >
                    Next <FaArrowRight />
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleClose} 
                  className="hunting-guide-btn hunting-guide-btn-start"
                  style={{ background: `linear-gradient(135deg, ${steps[currentStep].color}, ${steps[currentStep].color}dd)` }}
                >
                  <FaTrophy /> Start Hunting!
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

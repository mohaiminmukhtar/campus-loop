import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaRocket, FaShoppingBag, FaHeart, FaGavel, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function WelcomePopup() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenWelcomeThisSession = sessionStorage.getItem('hasSeenWelcomeThisSession');
    
    if (!hasSeenWelcomeThisSession && user) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('hasSeenWelcomeThisSession', 'true');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const features = [
    {
      icon: <FaShoppingBag />,
      title: "Browse & Shop",
      description: "Explore products across 7 categories from fellow students",
      color: "#FF6A2A"
    },
    {
      icon: <FaGavel />,
      title: "Bid & Win",
      description: "Participate in auctions and get amazing deals",
      color: "#FF8A47"
    },
    {
      icon: <FaHeart />,
      title: "Save Favorites",
      description: "Keep track of items you love and never miss out",
      color: "#FFB347"
    },
    {
      icon: <FaRocket />,
      title: "Sell Easily",
      description: "List your items in minutes and reach your campus community",
      color: "#FF6A2A"
    }
  ];

  const handleClose = () => setIsVisible(false);

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const userName = user?.user_metadata?.name || user?.user_metadata?.studentId?.toUpperCase() || 'Student';

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              zIndex: 9998
            }}
          />

          {/* Centering Container */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
              pointerEvents: 'none'
            }}
          >
            {/* Popup */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
                borderRadius: '20px',
                padding: '1.75rem 1.5rem',
                maxWidth: '460px',
                width: '100%',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(255, 106, 42, 0.2)',
                overflow: 'hidden',
                position: 'relative',
                pointerEvents: 'auto'
              }}
            >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '0.875rem',
                right: '0.875rem',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#2B2B2C',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}
            >
              <FaTimes />
            </button>

            {/* Confetti Animation */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 400,
                    y: Math.random() * 400 + 200,
                    opacity: 0,
                    rotate: Math.random() * 720
                  }}
                  transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
                  style={{
                    position: 'absolute',
                    width: '10px',
                    height: '10px',
                    top: '20%',
                    background: ['#FF6A2A', '#FF8A47', '#FFB347', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 5)],
                    left: `${50 + (Math.random() - 0.5) * 20}%`,
                  }}
                />
              ))}
            </div>

            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ textAlign: 'center', marginBottom: '1.25rem', flexShrink: 0 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 0.875rem',
                  background: 'linear-gradient(135deg, #FF6A2A, #FF8A47)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(255, 106, 42, 0.4)'
                }}
              >
                <FaCheckCircle style={{ fontSize: '1.875rem', color: 'white' }} />
              </motion.div>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #FF6A2A, #FF8A47, #FFB347)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 0.5rem 0',
                lineHeight: 1.2
              }}>
                Welcome, {userName}!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#2B2B2C', opacity: 0.7, margin: 0, lineHeight: 1.3 }}>
                Let's explore what you can do on CampusLoop
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div style={{ height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', flexShrink: 0 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  style={{
                    background: 'white',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    border: `3px solid ${features[currentStep].color}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      width: '65px',
                      height: '65px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      fontSize: '2rem',
                      color: 'white',
                      background: features[currentStep].color,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      flexShrink: 0
                    }}
                  >
                    {features[currentStep].icon}
                  </motion.div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#2B2B2C',
                    margin: '0 0 0.5rem 0',
                    lineHeight: 1.25,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    {features[currentStep].title}
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#2B2B2C',
                    opacity: 0.7,
                    lineHeight: 1.4,
                    margin: 0,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    {features[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem', marginBottom: '1.25rem', flexShrink: 0 }}>
              {features.map((_, index) => (
                <motion.div
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: index === currentStep ? '28px' : '10px',
                    height: '10px',
                    borderRadius: index === currentStep ? '5px' : '50%',
                    background: index === currentStep ? features[currentStep].color : '#E0E0E0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexShrink: 0 }}>
              {currentStep < features.length - 1 ? (
                <>
                  <button 
                    onClick={handleClose}
                    style={{
                      padding: '0.75rem 1.75rem',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      flex: 1,
                      maxWidth: '180px',
                      background: '#F2F2F4',
                      color: '#2B2B2C'
                    }}
                  >
                    Skip
                  </button>
                  <button 
                    onClick={handleNext}
                    style={{
                      padding: '0.75rem 1.75rem',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: 'none',
                      flex: 1,
                      maxWidth: '180px',
                      background: 'linear-gradient(135deg, #FF6A2A, #FF8A47)',
                      color: 'white',
                      boxShadow: '0 4px 15px rgba(255, 106, 42, 0.4)'
                    }}
                  >
                    Next
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleClose}
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    maxWidth: '100%',
                    background: 'linear-gradient(135deg, #FF6A2A, #FF8A47)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(255, 106, 42, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FaRocket style={{ fontSize: '1rem' }} /> Get Started!
                </button>
              )}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

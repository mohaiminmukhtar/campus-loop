import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LogoIntro from "./components/LogoIntro";
import ConnectionStatus from "./components/ConnectionStatus";
import WelcomePopup from "./components/WelcomePopup";
import { ProductProvider } from "./context/ProductContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

// Storage Management
import { initStorageManagement } from "./utils/storageCleanup";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Wishlist from "./pages/Wishlist";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Sell from "./pages/Sell";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import ComingSoon from "./pages/ComingSoon";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'var(--bg-primary, #FFFFFF)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #FF6A2A', 
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#2B2B2C', fontSize: '1.1rem' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Main App Component
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showIntro, setShowIntro] = useState(() => {
    // Only show intro once per session
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    return !hasSeenIntro;
  });

  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('hasSeenIntro', 'true');
      }, 3600);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // Initialize storage management on app start
  useEffect(() => {
    initStorageManagement();
  }, []);

  return (
    <div className="app-root" style={{ background: "var(--bg-primary, #FFFFFF)", minHeight: "100vh" }}>
      {/* Logo Intro */}
      {showIntro && <LogoIntro />}

      <div
        style={{
          opacity: showIntro ? 0 : 1,
          transition: "opacity 1s ease-in-out",
          background: "var(--bg-primary, #FFFFFF)",
          minHeight: "100vh",
        }}
      >
        <ConnectionStatus />
        
        {/* Welcome Popup - Shows 15 seconds after login */}
        {isAuthenticated && <WelcomePopup />}
        
        {/* Show Navbar and Footer only when authenticated */}
        {isAuthenticated && <Navbar />}
        
        <main className="main-content">
          <Routes>
            {/* Public Route - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes - Require Authentication */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/bids" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/live-hunting" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            
            {/* Catch all - redirect to login if not authenticated, home if authenticated */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
          </Routes>
        </main>
        
        {/* Show Footer only when authenticated */}
        {isAuthenticated && <Footer />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <UserProvider>
          <ThemeProvider>
            <ProductProvider>
              <AppContent />
            </ProductProvider>
          </ThemeProvider>
        </UserProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

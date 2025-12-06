import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import BrowseSection from "../components/BrowseSection";
import CounterCard from "../components/CounterCard";
import { supabase } from "../supabaseClient";
import {
  FaUsers,
  FaShoppingBag,
  FaGavel,
  FaStar,
} from "react-icons/fa";
import "../styles/Home.css";

export default function Home() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    liveBids: 0,
    transactions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users count
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Get total products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Get live bids count (products with bidding enabled)
        const { count: liveBidsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('bidding_enabled', true);

        // Get sold products count (successful transactions)
        const { count: soldCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('sold', true);

        setStats({
          users: usersCount || 0,
          products: productsCount || 0,
          liveBids: liveBidsCount || 0,
          transactions: soldCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="home-page">

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <Hero
          logo="/logo.PNG"
          title="Your Campus Marketplace"
          subtitle="Buy, sell, rent, and exchange everything you need for campus life. Connect with students, save money, and build a sustainable community."
          cta1={{ text: "Start Shopping", onClick: () => window.location.href = "/products" }}
          cta2={{ text: "Sell Your Items", onClick: () => window.location.href = "/sell" }}
          extraText="Join 5,000+ students buying, selling, and trading on Campusloop"
        />
      </motion.div>

      {/* Categories Section */}
      <motion.section 
        id="categories"
        initial={{ opacity: 0, y: 50 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 1 }}
      >
        <Categories />
      </motion.section>

      {/* Live Hunting Banner */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="live-hunting-banner-section"
      >
        <motion.div
          className="live-hunting-banner"
          whileHover={{ scale: 1.02 }}
          onClick={() => window.location.href = "/live-hunting"}
        >
          <div className="banner-glow"></div>
          <div className="banner-content">
            <motion.div
              className="banner-icon"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🔥
            </motion.div>
            <div className="banner-text">
              <h2 className="banner-title">
                <span className="title-live">Live</span>
                <span className="title-hunting">Hunting</span>
              </h2>
              <p className="banner-subtitle">Bid on exclusive items before time runs out!</p>
            </div>
            <motion.button
              className="banner-cta"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Bidding →
            </motion.button>
          </div>
        </motion.div>
      </motion.section>

      {/* Browse Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 1, delay: 0.2 }}
      >
        <BrowseSection />
      </motion.section>

      {/* Counters Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="counters-section"
      >
        <div className="counters-container">
          <CounterCard icon={<FaUsers />} end={stats.users} label="Verified Students" color="#DC143C" />
          <CounterCard icon={<FaShoppingBag />} end={stats.products} label="Products Listed" color="#10b981" />
          <CounterCard icon={<FaGavel />} end={stats.liveBids} label="Live Auctions" color="#f97316" />
          <CounterCard icon={<FaStar />} end={stats.transactions} label="Successful Deals" color="#f59e0b" />
        </div>
      </motion.section>

    </div>
  );
}

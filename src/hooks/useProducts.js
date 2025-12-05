// useProducts.js - Hook for products with real-time sync
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load products
    const loadProducts = async () => {
      try {
        let query = supabase.from('products').select('*');

        // Apply filters
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.owner_id) {
          query = query.eq('owner_id', filters.owner_id);
        }
        if (filters.bidding_enabled !== undefined) {
          query = query.eq('bidding_enabled', filters.bidding_enabled);
        }

        // Sort by created_at descending
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    // Real-time subscription for product changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          loadProducts(); // Reload on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters.category, filters.owner_id, filters.bidding_enabled]);

  return { products, loading, error };
};

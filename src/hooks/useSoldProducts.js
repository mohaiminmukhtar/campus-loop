// useSoldProducts.js - Hook for sold products history
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useSoldProducts = (userId = null, type = 'all') => {
  const [soldProducts, setSoldProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Load sold products
    const loadSoldProducts = async () => {
      try {
        let query = supabase.from('sold_products').select('*');

        // Filter by type
        if (type === 'sold') {
          query = query.eq('owner_id', userId);
        } else if (type === 'bought') {
          query = query.eq('buyer_id', userId);
        } else {
          // All - both sold and bought
          query = query.or(`owner_id.eq.${userId},buyer_id.eq.${userId}`);
        }

        query = query.order('sold_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        setSoldProducts(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading sold products:', err);
        setError(err.message);
        setSoldProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadSoldProducts();

    // Real-time subscription
    const channel = supabase
      .channel(`sold-products-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sold_products'
        },
        () => {
          loadSoldProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, type]);

  return { soldProducts, loading, error };
};

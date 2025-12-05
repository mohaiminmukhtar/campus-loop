// UserContext.jsx - Optimized user context with retries and queue
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { updateUserProfile, ensureUserRow } from '../services/userService';
import { withRetry, requestQueue } from '../utils/requestQueue';

const UserContext = createContext();
export const useUserData = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setUserData(null);
      setFavorites([]);
      setCart([]);
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        setLoading(true);

        // Ensure user exists in users table
        await ensureUserRow(authUser);

        // Fetch user data, favorites, and cart concurrently with retry & queue
        const [userRes, favRes, cartRes] = await Promise.all([
          withRetry(() =>
            requestQueue.add(() =>
              supabase
                .from('users')
                .select('id,name,student_id,avatar_url,gender')
                .eq('id', authUser.id)
                .single()
            )
          ),
          withRetry(() =>
            requestQueue.add(() =>
              supabase
                .from('favorites')
                .select('productid')
                .eq('userid', authUser.id)
            )
          ),
          withRetry(() =>
            requestQueue.add(() =>
              supabase
                .from('cart')
                .select('*')
                .eq('userid', authUser.id)
            )
          )
        ]);

        if (userRes.error) throw userRes.error;
        if (favRes.error) throw favRes.error;
        if (cartRes.error) throw cartRes.error;

        setUserData(userRes.data);
        setFavorites(favRes.data || []);
        setCart(cartRes.data || []);
      } catch (err) {
        console.error('❌ Failed to load user data:', err.message || err);
        setUserData(null);
        setFavorites([]);
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    // Defer user data loading by 300ms to speed up initial login
    setTimeout(() => loadUserData(), 300);

    // Real-time subscription for user updates
    const channel = supabase
      .channel(`user-${authUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${authUser.id}`
        },
        (payload) => {
          console.log('User data updated in real-time:', payload.new);
          setUserData(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser]);

  // Update user profile
  const updateProfile = async (updates) => {
    if (!authUser) return { success: false, error: 'No user logged in' };

    const result = await updateUserProfile(authUser.id, updates);

    if (result.success) {
      setUserData(result.data);
    }

    return result;
  };

  const value = {
    userData,
    favorites,
    cart,
    loading,
    updateProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// useUser.js - Hook for user data with real-time sync
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useUser = (userId = null) => {
  const { user: authUser } = useAuth();
  const targetUserId = userId || authUser?.id;
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    // Load user data
    const loadUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (error) throw error;
        setUserData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Real-time subscription for user updates
    const channel = supabase
      .channel(`user-${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${targetUserId}`
        },
        (payload) => {
          setUserData(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId]);

  return { userData, loading, error };
};

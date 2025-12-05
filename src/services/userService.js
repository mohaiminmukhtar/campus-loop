// userService.js - Service functions for user operations
import { supabase } from '../supabaseClient';

/**
 * Update user profile
 * This will automatically sync across all tables via database trigger
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        phone: updates.phone,
        bio: updates.bio,
        avatar_url: updates.avatar_url,
        gender: updates.gender,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Also update auth metadata for consistency
    if (updates.name || updates.avatar_url) {
      await supabase.auth.updateUser({
        data: {
          name: updates.name,
          profileImageUrl: updates.avatar_url,
        }
      });
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create or update user row (called after signup)
 */
export const ensureUserRow = async (authUser) => {
  try {
    // Check if user row exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single();

    if (existing) {
      return { success: true, data: existing };
    }

    // Create user row if it doesn't exist
    const metadata = authUser.user_metadata || {};
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        name: metadata.name || 'User',
        email: authUser.email,
        student_id: metadata.studentId,
        avatar_url: metadata.studentCardUrl || metadata.profileImageUrl,
        gender: metadata.gender,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error ensuring user row:', error);
    return { success: false, error: error.message };
  }
};

// AuthContext.jsx - Fixed to prevent QuotaExceededError
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { cleanupStorage } from "../utils/storageCleanup";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cleanup function to prevent storage quota issues
  const cleanupStaleTokens = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') && key.includes('-auth-token')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const parsed = JSON.parse(item);
              // Remove if expired
              if (parsed.expires_at && new Date(parsed.expires_at * 1000) < new Date()) {
                localStorage.removeItem(key);
              }
              // Remove if too large (> 500KB)
              else if (item.length > 500000) {
                console.warn('Large token detected, clearing...', item.length);
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            // Invalid token, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
      // If cleanup fails, clear everything
      try {
        localStorage.clear();
      } catch (e) {
        console.error('Failed to clear localStorage:', e);
      }
    }
  };

  // Aggressive cleanup - clear ALL auth tokens
  const clearAllAuthTokens = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('auth') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing tokens:', error);
      localStorage.clear();
    }
  };

  // Clean up on mount
  useEffect(() => {
    cleanupStaleTokens();
  }, []);

  // Validate student ID format
  const validateStudentId = (studentId) => {
    const pattern = /^(sp|fa)\d{2}-[a-z]{3}-\d{3}$/i;
    return pattern.test(studentId);
  };

  // Auto-login & listen to auth changes
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user || null);
      } catch (error) {
        console.error('Session error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      
      // Clean up storage on session expiry
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        cleanupStorage();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Upload file to Supabase Storage and return public URL
  const uploadFileToStorage = async (file, bucket, fileName) => {
    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, error: error.message };
    }
  };

  // SIGNUP - Fixed to prevent QuotaExceededError
  const signup = async (studentId, password, name, gender, studentCardFile) => {
    try {
      // Validation
      if (!validateStudentId(studentId)) {
        return { success: false, error: "Invalid student ID format. Use sp22-bse-051" };
      }
      if (!password || password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
      }
      if (!studentCardFile) {
        return { success: false, error: "Student card image is required" };
      }

      const normalizedId = studentId.toLowerCase();
      const emailForSupabase = normalizedId.replace(/-/g, "") + "@campusloop.com";

      // Step 1: Create user account with MINIMAL metadata
      
      const { data, error } = await supabase.auth.signUp({
        email: emailForSupabase,
        password,
        options: {
          data: {
            studentId: normalizedId,
            name: name || normalizedId.toUpperCase(),
            gender: gender || "Other",
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('❌ Signup error:', error);
        
        // Handle specific error types
        if (error.message.includes('quota') || error.message.includes('QuotaExceeded')) {
          cleanupStaleTokens();
          return { success: false, error: "Storage quota exceeded. Please try again." };
        }
        
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          return { success: false, error: "This student ID is already registered. Please login instead." };
        }
        
        if (error.status === 500) {
          return { 
            success: false, 
            error: "Server error. This may be due to email confirmation settings. Please check Supabase dashboard or try again later." 
          };
        }
        
        return { success: false, error: error.message || "Signup failed. Please try again." };
      }

      if (!data.user) {
        return { success: false, error: "Failed to create user account" };
      }

      // Step 2: Upload student card to storage (after user is created)
      const fileExt = studentCardFile.name.split(".").pop();
      const fileName = `${normalizedId}.${fileExt}`;
      
      const uploadResult = await uploadFileToStorage(studentCardFile, "student-cards", fileName);

      if (!uploadResult.success) {
        console.error('Student card upload failed:', uploadResult.error);
        // Don't fail signup, but warn user
        return {
          success: true,
          user: data.user,
          warning: "Account created but student card upload failed. Please contact support."
        };
      }

      // Step 3: Update user metadata with ONLY the URL (not the file)
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          studentCardUrl: uploadResult.url,
        },
      });

      if (updateError) {
        console.error('Metadata update error:', updateError);
      }

      // Step 4: Update users table with avatar_url
      const { error: dbUpdateError } = await supabase
        .from('users')
        .update({ avatar_url: uploadResult.url })
        .eq('id', data.user.id);

      if (dbUpdateError) {
        console.error('Database update error:', dbUpdateError);
        // Don't fail signup for this
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Signup error:', error);
      if (error.message.includes('quota') || error.message.includes('QuotaExceeded')) {
        cleanupStaleTokens();
        return { success: false, error: "Storage quota exceeded. Please clear browser data and try again." };
      }
      return { success: false, error: error.message };
    }
  };

  // LOGIN - Optimized for speed
  const login = async (studentId, password) => {
    try {
      if (!validateStudentId(studentId)) {
        return { success: false, error: "Invalid student ID format." };
      }
      if (!password) {
        return { success: false, error: "Password is required." };
      }

      const normalizedId = studentId.toLowerCase();
      const emailForSupabase = normalizedId.replace(/-/g, "") + "@campusloop.com";

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailForSupabase,
        password,
      });

      if (error) {
        return { success: false, error: "Incorrect ID or password" };
      }

      // Cleanup in background (don't wait for it)
      setTimeout(() => cleanupStaleTokens(), 100);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Clean up after logout
      cleanupStaleTokens();
      // Run storage cleanup
      cleanupStorage();
      // Clear session storage flags for popups so they show again on next login
      sessionStorage.removeItem('hasSeenLiveHuntingGuide');
      sessionStorage.removeItem('hasSeenIntro');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // UPDATE USER PROFILE - Fixed to handle file uploads properly
  const updateUser = async (updates, files = {}) => {
    try {
      if (!user) {
        return { success: false, error: "No user logged in." };
      }

      // Separate file uploads from metadata updates
      const metadataUpdates = { ...updates };
      const fileUrls = {};

      // Handle profile image upload if provided
      if (files.profileImage) {
        const fileExt = files.profileImage.name.split(".").pop();
        const fileName = `${user.user_metadata?.studentId || user.id}.${fileExt}`;
        
        const uploadResult = await uploadFileToStorage(files.profileImage, "profile-images", fileName);
        
        if (uploadResult.success) {
          fileUrls.profileImageUrl = uploadResult.url;
          // Remove the file object from metadata
          delete metadataUpdates.profileImage;
        } else {
          return { success: false, error: uploadResult.error };
        }
      }

      // Merge file URLs with metadata updates
      const finalUpdates = {
        ...metadataUpdates,
        ...fileUrls,
      };

      // Remove any large data that shouldn't be in metadata
      delete finalUpdates.profileImage;
      delete finalUpdates.studentCard;

      // Ensure metadata is small (< 100KB)
      const metadataSize = JSON.stringify(finalUpdates).length;
      if (metadataSize > 100000) {
        return { success: false, error: "Profile data too large. Please reduce the amount of information." };
      }

      const { data, error } = await supabase.auth.updateUser({
        data: finalUpdates,
      });

      if (error) {
        if (error.message.includes('quota') || error.message.includes('QuotaExceeded')) {
          cleanupStaleTokens();
          return { success: false, error: "Storage quota exceeded. Please try again." };
        }
        return { success: false, error: error.message };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Update user error:', error);
      if (error.message.includes('quota') || error.message.includes('QuotaExceeded')) {
        cleanupStaleTokens();
        return { success: false, error: "Storage quota exceeded. Please clear browser data and try again." };
      }
      return { success: false, error: error.message };
    }
  };

  // Clean user metadata - remove large data
  const cleanUserMetadata = async () => {
    try {
      if (!user) return;

      const metadata = user.user_metadata || {};
      const cleanedMetadata = {};

      // Only keep small string values and URLs
      Object.keys(metadata).forEach(key => {
        const value = metadata[key];
        if (typeof value === 'string') {
          // Keep URLs and small strings only
          if (value.startsWith('http') || value.length < 1000) {
            cleanedMetadata[key] = value;
          }
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          cleanedMetadata[key] = value;
        }
      });

      // Update with cleaned metadata
      const { error } = await supabase.auth.updateUser({
        data: cleanedMetadata,
      });

      if (error) {
        console.error('Failed to clean metadata:', error);
      }
    } catch (error) {
      console.error('Error cleaning metadata:', error);
    }
  };

  const value = {
    user,
    isLoading,
    signup,
    login,
    logout,
    updateUser,
    uploadFileToStorage,
    cleanUserMetadata,
    clearAllAuthTokens,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

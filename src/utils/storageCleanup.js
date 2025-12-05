/**
 * Storage Cleanup Utility
 * Automatically cleans up localStorage to prevent QuotaExceededError
 */

const STORAGE_KEYS = {
  SUPABASE_AUTH: 'sb-nbwkpzmkyafcrhbaxeyn-auth-token',
  CART: 'campusloop-cart',
  FAVORITES: 'campusloop-favorites',
  USER_PREFERENCES: 'campusloop-preferences',
  THEME: 'campusloop-theme',
};

/**
 * Get storage usage information
 */
export const getStorageInfo = () => {
  let totalSize = 0;
  const items = [];

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      totalSize += size;
      items.push({ key, size, sizeKB: (size / 1024).toFixed(2) });
    }
  }

  return {
    totalSize,
    totalSizeKB: (totalSize / 1024).toFixed(2),
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    itemCount: items.length,
    items: items.sort((a, b) => b.size - a.size),
  };
};

/**
 * Clean up old or unnecessary data
 */
export const cleanupStorage = () => {
  console.log('🧹 Starting localStorage cleanup...');
  
  const beforeInfo = getStorageInfo();
  console.log(`📊 Before cleanup: ${beforeInfo.totalSizeKB} KB (${beforeInfo.itemCount} items)`);

  let cleanedCount = 0;

  // Remove old Supabase auth tokens (keep only the current one)
  for (let key in localStorage) {
    if (key.startsWith('sb-') && key.includes('-auth-token')) {
      // Keep the current auth token
      if (key !== STORAGE_KEYS.SUPABASE_AUTH) {
        localStorage.removeItem(key);
        cleanedCount++;
        console.log(`🗑️ Removed old auth token: ${key}`);
      }
    }
  }

  // Remove expired or corrupted data
  const keysToCheck = Object.values(STORAGE_KEYS);
  keysToCheck.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        // Try to parse JSON data
        if (value.startsWith('{') || value.startsWith('[')) {
          JSON.parse(value);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Corrupted data found in ${key}, removing...`);
      localStorage.removeItem(key);
      cleanedCount++;
    }
  });

  // Remove any keys that don't match known patterns
  const knownPrefixes = ['sb-', 'campusloop-', 'supabase.'];
  for (let key in localStorage) {
    const isKnown = knownPrefixes.some(prefix => key.startsWith(prefix));
    if (!isKnown) {
      console.log(`🗑️ Removing unknown key: ${key}`);
      localStorage.removeItem(key);
      cleanedCount++;
    }
  }

  const afterInfo = getStorageInfo();
  const savedKB = (beforeInfo.totalSize - afterInfo.totalSize) / 1024;
  
  console.log(`✅ Cleanup complete!`);
  console.log(`📊 After cleanup: ${afterInfo.totalSizeKB} KB (${afterInfo.itemCount} items)`);
  console.log(`💾 Freed up: ${savedKB.toFixed(2)} KB`);
  console.log(`🗑️ Removed ${cleanedCount} items`);

  return {
    before: beforeInfo,
    after: afterInfo,
    freedKB: savedKB,
    itemsRemoved: cleanedCount,
  };
};

/**
 * Emergency cleanup - removes everything except auth
 */
export const emergencyCleanup = () => {
  console.warn('🚨 Emergency cleanup initiated!');
  
  const authToken = localStorage.getItem(STORAGE_KEYS.SUPABASE_AUTH);
  
  localStorage.clear();
  
  if (authToken) {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_AUTH, authToken);
    console.log('✅ Auth token preserved');
  }
  
  console.log('✅ Emergency cleanup complete - all data cleared except auth');
};

/**
 * Check if storage is near quota
 */
export const isStorageNearQuota = () => {
  const info = getStorageInfo();
  const quotaMB = 5; // Most browsers have ~5-10MB limit
  const usageMB = parseFloat(info.totalSizeMB);
  const percentUsed = (usageMB / quotaMB) * 100;
  
  return {
    isNearQuota: percentUsed > 80,
    percentUsed: percentUsed.toFixed(2),
    usageMB,
    quotaMB,
  };
};

/**
 * Setup automatic cleanup on quota exceeded
 */
export const setupQuotaHandler = () => {
  // Override localStorage.setItem to catch quota errors
  const originalSetItem = localStorage.setItem;
  
  localStorage.setItem = function(key, value) {
    try {
      originalSetItem.call(this, key, value);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('❌ QuotaExceededError detected!');
        console.log('🧹 Running automatic cleanup...');
        
        cleanupStorage();
        
        // Try again after cleanup
        try {
          originalSetItem.call(this, key, value);
          console.log('✅ Successfully saved after cleanup');
        } catch (retryError) {
          console.error('❌ Still failing after cleanup, running emergency cleanup...');
          emergencyCleanup();
          
          // Final attempt
          try {
            originalSetItem.call(this, key, value);
            console.log('✅ Successfully saved after emergency cleanup');
          } catch (finalError) {
            console.error('❌ Failed to save even after emergency cleanup');
            throw finalError;
          }
        }
      } else {
        throw error;
      }
    }
  };
  
  console.log('✅ Quota handler installed');
};

/**
 * Initialize storage management
 */
export const initStorageManagement = () => {
  console.log('🔧 Initializing storage management...');
  
  // Run initial cleanup
  cleanupStorage();
  
  // Check storage status
  const quotaStatus = isStorageNearQuota();
  if (quotaStatus.isNearQuota) {
    console.warn(`⚠️ Storage usage is high: ${quotaStatus.percentUsed}%`);
  } else {
    console.log(`✅ Storage usage: ${quotaStatus.percentUsed}%`);
  }
  
  // Setup automatic quota handler
  setupQuotaHandler();
  
  console.log('✅ Storage management initialized');
};

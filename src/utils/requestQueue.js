/**
 * Request Queue Utility
 * Prevents too many simultaneous requests to Supabase
 */

class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async add(fn) {
    // If we're at max concurrent requests, queue this one
    if (this.running >= this.maxConcurrent) {
      await new Promise(resolve => this.queue.push(resolve));
    }

    this.running++;
    
    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;
      
      // Process next item in queue
      if (this.queue.length > 0) {
        const resolve = this.queue.shift();
        resolve();
      }
    }
  }
}

// Create a global request queue
export const requestQueue = new RequestQueue(3);

/**
 * Wrapper for Supabase queries with retry logic
 */
export const withRetry = async (fn, retries = 2, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await requestQueue.add(fn);
      return result;
    } catch (error) {
      const isNetworkError = 
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('ERR_HTTP2') ||
        error.message?.includes('ERR_CONNECTION');

      if (isNetworkError && i < retries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      
      throw error;
    }
  }
};

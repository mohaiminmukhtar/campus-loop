import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";
import { withRetry } from "../utils/requestQueue";

const ProductContext = createContext();
export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------------------
  // 1) LOAD PRODUCTS FROM SUPABASE
  // -----------------------------------------------------
  const loadProducts = async () => {
    try {
      const { data, error } = await withRetry(
        () => supabase.from("products").select("*")
      );
      if (!error && data) setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error.message);
    }
  };

  useEffect(() => {
    loadProducts();

    // Polling for products (including bid updates) - every 5 seconds
    const productsPollingInterval = setInterval(() => {
      loadProducts();
    }, 5000);

    // Real-time updates (backup)
    const channel = supabase
      .channel("products-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        console.log("Products real-time event");
        loadProducts();
      })
      .subscribe();

    return () => {
      clearInterval(productsPollingInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  // -----------------------------------------------------
  // 2) CART (Supabase)
  // -----------------------------------------------------
  const loadCart = async () => {
    if (!user) return setCart([]);
    
    try {
      const { data, error } = await withRetry(
        () => supabase.from("cart").select("*").eq("userid", user.id)
      );
      
      if (error) {
        return setCart([]);
      }
      
      if (!data || data.length === 0) {
        return setCart([]);
      }
      
      const fullCart = await Promise.all(
        data.map(async (item) => {
          const { data: product } = await supabase
            .from("products")
            .select("*")
            .eq("id", item.productid)
            .single();
          return { ...product, quantity: item.quantity };
        })
      );
      setCart(fullCart);
    } catch (error) {
      console.error("Cart load failed:", error);
      setCart([]);
    }
  };

  useEffect(() => {
    if (user) {
      // Initial load
      loadCart();

      // Polling mechanism - check every 3 seconds for changes
      const cartPollingInterval = setInterval(() => {
        loadCart();
      }, 3000);

      // Real-time cart updates (as backup)
      const cartChannel = supabase
        .channel(`cart-changes-${user.id}`)
        .on("postgres_changes", { 
          event: "*", 
          schema: "public", 
          table: "cart",
          filter: `userid=eq.${user.id}`
        }, (payload) => {
          console.log("Cart real-time event:", payload);
          loadCart();
        })
        .subscribe((status) => {
          console.log("Cart subscription status:", status);
        });

      return () => {
        console.log("Cleaning up cart subscription and polling");
        clearInterval(cartPollingInterval);
        supabase.removeChannel(cartChannel);
      };
    }
  }, [user]);

  // Add to cart
  const addToCart = async (product) => {
    if (!user) {
      return { success: false, message: "Please login to add items to cart" };
    }

    // Check if user owns this product
    if (product.owner_id === user.id) {
      return { success: false, message: "You cannot add your own product to cart" };
    }

    try {
      // check if already inside cart
      const { data: exists } = await supabase
        .from("cart")
        .select("*")
        .eq("userid", user.id)
        .eq("productid", product.id)
        .single();

      if (exists) {
        await supabase
          .from("cart")
          .update({ quantity: exists.quantity + 1 })
          .eq("id", exists.id);
      } else {
        await supabase.from("cart").insert({
          userid: user.id,
          productid: product.id,
          quantity: 1,
        });
      }

      loadCart();
      return { success: true, message: "Added to cart successfully" };
    } catch (error) {
      console.error("Add to cart error:", error);
      return { success: false, message: "Failed to add to cart" };
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);

    await supabase
      .from("cart")
      .update({ quantity })
      .eq("userid", user.id)
      .eq("productid", productId);

    loadCart();
  };

  const removeFromCart = async (productId) => {
    await supabase.from("cart").delete().eq("userid", user.id).eq("productid", productId);
    loadCart();
  };

  const clearCart = async () => {
    await supabase.from("cart").delete().eq("userid", user.id);
    setCart([]);
  };

  // -----------------------------------------------------
  // 3) FAVORITES (Supabase)
  // -----------------------------------------------------
  const loadFavorites = async () => {
    if (!user) return setFavorites([]);

    try {
      const { data, error } = await withRetry(
        () => supabase.from("favorites").select("productid").eq("userid", user.id)
      );
      
      if (error) {
        console.error("Favorites fetch error:", error);
        return setFavorites([]);
      }
      
      if (!data || data.length === 0) {
        return setFavorites([]);
      }
      
      const ids = data.map((item) => item.productid);

      const { data: favProducts } = await supabase
        .from("products")
        .select("*")
        .in("id", ids);

      setFavorites(favProducts || []);
      console.log("Favorites loaded:", favProducts?.length || 0);
    } catch (error) {
      console.error("Favorites load failed:", error);
      setFavorites([]);
    }
  };

  useEffect(() => {
    if (user) {
      // Initial load
      loadFavorites();

      // Polling mechanism - check every 3 seconds for changes
      const pollingInterval = setInterval(() => {
        loadFavorites();
      }, 3000);

      // Real-time favorites updates (as backup)
      const favoritesChannel = supabase
        .channel(`favorites-changes-${user.id}`)
        .on("postgres_changes", { 
          event: "*", 
          schema: "public", 
          table: "favorites",
          filter: `userid=eq.${user.id}`
        }, (payload) => {
          console.log("Favorites real-time event:", payload);
          loadFavorites();
        })
        .subscribe((status) => {
          console.log("Favorites subscription status:", status);
        });

      return () => {
        console.log("Cleaning up favorites subscription and polling");
        clearInterval(pollingInterval);
        supabase.removeChannel(favoritesChannel);
      };
    } else {
      setFavorites([]);
    }
  }, [user]);

  const addToFavorites = async (product) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("favorites").insert({ 
        userid: user.id, 
        productid: product.id 
      });
      
      if (error) {
        console.error("Add to favorites error:", error);
      } else {
        console.log("Added to favorites:", product.id);
        // Force immediate reload
        await loadFavorites();
      }
    } catch (error) {
      console.error("Add to favorites failed:", error);
    }
  };

  const removeFromFavorites = async (productId) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("favorites")
        .delete()
        .eq("userid", user.id)
        .eq("productid", productId);
      
      if (error) {
        console.error("Remove from favorites error:", error);
      } else {
        console.log("Removed from favorites:", productId);
        // Force immediate reload
        await loadFavorites();
      }
    } catch (error) {
      console.error("Remove from favorites failed:", error);
    }
  };

  const isFavorite = (productId) => favorites.some((f) => f.id === productId);

  // -----------------------------------------------------
  // 4) ADD PRODUCT
  // -----------------------------------------------------
  const addProduct = async (product, retryCount = 0) => {
    if (!user) {
      console.error("No user logged in");
      return null;
    }

    try {
      // Get user data from users table for denormalized fields
      const { data: userData } = await supabase
        .from('users')
        .select('name, avatar_url, student_id')
        .eq('id', user.id)
        .single();

      const newProduct = {
        owner_id: user.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        condition: product.condition,
        location: product.location,
        image_url: product.image,
        bidding_enabled: product.biddingenabled || false,
        starting_bid: product.startingbid,
        current_bid: product.currentbid || product.startingbid,
        bid_count: product.bidcount || 0,
        bid_end_date: product.bidenddate,
        views: 0,
        // Denormalized user data
        owner_name: userData?.name || user.user_metadata?.name || 'User',
        owner_avatar_url: userData?.avatar_url || user.user_metadata?.profileImageUrl,
        owner_student_id: userData?.student_id || user.user_metadata?.studentId,
      };

      const { data, error } = await supabase.from("products").insert(newProduct).select().single();

      if (error) {
        // Network errors - retry once
        if ((error.message.includes('Failed to fetch') || 
             error.message.includes('ERR_HTTP2') || 
             error.message.includes('ERR_CONNECTION')) && retryCount < 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return addProduct(product, retryCount + 1);
        }
        console.error("Error adding product:", error);
        return null;
      }

      loadProducts();
      return data;
    } catch (error) {
      console.error("Product add failed:", error);
      return null;
    }
  };

  // -----------------------------------------------------
  // 5) SEARCH & CATEGORY
  // -----------------------------------------------------
  const getProductsByCategory = (category) => {
    if (!category) return products;
    return products.filter((p) => p.category === category);
  };

  const searchProducts = (q) => {
    if (!q) return products;

    const s = q.toLowerCase();
    return products.filter(
      (x) =>
        x.title.toLowerCase().includes(s) ||
        x.description.toLowerCase().includes(s) ||
        x.category.toLowerCase().includes(s)
    );
  };

  // -----------------------------------------------------
  // 6) BIDDING (Supabase)
  // -----------------------------------------------------
  const placeBid = async (productId, amount, bidderId, bidderName) => {
    try {
      // Verify user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: "You must be logged in to place a bid" };
      }

      console.log('Placing bid - User ID:', session.user.id, 'Bidder ID:', bidderId);

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError || !product) {
        console.error("Product fetch error:", productError);
        return { success: false, error: "Product not found" };
      }

      if (!product.bidding_enabled && !product.biddingenabled) {
        return { success: false, error: "Bidding not enabled for this product" };
      }

      // Get existing bids
      const { data: existingBids } = await supabase
        .from("bids")
        .select("*")
        .eq("productid", productId)
        .order("amount", { ascending: false });

      const highest = existingBids?.[0]?.amount || product.starting_bid || product.startingbid || product.price;

      if (amount <= highest) {
        return { success: false, error: `Your bid must be higher than PKR ${highest}` };
      }

      // Get bidder info
      const { data: bidderData } = await supabase
        .from('users')
        .select('name, avatar_url, student_id')
        .eq('id', bidderId)
        .single();

      // Insert bid - using camelCase column names to match database
      const bidData = {
        productid: productId,
        amount: parseFloat(amount),
        bidderid: bidderId,
        biddername: bidderName || bidderData?.name || 'User',
        bidder_avatar_url: bidderData?.avatar_url || null,
        bidder_student_id: bidderData?.student_id || null,
      };

      console.log('Attempting to insert bid:', bidData);

      const { data: insertedBid, error: bidError } = await supabase
        .from("bids")
        .insert(bidData)
        .select()
        .single();

      if (bidError) {
        console.error("Bid insert error:", bidError);
        console.error("Error details:", JSON.stringify(bidError, null, 2));
        
        // Check for specific error types
        if (bidError.message?.includes('permission') || bidError.message?.includes('policy')) {
          return { success: false, error: "Permission denied. Please check database policies." };
        }
        if (bidError.message?.includes('violates')) {
          return { success: false, error: "Database constraint violation. Please check the data." };
        }
        
        return { success: false, error: bidError.message || "Failed to place bid" };
      }

      console.log('Bid inserted successfully:', insertedBid);

      // Update product with new highest bid (products table uses snake_case)
      const { error: updateError } = await supabase
        .from("products")
        .update({
          current_bid: amount,
          bid_count: (product.bid_count || 0) + 1,
        })
        .eq("id", productId);

      if (updateError) {
        console.error("Product update error:", updateError);
        console.error("Update error details:", JSON.stringify(updateError, null, 2));
      } else {
        console.log("Product updated successfully with new bid");
      }

      // Force reload products
      await loadProducts();

      return { success: true };
    } catch (error) {
      console.error("Place bid error:", error);
      return { success: false, error: "Failed to place bid. Please try again." };
    }
  };

  const getBids = async (productId) => {
    try {
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("productid", productId)
        .order("amount", { ascending: false });

      if (error) {
        console.error("Get bids error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Get bids failed:", error);
      return [];
    }
  };

  const getUserBids = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("bidderid", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Get user bids error:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Get user bids failed:", error);
      return [];
    }
  };

  // -----------------------------------------------------

  const value = {
    products,
    cart,
    favorites,
    loading,
    // cart
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    // favorites
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshFavorites: loadFavorites,
    // products
    addProduct,
    getProductsByCategory,
    searchProducts,
    // bidding
    placeBid,
    getBids,
    getUserBids,
    cartItemCount: cart.reduce((a, b) => a + b.quantity, 0),
    cartTotal: cart.reduce((a, b) => a + b.price * b.quantity, 0),
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

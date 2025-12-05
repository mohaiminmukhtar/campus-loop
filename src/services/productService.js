// productService.js - Service functions for product operations
import { supabase } from '../supabaseClient';

/**
 * Create a new product
 * Automatically includes denormalized user data
 */
export const createProduct = async (productData, user) => {
  try {
    // Get user data from users table
    const { data: userData } = await supabase
      .from('users')
      .select('name, avatar_url, student_id')
      .eq('id', user.id)
      .single();

    const newProduct = {
      owner_id: user.id,
      title: productData.title,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      condition: productData.condition,
      location: productData.location,
      image_url: productData.image_url,
      bidding_enabled: productData.bidding_enabled || false,
      starting_bid: productData.starting_bid,
      current_bid: productData.starting_bid,
      bid_end_date: productData.bid_end_date,
      // Denormalized user data
      owner_name: userData?.name || user.user_metadata?.name || 'User',
      owner_avatar_url: userData?.avatar_url || user.user_metadata?.profileImageUrl,
      owner_student_id: userData?.student_id || user.user_metadata?.studentId,
    };

    const { data, error } = await supabase
      .from('products')
      .insert(newProduct)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a product
 */
export const updateProduct = async (productId, updates) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a product (moves to sold_products with status 'deleted')
 */
export const deleteProduct = async (productId) => {
  try {
    // Call the database function to move product to sold_products
    const { data, error } = await supabase.rpc('move_to_sold_products', {
      p_product_id: productId,
      p_buyer_id: null,
      p_status: 'deleted'
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark product as sold (moves to sold_products)
 */
export const markProductAsSold = async (productId, buyerId = null) => {
  try {
    // Call the database function to move product to sold_products
    const { data, error } = await supabase.rpc('move_to_sold_products', {
      p_product_id: productId,
      p_buyer_id: buyerId,
      p_status: 'sold'
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking product as sold:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting product:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Increment product views
 */
export const incrementProductViews = async (productId) => {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('views')
      .eq('id', productId)
      .single();

    if (product) {
      await supabase
        .from('products')
        .update({ views: (product.views || 0) + 1 })
        .eq('id', productId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error incrementing views:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload product image to storage
 */
export const uploadProductImage = async (file, productId) => {
  try {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('Error uploading product image:', error);
    return { success: false, error: error.message };
  }
};

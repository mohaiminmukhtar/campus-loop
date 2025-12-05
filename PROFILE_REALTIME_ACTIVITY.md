# Profile Activity Overview - Real-time Updates ✅

## Problem
The Activity Overview section in Profile.jsx was showing stale data because it was:
1. Loading favorites and cart from localStorage (not real-time)
2. Filtering user products by wrong field (`p.seller` instead of `p.owner_id`)
3. Not leveraging the existing real-time subscriptions in ProductContext

## Solution
Updated Profile.jsx to use real-time data from ProductContext which already has real-time Supabase subscriptions.

---

## Changes Made

### 1. Fixed User Products Filter
**Before:**
```javascript
const userProductsList = products.filter(
  (p) => p.seller?.toLowerCase() === user.user_metadata?.studentId?.toLowerCase()
);
```

**After:**
```javascript
const userProductsList = products.filter(
  (p) => p.owner_id === user.id
);
```

**Why:** Products table uses `owner_id` (UUID) not `seller` (student ID string). This is more reliable and matches the database schema.

---

### 2. Use Real-time Favorites and Cart
**Before:**
```javascript
const userFavorites = JSON.parse(localStorage.getItem("campusloop_favorites") || "[]");
const userCart = JSON.parse(localStorage.getItem("campusloop_cart") || "[]");
```

**After:**
```javascript
const { favorites, cart } = useProducts();
```

**Why:** ProductContext already has real-time subscriptions for favorites and cart that update instantly when data changes.

---

### 3. Updated UI to Use Real-time Data
**Before:**
```javascript
<div className="profile-stat-value">{userFavorites.length}</div>
<div className="profile-stat-value">{userCart.length}</div>
```

**After:**
```javascript
<div className="profile-stat-value">{favorites.length}</div>
<div className="profile-stat-value">{cart.length}</div>
```

---

## Real-time Data Flow

### ProductContext (Already Has Real-time Subscriptions)
```javascript
// Products - updates when any product is added/modified/deleted
const channel = supabase
  .channel("products-changes")
  .on("postgres_changes", { event: "*", schema: "public", table: "products" }, loadProducts)
  .subscribe();

// Cart - updates when user's cart changes
const cartChannel = supabase
  .channel("cart-changes")
  .on("postgres_changes", { 
    event: "*", 
    schema: "public", 
    table: "cart",
    filter: `userid=eq.${user.id}`
  }, loadCart)
  .subscribe();

// Favorites - updates when user's favorites change
const favoritesChannel = supabase
  .channel("favorites-changes")
  .on("postgres_changes", { 
    event: "*", 
    schema: "public", 
    table: "favorites",
    filter: `userid=eq.${user.id}`
  }, loadFavorites)
  .subscribe();
```

### Profile.jsx (Now Uses Real-time Data)
```javascript
// Get real-time data from context
const { products, favorites, cart } = useProducts();

// Filter user's products (updates automatically when products change)
useEffect(() => {
  if (user) {
    const userProductsList = products.filter(
      (p) => p.owner_id === user.id
    );
    setUserProducts(userProductsList);
  }
}, [products, user]);

// Calculate stats (updates automatically)
const totalSold = userProducts.filter((p) => p.sold).length;
const totalEarnings = userProducts
  .filter((p) => p.sold)
  .reduce((sum, p) => sum + (p.price || 0), 0);
```

---

## Activity Overview Stats (All Real-time)

| Stat | Source | Updates When |
|------|--------|--------------|
| **Listings** | `userProducts.length` | User adds/removes products |
| **Wishlist** | `favorites.length` | User adds/removes favorites |
| **Cart Items** | `cart.length` | User adds/removes cart items |
| **Sold** | `totalSold` | Product status changes to sold |
| **Total Earnings** | `totalEarnings` | Products are marked as sold |

---

## Real-time Behavior

### Before
- ❌ Stats only updated on page reload
- ❌ Cart/favorites from localStorage (stale data)
- ❌ Wrong product filter (missed user's products)

### After
- ✅ Stats update instantly without page reload
- ✅ Cart/favorites from real-time subscriptions
- ✅ Correct product filter using `owner_id`
- ✅ Works across multiple browser windows
- ✅ Reflects changes immediately

---

## Testing Scenarios

### Test 1: Add Product
1. Open Profile page
2. Navigate to Sell page and add a product
3. Return to Profile page
4. **Result:** "Listings" count increases immediately

### Test 2: Add to Cart
1. Open Profile page in one window
2. Open Products page in another window
3. Add item to cart
4. Check Profile page
5. **Result:** "Cart Items" count increases immediately

### Test 3: Add to Wishlist
1. Open Profile page
2. Browse products and add to favorites
3. Return to Profile page
4. **Result:** "Wishlist" count increases immediately

### Test 4: Multi-window Sync
1. Open Profile page in two browser windows
2. Add product in window 1
3. Check window 2
4. **Result:** Both windows show updated count

---

## Files Modified
- **src/pages/Profile.jsx**
  - Changed product filter from `p.seller` to `p.owner_id`
  - Replaced localStorage with `useProducts()` context
  - Updated UI to use `favorites` and `cart` from context

---

## Benefits

1. **Instant Updates** - No page reload needed
2. **Accurate Data** - Always shows current state
3. **Multi-window Sync** - Changes reflect across all open windows
4. **Better Performance** - Leverages existing subscriptions
5. **Cleaner Code** - Single source of truth (ProductContext)

---

## Database Schema Reference

```sql
-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id),  -- ← Used for filtering
  title TEXT NOT NULL,
  price NUMERIC,
  sold BOOLEAN DEFAULT FALSE,
  ...
);

-- Cart table
CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  userid UUID REFERENCES auth.users(id),
  productid INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1
);

-- Favorites table
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  userid UUID REFERENCES auth.users(id),
  productid INTEGER REFERENCES products(id)
);
```

---

## Notes
- All real-time subscriptions are managed in ProductContext
- Profile.jsx simply consumes the real-time data
- No additional subscriptions needed
- Automatic cleanup on component unmount
- Works seamlessly with existing toast notifications

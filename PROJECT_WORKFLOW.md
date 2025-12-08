# CampusLoop - Project Workflow & Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Application Flow](#application-flow)
5. [Context Providers](#context-providers)
6. [Authentication System](#authentication-system)
7. [Product Management](#product-management)
8. [Key Features](#key-features)
9. [Database Schema](#database-schema)
10. [Component Relationships](#component-relationships)

---

## Overview

**CampusLoop** is a student-only marketplace platform built for university communities. It provides a secure environment where verified students can buy, sell, rent, or exchange goods such as books, electronics, hostel essentials, and project materials.

### Core Objectives
- Create a trusted, scam-free marketplace for students
- Verify all users through university student IDs
- Enable affordable trading within campus communities
- Promote sustainability and student entrepreneurship

---

## Technology Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Framer Motion** - Animations and transitions
- **React Icons** - Icon library

### Backend & Database
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Storage for images

### Additional Libraries
- **EmailJS** - Newsletter subscription emails
- **Vite** - Build tool and dev server

---

## Project Structure

```
campusloop/
├── public/
│   ├── logo.PNG
│   ├── banner.PNG
│   ├── notification.mp3
│   └── images/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── Categories.jsx
│   │   ├── LogoIntro.jsx
│   │   ├── WelcomePopup.jsx
│   │   ├── ConnectionStatus.jsx
│   │   └── Toast.jsx
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── ProductContext.jsx
│   │   ├── UserContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── ToastContext.jsx
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Sell.jsx
│   │   ├── Cart.jsx
│   │   ├── Wishlist.jsx
│   │   ├── Chat.jsx
│   │   ├── Profile.jsx
│   │   ├── About.jsx
│   │   └── ComingSoon.jsx
│   ├── services/            # API service layers
│   │   ├── productService.js
│   │   └── userService.js
│   ├── styles/              # CSS files
│   ├── utils/               # Utility functions
│   ├── supabaseClient.js    # Supabase configuration
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── .env                     # Environment variables
└── package.json
```

---

## Application Flow

### 1. Application Initialization

```
main.jsx
  └─> App.jsx
       └─> Context Providers (nested)
            ├─> AuthProvider
            ├─> ToastProvider
            ├─> UserProvider
            ├─> ThemeProvider
            └─> ProductProvider
                 └─> AppContent
                      ├─> LogoIntro (session-based)
                      ├─> ConnectionStatus
                      ├─> WelcomePopup (authenticated users)
                      ├─> Navbar (authenticated users)
                      ├─> Routes
                      └─> Footer (authenticated users)
```

### 2. User Journey

#### First-Time User
```
1. User visits site → LogoIntro animation (3.6s)
2. Redirected to /login
3. User can choose:
   - Login (existing account)
   - Sign Up (new account)
4. Sign Up requires:
   - Student ID (format: sp22-bse-051)
   - Password (min 6 chars)
   - Full Name
   - Gender
   - Student Card upload (verification)
5. After signup → Redirected to Home
6. WelcomePopup appears after 15 seconds
```

#### Returning User
```
1. User visits site → LogoIntro (if new session)
2. Login with Student ID + Password
3. Session stored in localStorage
4. Redirected to Home
5. Full access to all features
```

### 3. Protected Routes

All routes except `/login` are protected and require authentication:

```javascript
<ProtectedRoute>
  - Checks isAuthenticated from AuthContext
  - If not authenticated → Redirect to /login
  - If authenticated → Render requested page
</ProtectedRoute>
```

---

## Context Providers

### 1. AuthContext
**Purpose:** Manages user authentication state

**State:**
- `user` - Current user object
- `isAuthenticated` - Boolean authentication status
- `isLoading` - Loading state during auth checks

**Methods:**
- `login(studentId, password)` - Authenticate user
- `signup(studentId, password, name, gender, studentCard)` - Register new user
- `logout()` - Clear session and logout

**Flow:**
```
Login → Supabase Auth → Store session → Update user state → Navigate to home
```

### 2. ProductContext
**Purpose:** Manages all product-related operations

**State:**
- `products` - Array of all products
- `cartItems` - User's cart items
- `favorites` - User's wishlist items

**Methods:**
- `addProduct(productData)` - Create new product listing
- `updateProduct(id, updates)` - Update existing product
- `deleteProduct(id)` - Remove product
- `addToCart(product)` - Add item to cart
- `removeFromCart(productId)` - Remove from cart
- `addToFavorites(product)` - Add to wishlist
- `removeFromFavorites(productId)` - Remove from wishlist
- `searchProducts(query)` - Search functionality

**Real-time Updates:**
```javascript
// Subscribes to Supabase real-time changes
supabase
  .channel('products')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'products' })
  .subscribe()
```

### 3. UserContext
**Purpose:** Manages user profile and interactions

**Methods:**
- `getUserProfile(userId)` - Fetch user details
- `updateUserProfile(userId, updates)` - Update profile
- `getUserProducts(userId)` - Get user's listings

### 4. ThemeContext
**Purpose:** Manages dark/light theme (if implemented)

### 5. ToastContext
**Purpose:** Global notification system

**Methods:**
- `showToast(message, type)` - Display notification
  - Types: success, error, info, warning

---

## Authentication System

### Student ID Format Validation
```javascript
Pattern: /^(sp|fa)\d{2}-[a-z]{3}-\d{3}$/i

Valid Examples:
- sp22-bse-051
- fa23-cse-042
- SP21-EEE-123

Components:
- sp/fa: Semester (Spring/Fall)
- 22: Year
- bse: Department code
- 051: Roll number
```

### Authentication Flow

```
┌─────────────┐
│ Login Page  │
└──────┬──────┘
       │
       ├─> Validate Student ID format
       ├─> Validate Password (min 6 chars)
       │
       ▼
┌─────────────────┐
│ Supabase Auth   │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Success │
    └────┬────┘
         │
         ├─> Store session in localStorage
         ├─> Update AuthContext state
         ├─> Fetch user profile
         │
         ▼
    ┌─────────┐
    │  Home   │
    └─────────┘
```

### Session Management
- Sessions stored in `localStorage`
- Auto-refresh on page reload
- Logout clears all local data

---

## Product Management

### Product Lifecycle

```
1. CREATE (Sell Page)
   ├─> User fills form
   ├─> Upload image to Supabase Storage
   ├─> Insert product data to database
   └─> Real-time update triggers ProductContext

2. READ (Products Page, Home)
   ├─> Fetch from ProductContext
   ├─> Filter by category/search
   └─> Display in grid/list

3. UPDATE (Product Detail)
   ├─> Owner can edit
   ├─> Update database
   └─> Real-time sync

4. DELETE (Product Detail, Profile)
   ├─> Owner can delete
   ├─> Remove from database
   ├─> Delete image from storage
   └─> Real-time sync
```

### Product Categories
1. **Rentals** - Items for rent
2. **Barter** - Exchange/trade items
3. **Fashion** - Clothing and accessories
4. **Electronics** - Gadgets and devices
5. **Free for All** - Free items
6. **Furniture** - Room and hostel furniture
7. **Digital Services** - Online services

### Product Schema
```javascript
{
  id: UUID,
  title: String,
  description: String,
  price: Number,
  category: String,
  condition: String,
  location: String,
  image: String (URL),
  seller_id: UUID,
  seller_name: String,
  seller_rating: Number,
  created_at: Timestamp,
  updated_at: Timestamp,
  views: Number,
  is_sold: Boolean
}
```

---

## Key Features

### 1. Real-time Updates
- Products list updates automatically when:
  - New product added
  - Product updated
  - Product deleted
- Uses Supabase real-time subscriptions

### 2. Search & Filter
```javascript
// Global search in Navbar
searchProducts(query) {
  - Searches in: title, description, category
  - Returns matching products
  - Shows top 5 in dropdown
  - "View All" for complete results
}

// Category filter in Products page
- Filter by selected category
- Combine with search query
```

### 3. Cart System
- Add/remove products
- Stored in localStorage
- Persists across sessions
- Real-time count in Navbar badge

### 4. Wishlist System
- Add/remove favorites
- Stored in localStorage
- Persists across sessions
- Real-time count in Navbar

### 5. Chat System
- Direct messaging between users
- Real-time message updates
- Conversation threads
- Message notifications

### 6. Profile Management
- View own products
- Edit profile details
- View purchase history
- Manage listings

### 7. Image Upload
```javascript
Flow:
1. User selects image file
2. Validate file type (image/*)
3. Upload to Supabase Storage bucket
4. Get public URL
5. Store URL in product record
```

---

## Database Schema

### Tables

#### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gender TEXT,
  email TEXT,
  student_card_url TEXT,
  rating DECIMAL DEFAULT 5.0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  category TEXT NOT NULL,
  condition TEXT,
  location TEXT,
  image TEXT,
  seller_id UUID REFERENCES users(id),
  seller_name TEXT,
  seller_rating DECIMAL,
  views INTEGER DEFAULT 0,
  is_sold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. bids (Currently Disabled - Coming Soon)
```sql
CREATE TABLE bids (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  bidder_id UUID REFERENCES users(id),
  bid_amount DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Component Relationships

### Page Components

#### Home.jsx
```
Dependencies:
- AuthContext (user data)
- ProductContext (featured products)
- Components: Hero, Categories, BrowseSection, CounterCard

Flow:
1. Display hero banner
2. Show statistics (users, products, transactions)
3. Display category slider
4. Show featured/recent products
```

#### Products.jsx
```
Dependencies:
- ProductContext (products list, search, filter)
- useSearchParams (URL query params)

Flow:
1. Get products from context
2. Apply category filter (if selected)
3. Apply search query (if provided)
4. Display in grid layout
5. Click product → Navigate to ProductDetail
```

#### ProductDetail.jsx
```
Dependencies:
- ProductContext (product data, cart, wishlist)
- AuthContext (current user)
- useParams (product ID from URL)

Flow:
1. Get product ID from URL
2. Fetch product details
3. Display product info
4. Show seller details
5. Actions: Add to Cart, Add to Wishlist, Contact Seller
6. If owner: Edit/Delete options
```

#### Sell.jsx
```
Dependencies:
- ProductContext (addProduct)
- AuthContext (seller info)
- Supabase Storage (image upload)

Flow:
1. Display product form
2. User fills details
3. Upload image to storage
4. Create product record
5. Redirect to Products page
```

#### Cart.jsx
```
Dependencies:
- ProductContext (cartItems, removeFromCart)

Flow:
1. Display cart items
2. Show total price
3. Remove item option
4. Checkout button (future feature)
```

#### Wishlist.jsx
```
Dependencies:
- ProductContext (favorites, removeFromFavorites)

Flow:
1. Display favorited products
2. Remove from wishlist option
3. Click product → Navigate to ProductDetail
```

#### Chat.jsx
```
Dependencies:
- AuthContext (current user)
- Supabase (messages table)

Flow:
1. Display conversation list
2. Select conversation
3. Show message thread
4. Send new message
5. Real-time message updates
```

#### Profile.jsx
```
Dependencies:
- AuthContext (user data)
- ProductContext (user's products)
- UserContext (profile operations)

Flow:
1. Display user info
2. Show user's listings
3. Edit profile option
4. View statistics
```

### Shared Components

#### Navbar.jsx
```
Features:
- Logo and branding
- Global search bar
- Cart icon with badge
- Settings dropdown (Wishlist, Chat, About, Sell)
- User profile link
- Logout button
- Mobile responsive menu

Real-time Updates:
- Cart count
- Wishlist count
```

#### Footer.jsx
```
Features:
- Logo and description
- Quick links (2-column grid)
- Categories (2-column grid)
- Trusted community section
- Newsletter subscription
- Copyright notice
```

---

## Data Flow Examples

### Example 1: Adding a Product to Cart

```
User clicks "Add to Cart" on ProductDetail
         ↓
ProductContext.addToCart(product)
         ↓
Check if already in cart
         ↓
Add to cartItems state
         ↓
Save to localStorage
         ↓
Update cart count in Navbar
         ↓
Show success toast
```

### Example 2: Creating a New Product

```
User fills Sell form
         ↓
Click "List Product"
         ↓
Validate form data
         ↓
Upload image to Supabase Storage
         ↓
Get image URL
         ↓
ProductContext.addProduct(data)
         ↓
Insert into products table
         ↓
Real-time subscription triggers
         ↓
ProductContext updates products array
         ↓
All users see new product
         ↓
Show success toast
         ↓
Redirect to Products page
```

### Example 3: User Login

```
User enters credentials
         ↓
Validate Student ID format
         ↓
AuthContext.login(studentId, password)
         ↓
Supabase.auth.signInWithPassword()
         ↓
Success → Get session
         ↓
Store in localStorage
         ↓
Fetch user profile from users table
         ↓
Update AuthContext state
         ↓
isAuthenticated = true
         ↓
Navigate to Home
         ↓
Show WelcomePopup after 15s
```

---

## Environment Variables

Required in `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# EmailJS Configuration (Newsletter)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## Future Features (Currently Disabled)

### Bidding System
- Live auctions for products
- Real-time bidding
- Bid notifications
- Auction timers
- Currently shows "Coming Soon" page

**Routes:**
- `/bids` - User's bid history
- `/live-hunting` - Active auctions

---

## Best Practices Implemented

1. **Context Pattern** - Centralized state management
2. **Protected Routes** - Secure authentication flow
3. **Real-time Updates** - Instant data synchronization
4. **Local Storage** - Persistent cart and wishlist
5. **Error Handling** - Toast notifications for user feedback
6. **Responsive Design** - Mobile-first approach
7. **Code Splitting** - Lazy loading for better performance
8. **Session Management** - Secure token handling
9. **Image Optimization** - Supabase storage with CDN
10. **Clean Architecture** - Separation of concerns

---

## Troubleshooting

### Common Issues

1. **Products not loading**
   - Check Supabase connection
   - Verify environment variables
   - Check browser console for errors

2. **Authentication fails**
   - Verify Student ID format
   - Check Supabase auth settings
   - Clear localStorage and retry

3. **Images not uploading**
   - Check Supabase storage bucket permissions
   - Verify file size limits
   - Check file type restrictions

4. **Real-time updates not working**
   - Verify Supabase real-time is enabled
   - Check subscription setup in ProductContext
   - Ensure proper table permissions

---

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel --prod
```

### Environment Variables on Vercel
- Add all `.env` variables in Vercel dashboard
- Ensure `VITE_` prefix for Vite variables

---

## Conclusion

CampusLoop is a comprehensive student marketplace with a well-structured architecture. The application uses modern React patterns with Context API for state management, Supabase for backend services, and implements real-time features for a dynamic user experience.

The codebase is organized into clear layers:
- **Presentation Layer** - React components and pages
- **Business Logic Layer** - Context providers
- **Data Layer** - Supabase services
- **Utility Layer** - Helper functions

This architecture ensures maintainability, scalability, and ease of adding new features.

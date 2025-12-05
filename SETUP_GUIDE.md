# 🚀 CampusLoop Setup Guide

## Quick Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

#### A. Create Storage Buckets
1. Go to Supabase Dashboard → **Storage**
2. Create two public buckets:
   - `student-cards` (for student ID cards and profile avatars)
   - `product-images` (for product listings)

#### B. Disable Email Confirmation
1. Go to: **Authentication** → **Providers** → **Email**
2. Toggle **"Confirm email"** to **OFF**
3. Click **Save**

#### C. Run Database Setup
1. Go to: **SQL Editor**
2. Copy and paste content from `COMPLETE_DATABASE_SETUP.sql`
3. Click **Run**

#### D. Fix Database Trigger (Important!)
1. Go to: **SQL Editor**
2. Copy and paste content from `FIX_TRIGGER.sql`
3. Click **Run**

### 3. Environment Variables
Create `.env` file in root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```

## Features

### Authentication
- ✅ Student ID-based login (format: sp22-bse-051)
- ✅ Signup with student card upload
- ✅ Profile management with avatar upload
- ✅ Secure authentication with Supabase

### Marketplace
- ✅ 7 Categories: Rentals, Barter, Fashion, Electronics, Free for All, Furniture, Digital Services
- ✅ Product listing with image upload
- ✅ Bidding system (max 7 days)
- ✅ Favorites/Wishlist
- ✅ Shopping cart
- ✅ Search and filter

### UI/UX
- ✅ Next-level login page with animations
- ✅ Welcome popup (appears 15s after login)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Smooth animations with Framer Motion
- ✅ Modern gradient design

## Important Files

### Configuration
- `.env` - Environment variables
- `vite.config.js` - Vite configuration

### Database
- `COMPLETE_DATABASE_SETUP.sql` - Complete database schema
- `FIX_TRIGGER.sql` - Fixed trigger for user creation
- `supabase/schema.sql` - Schema reference

### Documentation
- `README.md` - Project overview
- `SUPABASE_SETUP.md` - Detailed Supabase setup
- `QUICK_START.md` - Quick start guide
- `SETUP_GUIDE.md` - This file

## Common Issues & Solutions

### Issue: 500 Error on Signup
**Solution:** Disable email confirmation in Supabase (see step 2B above)

### Issue: Bucket Not Found (400)
**Solution:** Create storage buckets (see step 2A above)

### Issue: User Not Created in Database
**Solution:** Run FIX_TRIGGER.sql (see step 2D above)

## Storage Structure

```
student-cards/
├── sp22-bse-051.jpg          (student ID cards)
└── avatars/
    └── sp22-bse-051.jpg      (profile pictures)

product-images/
└── user-id/
    └── product-image.jpg     (product images)
```

## Testing

### Test Signup
1. Go to login page
2. Click "Sign Up"
3. Fill in:
   - Name: Test User
   - Gender: Male
   - Student Card: Upload any image
   - Student ID: sp24-tst-001
   - Password: test123
4. Click "Sign Up"
5. Should redirect to home page
6. Welcome popup appears after 15 seconds

### Test Product Creation
1. Login
2. Go to "Sell" page
3. Fill in product details
4. Upload product image
5. Submit
6. Product should appear in listings

## Tech Stack

- **Frontend:** React + Vite
- **Styling:** CSS3 with custom animations
- **Animations:** Framer Motion
- **Icons:** React Icons
- **Backend:** Supabase (Auth, Database, Storage)
- **Routing:** React Router

## Project Structure

```
src/
├── components/        # Reusable components
├── context/          # React context (Auth, Products, User)
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── services/         # API services
├── styles/           # CSS files
└── utils/            # Utility functions
```

## Support

For detailed setup instructions, see:
- `SUPABASE_SETUP.md` - Complete Supabase configuration
- `QUICK_START.md` - Quick start guide
- `README.md` - Project overview

---

**Status:** ✅ All features implemented and tested!

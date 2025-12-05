# Supabase Storage Setup for Student Cards

## Required Setup Steps

### 1. Configure Auth Settings (CRITICAL!)

1. Go to your Supabase Dashboard: https://nbwkpzmkyafcrhbaxeyn.supabase.co
2. Navigate to **Authentication** → **Providers** → **Email**
3. **Disable** "Confirm email" (turn it OFF)
4. Click **Save**

This is required because we're using fake email addresses (student.local domain) for student IDs.

### 2. Create Storage Buckets

#### A. Student Cards Bucket
1. Navigate to **Storage** in the left sidebar
2. Click **New Bucket**
3. Configure the bucket:
   - **Name**: `student-cards`
   - **Public bucket**: ✅ Enable (so student cards can be accessed via public URLs)
   - Click **Create bucket**

#### B. Product Images Bucket
1. Click **New Bucket** again
2. Configure the bucket:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Enable (so product images can be accessed via public URLs)
   - Click **Create bucket**

### 3. Set Bucket Policies (Important!)

After creating the buckets, you need to set up policies to allow authenticated users to upload files:

#### A. Student Cards Bucket Policies
1. Click on the `student-cards` bucket
2. Go to **Policies** tab
3. Click **New Policy** and paste this SQL:

```sql
-- Allow authenticated users to upload and update
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'student-cards')
WITH CHECK (bucket_id = 'student-cards');

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-cards');
```

#### B. Product Images Bucket Policies
1. Click on the `product-images` bucket
2. Go to **Policies** tab
3. Click **New Policy** and paste this SQL:

```sql
-- Allow authenticated users to upload and update product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Allow public read access to product images
CREATE POLICY "Public read access to product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

### 4. Verify Setup

Test the upload by:
1. Running your app: `npm run dev`
2. Going to the signup page
3. Filling out the form with a student card image
4. Checking the Supabase Storage dashboard to see if the file appears

## What Was Fixed

### Authentication Flow Improvements:

1. **Sign Up First, Then Upload**: The user account is created FIRST, then the student card is uploaded while authenticated. This avoids RLS policy issues.

2. **Better Error Handling**: If the image upload fails, the account is still created but a warning is shown. This prevents users from being blocked.

3. **Graceful Degradation**: Account creation succeeds even if image upload fails, allowing users to contact support to fix it later.

4. **Public URL Storage**: The public URL of the uploaded student card is stored in the user's metadata (`studentCardUrl`), making it easy to retrieve later.

5. **Required Validation**: Added validation to ensure a student card file is provided before attempting signup.

## Technical Details

### Email Format
Student IDs are converted to email format for Supabase authentication:
- Student ID: `sp22-bse-051`
- Email: `sp22bse051@campusloop.com`

The dashes are removed to create a valid email address.

### File Naming Convention
Student cards are saved with the format: `{studentId}.{extension}`
- Example: `sp22-bse-051.jpg`
- This makes it easy to find a specific student's card

## Accessing Student Cards

To retrieve a student's card URL from their profile:
```javascript
const studentCardUrl = user?.user_metadata?.studentCardUrl;
```

## Troubleshooting

### "Failed to upload student card: new row violates row-level security policy"
- Make sure you've created the storage policies (Step 2 above)
- Verify the bucket is set to public

### "Failed to upload student card: Bucket not found"
- Create the `student-cards` bucket in Supabase Storage (Step 2A)

### "Failed to upload product image: Bucket not found"
- Create the `product-images` bucket in Supabase Storage (Step 2B)

### Image uploads but signup fails
- Check your email confirmation settings in Supabase Auth settings
- The cleanup function will automatically remove the uploaded image

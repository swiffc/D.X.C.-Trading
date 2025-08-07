# Supabase Setup Guide for BTMM Trading App (No Auth)

## Required Environment Variables for Vercel

Set these in your Vercel project settings:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Setup Steps

### 1. Run Main Schema
First, run the main database schema in your Supabase SQL Editor:
```sql
-- Copy and paste the contents of database/schema.sql
```

### 2. Create Default User
Run the default user creation script:
```sql
-- Copy and paste the contents of database/create-default-user.sql
```

### 3. Update Storage Policies for No-Auth
**IMPORTANT**: Run this to fix screenshot storage for no-auth setup:
```sql
-- Copy and paste the contents of database/update-storage-policies-no-auth.sql
```

## Storage Bucket Configuration

### Verify Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Ensure the `trade-screenshots` bucket exists
3. Make sure it's set to **Public**

### Manual Storage Setup (if needed)
If the bucket doesn't exist, create it manually:

1. **Create Bucket:**
   - Name: `trade-screenshots`
   - Public: ✅ **Enabled**

2. **Set Policies** (or use the SQL script above):
   - Allow public uploads
   - Allow public reads  
   - Allow public deletes

## How Screenshot Storage Works

### File Organization
Screenshots are stored in this structure:
```
trade-screenshots/
└── screenshots/
    └── default-user/
        ├── uuid1.jpg
        ├── uuid2.png
        └── uuid3.gif
```

### Database Integration
- **Screenshots table**: Stores metadata (filename, description, type, etc.)
- **Supabase Storage**: Stores actual image files
- **Public URLs**: Generated automatically for display

### Supported File Types
- JPG/JPEG
- PNG
- GIF
- Maximum file size: Depends on your Supabase plan

## Testing Screenshot Upload

### Frontend Testing
1. Navigate to the **Screenshots** tab
2. Click **Upload Screenshot**
3. Select an image file
4. Add description and type
5. Upload should succeed and display in the grid

### API Testing
```bash
# Test upload endpoint
curl -X POST http://your-app.vercel.app/api/screenshots/upload \
  -F "file=@your-image.jpg" \
  -F "screenshot_type=entry" \
  -F "description=Test screenshot"
```

## Troubleshooting

### Common Issues

1. **Upload fails with permission error**
   - ✅ Run the storage policies update script
   - ✅ Ensure bucket is public

2. **Images don't display**
   - ✅ Check if public URLs are being generated
   - ✅ Verify bucket public access

3. **Environment variables not working**
   - ✅ Check Vercel environment variable names
   - ✅ Redeploy after adding variables

### Vercel Environment Variables Check
Make sure these are set in your Vercel project:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_KEY` 
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

⚠️ **Public Access Warning**: Since authentication is removed, anyone can upload/delete screenshots. This setup is ideal for:
- Demo applications
- Portfolio projects
- Internal/private deployments

For production with real data, consider re-implementing authentication.

## Features Included

✅ **Upload screenshots** with metadata  
✅ **Link screenshots to trades**  
✅ **Categorize by type** (entry, exit, analysis, etc.)  
✅ **Add descriptions**  
✅ **View in organized grid**  
✅ **Delete screenshots** (removes from both storage and database)  
✅ **Public URL generation** for immediate display
# Nexus System Migration Guide

## Phase 1: Foundation Setup

### Completed Steps

1. ✅ Installed Vite build system and dependencies
2. ✅ Created `src/` directory structure
3. ✅ Configured Vite with multi-page build support
4. ✅ Extracted shared Supabase configuration to `src/lib/supabase.js`
5. ✅ Added Supabase Storage helper functions

### Supabase Storage Setup (Required)

To migrate from base64 screenshot storage to Supabase Storage, follow these steps:

#### 1. Create Storage Bucket

In your Supabase Dashboard:

**DEV Database** (jatwmjrybucdpttbigoi):
1. Go to Storage → Create bucket
2. Name: `screenshots`
3. Public bucket: ✅ Yes (checked)
4. File size limit: 5MB (recommended)
5. Allowed MIME types: `image/png, image/jpeg`

**PROD Database** (iqlndhxlkjmqavpllhcl):
- Repeat the same steps above

#### 2. Update dev_notes Table Schema

Add a new column for screenshot URLs:

```sql
-- Add screenshot_url column
ALTER TABLE dev_notes
ADD COLUMN screenshot_url TEXT;

-- Add screenshot_path column (for deletion)
ALTER TABLE dev_notes
ADD COLUMN screenshot_path TEXT;

-- Optional: Add index for better query performance
CREATE INDEX idx_dev_notes_screenshot_url ON dev_notes(screenshot_url);
```

Run this SQL in both DEV and PROD databases.

#### 3. Migration Strategy

**Option A: Keep existing base64 screenshots** (Recommended for now)
- New screenshots will use Storage
- Old base64 screenshots remain in database
- Gradually clean up old screenshots manually

**Option B: Migrate existing screenshots**
- Requires a migration script to convert base64 → Storage
- More complex but cleaner database

### Next Steps

- [ ] Create screenshots bucket in Supabase (both DEV and PROD)
- [ ] Run SQL migration to add columns
- [ ] Extract DevNotes component
- [ ] Extract ScreenshotCapture component
- [ ] Update apps to use new Supabase module
- [ ] Test screenshot upload/download

---

## Project Structure

```
/
├── index.html              # Launcher (will become entry point)
├── intent_logger.html      # Intent Logger app
├── habit_tracker.html      # Habit Tracker app
├── split.html              # Split expense app
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
├── src/
│   ├── lib/
│   │   └── supabase.js    # Shared Supabase config + Storage helpers
│   ├── components/
│   │   ├── DevNotes/      # Dev notes component (TBD)
│   │   └── ScreenshotCapture/  # Screenshot component (TBD)
│   ├── apps/              # App-specific JS modules (TBD)
│   ├── styles/            # Shared styles (TBD)
│   └── assets/            # Images, fonts, etc.
```

---

## Usage

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

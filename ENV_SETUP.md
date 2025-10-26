# Environment Variables Setup Guide

## Image Loading Issues Fix

If you're experiencing issues where images don't load initially but appear after opening DevTools, this is likely due to missing or incorrect environment variable configuration.

## Required Environment Variables

### 1. CDN URL Configuration

Create a `.env.local` file in the root of your project (if it doesn't exist) and add:

```env
NEXT_PUBLIC_CDN_URL=https://your-cdn-url.com
```

**Important Notes:**
- The `NEXT_PUBLIC_` prefix is required for the variable to be available in the browser
- Replace `https://your-cdn-url.com` with your actual CDN URL
- For local development, you might use: `http://localhost:3001` or a local path

### 2. Verifying Your Setup

After setting up the environment variable:

1. **Restart your development server** - Environment variables are only loaded on server start
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   # or
   yarn dev
   ```

2. **Check the console** - Open browser DevTools and look for any warnings about undefined CDN URLs

3. **Verify in the code** - You can temporarily add this to check:
   ```javascript
   console.log('CDN URL:', process.env.NEXT_PUBLIC_CDN_URL);
   ```

## Common Issues and Solutions

### Issue 1: Images show "undefined" in the URL
**Solution:** Your `NEXT_PUBLIC_CDN_URL` is not set. Create or update your `.env.local` file.

### Issue 2: Images load in DevTools but not normally
**Solution:** This was caused by aggressive cache settings. This has been fixed in `next.config.js` to properly cache images while allowing dynamic content updates.

### Issue 3: Some images load, others don't
**Solution:** Check that all image paths are correct and the CDN contains all required assets. The app now includes better error handling with fallback images.

## Image Loading Optimizations Applied

The following optimizations have been implemented:

1. **Improved Cache Control**
   - Static assets cached for 1 year
   - Images cached for 24 hours with stale-while-revalidate
   - Only HTML pages have no-store for locale switching

2. **Priority Loading**
   - Critical above-the-fold images now use `priority` prop
   - Prevents lazy loading of hero images

3. **Error Handling**
   - New `OptimizedImage` component with automatic fallback
   - Console warnings for missing CDN configuration
   - Graceful degradation when images fail to load

4. **CDN URL Validation**
   - Asset helper functions now validate CDN URL before use
   - Clear warnings when CDN URL is not configured

## Testing Your Changes

1. Clear your browser cache (or use incognito mode)
2. Reload the page
3. All images should load immediately without needing to open DevTools

## Example .env.local File

```env
# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://cdn.example.com

# Other environment variables...
# Add any other NEXT_PUBLIC_ variables your app needs
```

## Need Help?

If images are still not loading:
1. Check browser console for specific error messages
2. Verify CDN URL is accessible (try opening it directly in browser)
3. Ensure all image paths in the CDN match what the code expects
4. Check network tab to see which images are failing and why


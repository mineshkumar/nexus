import { createClient } from '@supabase/supabase-js';

// Environment-based configuration
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');

const SUPABASE_CONFIG = isLocalhost ? {
  url: 'https://jatwmjrybucdpttbigoi.supabase.co',
  key: 'sb_publishable_egBQSs0z5JvbYe68eqt5rA_rKN31Fxz'
} : {
  url: 'https://iqlndhxlkjmqavpllhcl.supabase.co',
  key: 'sb_publishable_sE922DO0e6S-O-K4s0c9yg_o_5p95Ji'
};

export const SUPABASE_URL = SUPABASE_CONFIG.url;
export const SUPABASE_KEY = SUPABASE_CONFIG.key;
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log(`Environment: ${isLocalhost ? 'DEV' : 'PROD'} | Database: ${SUPABASE_URL}`);

// Supabase Storage configuration
export const STORAGE_BUCKET = 'screenshots';

/**
 * Upload a screenshot to Supabase Storage
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} fileName - Name for the file (e.g., 'screenshot-123456.png')
 * @returns {Promise<{url: string, path: string} | null>}
 */
export async function uploadScreenshot(base64Data, fileName) {
  try {
    // Convert base64 to blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();

    // Generate unique path
    const timestamp = Date.now();
    const path = `${timestamp}-${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseClient.storage
      .from(STORAGE_BUCKET)
      .upload(path, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);

    return { url: publicUrl, path: data.path };
  } catch (err) {
    console.error('Screenshot upload failed:', err);
    return null;
  }
}

/**
 * Delete a screenshot from Supabase Storage
 * @param {string} path - Storage path to delete
 * @returns {Promise<boolean>}
 */
export async function deleteScreenshot(path) {
  try {
    const { error } = await supabaseClient.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Screenshot deletion failed:', err);
    return false;
  }
}

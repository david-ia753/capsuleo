import path from "path";
import fs from "fs";
import { mkdir } from "fs/promises";

/**
 * Utility to resolve and verify the storage directory for uploads.
 * Handles production vs development paths and implements automatic fallback
 * if the primary production storage (Railway volume) is not writable.
 */
export async function getStorageDir() {
  const isProd = process.env.NODE_ENV === "production";
  
  // Primary path: /app/storage/uploads in production, local storage/uploads in dev
  const primaryDir = isProd 
    ? "/app/storage/uploads" 
    : path.join(process.cwd(), "storage", "uploads");
  
  // Fallback path: /app/public/uploads in production, local public/uploads in dev
  const fallbackDir = isProd
    ? "/app/public/uploads"
    : path.join(process.cwd(), "public", "uploads");

  // In development, just ensure the primary exists
  if (!isProd) {
    if (!fs.existsSync(primaryDir)) {
      await mkdir(primaryDir, { recursive: true });
    }
    return primaryDir;
  }

  // In production, check writability of the primary directory
  try {
    // Ensure directory exists first
    if (!fs.existsSync(primaryDir)) {
      await mkdir(primaryDir, { recursive: true });
    }
    
    // Test write access by trying to create a temporary dummy file
    const testFile = path.join(primaryDir, `.write_test_${Date.now()}`);
    fs.writeFileSync(testFile, "test");
    fs.unlinkSync(testFile);
    
    return primaryDir;
  } catch (error: any) {
    console.error(`[STORAGE] Primary storage (${primaryDir}) is NOT writable: ${error.message}`);
    console.warn(`[STORAGE] Falling back to: ${fallbackDir}`);
    
    // Ensure fallback exists
    if (!fs.existsSync(fallbackDir)) {
      try {
        await mkdir(fallbackDir, { recursive: true });
      } catch (fallbackError: any) {
        console.error(`[STORAGE] CRITICAL: Fallback storage is also not writable: ${fallbackError.message}`);
      }
    }
    
    return fallbackDir;
  }
}

/**
 * Returns diagnostic information about the current storage status.
 */
export function getStorageDiagnostics() {
  const isProd = process.env.NODE_ENV === "production";
  const primaryDir = isProd ? "/app/storage/uploads" : path.join(process.cwd(), "storage", "uploads");
  const fallbackDir = isProd ? "/app/public/uploads" : path.join(process.cwd(), "public", "uploads");
  
  const checkAccess = (dir: string) => {
    try {
      if (!fs.existsSync(dir)) return "Directory not found";
      fs.accessSync(dir, fs.constants.W_OK);
      return "Writable";
    } catch (e: any) {
      return `Not Writable: ${e.message}`;
    }
  };

  return {
    isProduction: isProd,
    uid: typeof process.getuid === "function" ? process.getuid() : "N/A",
    gid: typeof process.getgid === "function" ? process.getgid() : "N/A",
    primary: {
      path: primaryDir,
      status: checkAccess(primaryDir)
    },
    fallback: {
      path: fallbackDir,
      status: checkAccess(fallbackDir)
    }
  };
}

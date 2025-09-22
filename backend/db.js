/**
 * Database Setup and Operations
 * SQLite database implementation for user management
 * Handles user authentication and data storage
 */

// === DATABASE DEPENDENCIES ===
import Database from 'better-sqlite3';  // Better SQLite3 database driver
import { mkdirSync, existsSync } from 'fs'; // File system operations
import path from 'path'; // Path utilities

// === DATABASE CONNECTION ===
let db; // Global database connection instance

/**
 * Initialize SQLite database
 * Creates database file and user table if they don't exist
 * @returns {Promise} - Resolves when database is ready
 */
export async function initDB() {
  try {
    // === ENSURE DATA DIRECTORY EXISTS ===
    const dbDir = './data';
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
      console.log("📁 Created data directory");
    }
    
    // === OPEN DATABASE CONNECTION ===
    db = new Database('./data/database.sqlite'); // Create database connection
    
    // === CREATE USERS TABLE ===
    // Create users table with required columns if it doesn't exist
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Auto-incrementing user ID
      username TEXT UNIQUE,                  -- Unique username constraint
      password TEXT,                         -- Hashed password storage
      data TEXT                              -- Additional user data (JSON)
    )`);
    
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

/**
 * Get database connection instance
 * @returns {Object} - Database connection object
 */
export function getDB() {
  return db;
}

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} - User object or null if not found
 */
export async function findUserByUsername(username) {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
}

/**
 * Add new user to database
 * @param {Object} user - User object with username, password, and optional data
 * @param {string} user.username - Unique username
 * @param {string} user.password - Hashed password
 * @param {string} [user.data] - Optional additional user data (JSON string)
 * @returns {Promise} - Database insertion result
 */
export async function addUser(user) {
  try {
    const stmt = db.prepare('INSERT INTO users (username, password, data) VALUES (?, ?, ?)');
    return stmt.run(user.username, user.password, user.data || null);
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
}

/**
 * Update user data field
 * @param {string} username - Username of user to update
 * @param {string} newData - New data to store (typically JSON string)
 * @returns {Promise} - Database update result
 */
export async function overwriteUserData(username, newData) {
  try {
    const stmt = db.prepare('UPDATE users SET data = ? WHERE username = ?');
    return stmt.run(newData, username);
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

/**
 * Database Setup and Operations
 * SQLite database implementation for user management
 * Handles user authentication and data storage
 */

// === DATABASE DEPENDENCIES ===
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';

// === DATABASE CONNECTION ===
let db; // Global database connection instance

/**
 * Initialize SQLite database
 * Creates database file and user table if they don't exist
 * @returns {Promise} - Resolves when database is ready
 */
export function initDB() {
  try {
    // Ensure data directory exists
    const dataDir = './data';
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    db = new Database('./data/database.sqlite');
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      data TEXT
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
export function findUserByUsername(username) {
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
export function addUser(user) {
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
export function overwriteUserData(username, newData) {
  try {
    const stmt = db.prepare('UPDATE users SET data = ? WHERE username = ?');
    return stmt.run(newData, username);
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

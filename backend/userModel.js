/**
 * User Model - In-Memory User Storage
 * Simple in-memory user store for demonstration purposes
 * 
 * NOTE: This is a development/demo implementation
 * In production, replace with proper database integration (see db.js)
 */

// === IN-MEMORY USER STORAGE ===
// Array to store user objects in memory
// WARNING: Data will be lost when server restarts
const users = [];

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Object|undefined} - User object if found, undefined otherwise
 */
export function findUserByUsername(username) {
  return users.find((user) => user.username === username);
}

/**
 * Add new user to in-memory store
 * @param {Object} user - User object to add
 * @param {string} user.username - User's username
 * @param {string} user.password - User's hashed password
 * @param {*} [user.*] - Any additional user properties
 */
export function addUser(user) {
  users.push(user);
  console.log(`User added to memory store: ${user.username}`);
}

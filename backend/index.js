// === CORE DEPENDENCIES ===
import express from "express";          // Web framework for Node.js
import cors from "cors";                // Cross-Origin Resource Sharing middleware
import dotenv from "dotenv";            // Environment variable loader

// === AUTHENTICATION DEPENDENCIES ===
import bcrypt from "bcrypt";            // Password hashing library
import jwt from "jsonwebtoken";         // JSON Web Token implementation

// === PAYMENT INTEGRATION ===
import Stripe from "stripe";            // Stripe payment processing SDK

// === DATABASE INTEGRATION ===
import { initDB, findUserByUsername, addUser } from "./db.js";

// === WEBSOCKET DEPENDENCIES ===
import http from "http";                // HTTP server for WebSocket upgrade
import { WebSocketServer } from "ws";   // WebSocket server implementation

// Load environment variables from .env file
dotenv.config();

// === SERVER SETUP ===
const app = express();                  // Create Express application
const server = http.createServer(app);  // Create HTTP server for WebSocket support

// === MIDDLEWARE CONFIGURATION ===
app.use(cors());                        // Enable CORS for all routes
app.use(express.json());                // Parse JSON request bodies


// === MULTIPLAYER WEBSOCKET SETUP ===
// WebSocket server for real-time collaborative pixel art
const wss = new WebSocketServer({ server });

// === SHARED GAME STATE ===
// Grid state: { "x,y": { color, username } }
// Stores all placed pixels with their color and owner information
let gridState = {};

/**
 * WebSocket connection handler
 * Manages real-time communication between clients for collaborative editing
 */
wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");
  
  // === INITIAL STATE SYNC ===
  // Send current grid state to newly connected client
  ws.send(JSON.stringify({ type: "init", grid: gridState }));

  /**
   * Handle incoming messages from clients
   * Processes pixel placement requests and other game actions
   */
  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      console.error("Invalid JSON message received:", e);
      return;
    }
    
    // === PIXEL PLACEMENT HANDLER ===
    if (data.type === "colorCell" && data.key && data.color && data.username) {
      // Only allow coloring if cell is empty (first-come-first-served)
      if (!gridState[data.key]) {
        // Update server grid state
        gridState[data.key] = { 
          color: data.color, 
          username: data.username 
        };
        
        // === BROADCAST TO ALL CLIENTS ===
        // Notify all connected clients of the pixel placement
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({ 
              type: "cellUpdate", 
              key: data.key, 
              color: data.color, 
              username: data.username 
            }));
          }
        });
        
        console.log(`Pixel placed at ${data.key} by ${data.username}`);
      } else {
        console.log(`Cell ${data.key} already occupied, placement rejected`);
      }
    }
    
    // TODO: Handle additional message types (payment confirmations, cooldown updates, etc.)
  });

  /**
   * Handle WebSocket disconnection
   * Clean up any client-specific resources if needed
   */
  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // TODO: Handle user disconnect logic (remove from active user list, etc.)
  });
});

// === AUTHENTICATION UTILITIES ===

/**
 * Generate JWT token for authenticated user
 * @param {Object} user - User object containing username and other details
 * @returns {string} - Signed JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { username: user.username }, 
    process.env.JWT_SECRET || "secretkey", // Use env variable or fallback
    { expiresIn: "1h" }                    // Token expires in 1 hour
  );
}

// === API ENDPOINTS ===

/**
 * Health check endpoint
 * Simple endpoint to verify server is running
 */
app.get("/api", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

/**
 * User Registration Endpoint
 * Creates new user accounts with hashed passwords
 */
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  
  // === INPUT VALIDATION ===
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  
  try {
    // === CHECK FOR EXISTING USER ===
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }
    
    // === PASSWORD HASHING ===
    // Hash password with bcrypt (10 rounds of salting)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // === CREATE USER ===
    await addUser({ username, password: hashedPassword });
    
    console.log(`New user registered: ${username}`);
    res.json({ message: "User registered successfully" });
    
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * User Login Endpoint
 * Authenticates users and returns JWT tokens
 */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // === USER LOOKUP ===
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    // === PASSWORD VERIFICATION ===
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    // === TOKEN GENERATION ===
    const token = generateToken(user);
    
    console.log(`User logged in: ${username}`);
    res.json({ token });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === SERVER STARTUP ===

// Get port from environment variable or use default
const PORT = process.env.PORT || 5000;

/**
 * Initialize and start the server
 * Sets up database connection then starts HTTP and WebSocket servers
 */
initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 WebSocket server running on port ${PORT}`);
    console.log(`🌐 Frontend should connect to: http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error("❌ Failed to initialize database:", error);
  process.exit(1);
});
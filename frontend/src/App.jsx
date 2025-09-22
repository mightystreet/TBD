
// Import React hooks for state management and side effects
import { useEffect, useState } from "react";

// Import custom components for the application layout and authentication
import Grid from "./Grid.jsx";      // Main pixel art grid component
import Side from "./Side.jsx";      // Left/right sidebar components
import Footer from "./Footer.jsx";  // Bottom footer component
import Register from "./Register.jsx"; // User registration form component
import Login from "./Login.jsx";    // User login form component
import "./App.css";                 // Application-wide styles

/**
 * Utility function to extract username from JWT token
 * Simple JWT decode implementation (no validation, just base64 decode)
 * @param {string} token - JWT token string
 * @returns {string} - Username extracted from token payload, empty string if invalid
 */
export function getUsernameFromToken(token) {
  // Return empty string if no token provided
  if (!token) return "";
  
  try {
    // Split JWT token into parts (header.payload.signature)
    // Decode the payload (middle part) from base64
    const payload = JSON.parse(atob(token.split(".")[1]));
    
    // Extract username from payload, fallback to empty string
    return payload.username || "";
  } catch {
    // Return empty string if token parsing fails
    return "";
  }
}



/**
 * Main App component - Root component that handles authentication and layout
 * Manages user authentication state and renders either auth forms or main app
 */
function App() {
  // State for storing JWT authentication token
  // Initialize from localStorage to persist login across browser sessions
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  
  // State to toggle between login and registration forms
  // true = show login form, false = show registration form
  const [showLogin, setShowLogin] = useState(true);

  /**
   * Handler function for successful user login
   * @param {string} jwt - JWT token received from backend after successful login
   */
  const handleLogin = (jwt) => {
    setToken(jwt);
  };

  /**
   * Handler function for user logout
   * Clears authentication token from both state and localStorage
   */
  const handleLogout = () => {
    setToken("");                        // Clear token from state
    localStorage.removeItem("token");    // Remove token from localStorage
  };

  // Conditional rendering: Show authentication forms if user is not logged in
  if (!token) {
    return (
      <div className="auth-container">
        {/* Toggle between login and registration forms based on showLogin state */}
        {showLogin ? (
          <>
            {/* Login form with callback to handle successful login */}
            <Login onLogin={handleLogin} />
            {/* Link to switch to registration form */}
            <p>Don't have an account? <button onClick={() => setShowLogin(false)}>Register</button></p>
          </>
        ) : (
          <>
            {/* Registration form with callback to switch back to login after registration */}
            <Register onRegister={() => setShowLogin(true)} />
            {/* Link to switch back to login form */}
            <p>Already have an account? <button onClick={() => setShowLogin(true)}>Login</button></p>
          </>
        )}
      </div>
    );
  }

  // Extract username from JWT token for display
  const username = getUsernameFromToken(token);
  
  // Main application layout (rendered when user is authenticated)
  return (
    <div className="layout-container">
      {/* Left sidebar component */}
      <Side position="left" />
      
      {/* Main content area containing the pixel art grid */}
      <main className="main-content">
        {/* User info and logout section in top-right corner */}
        <div style={{ float: "right", display: "flex", alignItems: "center", gap: 8 }}>
          {/* Display current user's username */}
          <span style={{ fontWeight: 600 }}>{username}</span>
          {/* Logout button that calls handleLogout function */}
          <button onClick={handleLogout}>Logout</button>
        </div>
        
        {/* Main pixel art grid component */}
        <Grid />
      </main>
      
      {/* Right sidebar component */}
      <Side position="right" />
      
      {/* Footer component at bottom of page */}
      <Footer />
    </div>
  );
}

// Export App component as default export for use in main.jsx
export default App;

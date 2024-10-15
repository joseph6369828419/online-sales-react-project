// src/AppRouter.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './Register';
// Ensure correct casing


function AppRouter() {
  // Initialize cart state
  const [cart, setCart] = useState([]);

 
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/register">Register</Link>
          </li>
         
        
        </ul>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
       
     
        <Route
          path="*"
          element={
            <div>
              <h2>Welcome to the Home Page</h2>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default AppRouter;

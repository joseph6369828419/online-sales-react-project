// src/AppRouter.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './Register';
import "./App.css"
// Ensure correct casing
import Home from "./Home.js"

function AppRouter() {
  const [isButtonVisible, setIsButtonVisible] = useState(true);  // Track button visibility

  const handleClick = () => {
    setIsButtonVisible(false);  // Hide the button after it's clicked
  };
 
  return (
    <Router>
     <nav>
        <ul>
          <li>
            {isButtonVisible && (
              <Link 
                to="/register" 
                className="shop-now-button" 
                onClick={handleClick}
              >
                Show Now
              </Link>
            )}
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
       
        <Route path="*" element={<Home />} />  
      </Routes>
    </Router>
  );
}

export default AppRouter;

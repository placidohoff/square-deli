import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

import MenuGrid from './components/MenuGrid';
import MenuBravo from './components/MenuBravo';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Edit from './pages/Edit';
import PrivateRoute from './components/PrivateRoute';

function KeyboardToggle() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (location.pathname === '/sandwiches') {
          navigate('/items');
        } else {
          navigate('/sandwiches');
        }
      }
      if (event.code == 'KeyE') {
        event.preventDefault();
        navigate('/edit')
      }

      console.log(event.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location, navigate]);

  return null; // Component has no UI
}

function Layout() {
  const location = useLocation();

  return (
    <div className="container-fluid">
      <KeyboardToggle />

      <header className="text-center mb-5">
        {location.pathname === '/sandwiches' && (
          <h1 className="display-1 title anton d-flex justify-content-center mt-4">
            Sandwiches
          </h1>
        )}
      </header>

      <main>
        {location.pathname === '/sandwiches' && (
          <>
            <MenuGrid />
            <p className="disclaimer">
              *We are happy to accommodate cooking preferences, but be advised that consuming raw or undercooked items may carry health risks.
            </p>
          </>
        )}

        {location.pathname === '/items' && (
          <>
            <MenuBravo />
            <p className="disclaimer">
              *Please inform your server of any allergies. Our food is prepared in kitchens that may use nuts, dairy, gluten, shellfish, and other allergens.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to /sandwiches */}
        <Route path="/" element={<Navigate to="/sandwiches" replace />} />

        {/* Actual content layout */}
        <Route path="/sandwiches" element={<Layout />} />
        <Route path="/items" element={<Layout />} />
        <Route path="/edit" element={<Edit />} />
        {/* <Route path="/admin" element={<PrivateRoute />}>
          <Route path="/admin/edit" element={<Edit />} />
        </Route> */}


        {/* Optional: 404 route */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;

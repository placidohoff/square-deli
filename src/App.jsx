import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Edit from './pages/Edit';
import Landing from './pages/Landing';
import MenuSandwiches from './components/MenuSandwiches';
import MenuDelta from './components/MenuDelta';
import MenuButtons from './components/MenuButtons';
import { useTvDisplayMode } from './utils/useTvDisplayMode';

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
  const { tvModeEnabled, needsTap, enterFullscreen } = useTvDisplayMode();

  return (
    <div className="container-fluid">
      <KeyboardToggle />
      <MenuButtons />
      <br />

      {/* <header className="text-center mb-5">
        {location.pathname === '/sandwiches' && (
          <h1 className="display-1 title anton d-flex justify-content-center mt-4">
            Sandwiches
          </h1>
        )}
      </header> */}

      <main>
        {location.pathname === '/sandwiches' && <MenuSandwiches />}
        {location.pathname === '/items' && <MenuDelta />}
      </main>

      {tvModeEnabled && <div className="tv-mode-motion-bar" />}

      {needsTap && (
        <div className="tv-mode-tap-overlay" onClick={enterFullscreen}>
          Tap to start display mode
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page with links to the menus and admin login */}
        <Route path="/" element={<Landing />} />

        {/* Actual content layout */}
        <Route path="/sandwiches" element={<Layout />} />
        <Route path="/items" element={<Layout />} />
        <Route path="/edit" element={<Edit />} />

        {/* Optional: 404 route */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;

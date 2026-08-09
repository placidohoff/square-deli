import React from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page background-wrapper text-center">
      <img
        src="/images/square-deli-grill-logo.png"
        alt="Square Deli Grill logo"
        className="landing-logo"
      />
      <h1 className="display-1 title anton mb-5">Square Deli Grill</h1>

      <div className="landing-buttons">
        <button className="menu-view-btn" onClick={() => navigate('/sandwiches')}>
          View Sandwiches
        </button>
        <button className="menu-view-btn" onClick={() => navigate('/items')}>
          View Food Items
        </button>
        <button className="menu-view-btn" onClick={() => navigate('/edit')}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Landing;

import React, { useState, useEffect } from 'react';
import {MenuItem} from './MenuItem';

const MenuGrid = () => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    // fetch('/menu.json')
    fetch('https://square-deli-menu.web.app/menu')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data); // Debugging: Check the response
        setMenuItems(Array.isArray(data.sandwiches) ? data.sandwiches : []); // Ensure it's an array
      })
      .catch(error => console.error('Error fetching menu:', error));
  }, []);
  
  

  return (
    <div className="menu-grid">
      {menuItems.map(item => (
        <MenuItem key={item.id} item={item} />
      ))}
    </div>
  );
  
};

export default MenuGrid;

import React, { useState, useEffect } from 'react';
import { MenuItem } from './MenuItem';
import { SandwichItem } from './SandwichItem';

const MenuSandwiches = () => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    fetch('https://deliprojectapi-eheyg4exevd7azgd.canadaeast-01.azurewebsites.net/api/MenuItems/sandwiches')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched sandwiches:', data);

        // Normalize prices into { size: price } OR a single number
        const formatted = data.map(item => {
          let pricesFormatted;

          if (item.prices && item.prices.length > 0) {
            pricesFormatted = item.prices.reduce((acc, p) => {
              acc[p.size] = p.price;
              return acc;
            }, {});
          } else {
            pricesFormatted = item.basePrice ?? 0;
          }

          return {
            id: item.id,
            name: item.name,
            description: item.description,
            image: item.imageUrl,
            prices: pricesFormatted
          };
        });

        setMenuItems(formatted);
      })
      .catch(error => console.error('Error fetching sandwiches:', error));
  }, []);

  return (
    <div className="menu-grid">
      {menuItems.map(item => (
        <SandwichItem key={item.id} item={item} />
      ))}
    </div>
  );
};

export default MenuSandwiches;

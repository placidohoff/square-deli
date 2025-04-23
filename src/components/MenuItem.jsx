import React from 'react';

const PriceDisplay = ({ prices }) => {
  if (typeof prices === 'number') {
    return <div className="text-end">${prices.toFixed(2)}</div>;
  }

  return (
    <div className="d-flex gap-2">
      {Object.entries(prices).map(([size, price]) => (
        <div key={size}>
          <span className="text-muted">{size}: </span>
          <span className="fw-semibold">${price.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

const MenuItem = ({ item }) => {
  return (
    <div className="d-flex gap-3 p-3 bg-white rounded shadow-sm mb-4">
      <img 
        src={`${item.image}`} 
        alt={item.name}
        className="img-fluid rounded" 
        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
      />
      <div className="d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between align-items-start">
          <h3 className="h5 mb-0">{item.name}</h3>
          <PriceDisplay prices={item.prices} />
        </div>
        <p className="mt-2 text-muted mb-0">{item.description}</p>
      </div>
    </div>
  );
};

export { MenuItem, PriceDisplay };
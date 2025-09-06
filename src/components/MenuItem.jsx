import React from 'react';

const PriceDisplay = ({ prices }) => {
  if (typeof prices === 'number') {
    return <div className="text-end fw-bold" style={{fontSize: "20px"}}>${prices.toFixed(2)}</div>;
  }

  return (
    <div className="d-flex gap-2">
      {Object.entries(prices).map(([size, price]) => (
        <div key={size}>
          <span className="text-muted text-uppercase small fw-bold">{size}: </span><br />
          <span className="fw-bold" style={{fontSize: "20px"}}>${price.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

const MenuItem = ({ item }) => {
  return (
    <div className="d-flex flex-column p-3 border rounded shadow-sm mb-4">
      <img 
        // src={`images/sandwiches/${item.image}`} 
        // src={`https://square-deli-menu.web.app/public/images/sandwiches/${item.image}`} 
        src={`https://square-deli-menu.web.app/images/sandwiches/${item.image}`} 
        alt={item.name}
        className="img-fluid rounded mb-3" 
        style={{ width: '100%', objectFit: 'cover', maxHeight: '165px' }}
      />
      <div className="d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h3 className="h3 mb-0 fw-bold" style={{fontSize: "28px"}}>{item.name}</h3>
          <PriceDisplay prices={item.prices} />
        </div>
        <p className="text-muted mb-0 fst-italic fw-bold sandwich-desc" style={{fontSize: "larger"}}>{item.description}</p>
      </div>
    </div>
  );
};


export { MenuItem, PriceDisplay };
import React, { useEffect, useState } from "react";
import wings from "/images/wings.png";
import empanadas from "/images/empanadas-2.png";
import yaroa from "/images/yaroa.png";
import juice from "/images/juice.jpg";
import sides1 from "/images/sides1.png";
import sides2 from "/images/sides2.png";
import dessert1 from "/images/dessert1.png";
import dessert2 from "/images/dessert2.png";
import { DELI_API_ROOT } from "../Constants";

const MenuDelta = () => {
  const [menuData, setMenuData] = useState(null);
  const [menuImgs, setMenuImgs] = useState([wings, empanadas, yaroa, juice]);

  useEffect(() => {
    fetch(
      DELI_API_ROOT + "/api/MenuItems"
      // "https://deliprojectapi-eheyg4exevd7azgd.canadaeast-01.azurewebsites.net/api/MenuItems"
    )
      .then((res) => res.json())
      .then((data) => {
        // Group by category name
        const grouped = data.reduce((acc, item) => {
          const cat = item.category || "Uncategorized";

          if (!acc[cat]) acc[cat] = [];

          // Normalize price
          let displayPrice;
          if (item.prices && item.prices.length > 0) {
            // If multiple sizes, just grab the smallest for display
            displayPrice = Math.min(...item.prices.map((p) => p.price));
          } else {
            displayPrice = item.basePrice ?? 0;
          }

          acc[cat].push({
            id: item.id,
            name: item.name,
            price: displayPrice,
          });

          return acc;
        }, {});

        setMenuData(grouped);
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  if (!menuData) {
    return <div>Loading...</div>;
  }

  // Match categories from API to your layout
  const column2Sections = [
    { title: "Chicken Wings & Tenders", items: menuData["Chicken Wings"] || [], display: "left", "flavors": ["Sweet Chili", "Hot Honey Garlic", "Honey Bbq", "Buffalo", "Garlic Parmesan", "Sweet Taeriyaki", "Plain (no sauce)", "Blue cheese", "Mango Habanero", "Garlic Pepper", "Lemon Pepper"] },
    { title: "18\" N.Y. Style Pizza", items: menuData["Pizza"] || [], display: "right" },
    // { title: "18\" N.Y. Style Pizza", items: menuData["Pizza"] || [], display: "right", "toppings":["Pepperoni", "Sausage", "Bacon", "Ham", "Chicken", "& More (Ask Us)"] },
    { title: "Empanadas", items: menuData["Empanadas"] || [], display: "split" },
    { title: "Yaroa", items: menuData["Yaroa"] || [] },
    { title: "Fresh Juice", items: menuData["Fresh Juice"] || [], display: "split" },
  ];

  const column3Sections = [
    { title: "Chili Dogs", items: menuData["Chilli Dogs"] || [] },
    { title: "Sides", items: menuData["Sides"] || [], display: "split", images: [sides1] },
    { title: "Desserts", items: menuData["Desserts"] || [], display: "split", images: [dessert1] },
  ];

  const renderSplitItems = (items) => {
    const half = Math.ceil(items.length / 2);
    const left = items.slice(0, half);
    const right = items.slice(half);
    return (
      <div
        className="split-items"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <ul className="item-list" style={{ flex: 1, marginRight: "1rem" }}>
          {left.map((item) => (
            <li key={item.id} className="item">
              <span>{item.name}</span>
              <span style={{ color: "#000" }}>${item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <ul className="item-list" style={{ flex: 1 }}>
          {right.map((item) => (
            <li key={item.id} className="item">
              <span>{item.name}</span>
              <span style={{ color: "#000" }}>${item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSection = (section) => (
    <div key={section.title} className="menu-section">
      <h3 className="section-title text-center">{section.title}</h3>
      {section.display === "split" ? (
        renderSplitItems(section.items)
      ) : (
        <ul className="item-list">
          {section.items.map((item) => (
            <li key={item.id} className="item">
              <span>{item.name}</span>
              <span style={{ color: "#000" }}>${item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
      {
        section.flavors?.length > 0 && (
          <div className="row">
            {section.flavors.map((flavor, index) => (
              <div className="col-6 col-md-4 col-lg-4 mt-4" key={index}>
                <p style={{fontWeight: 'bold'}}>{flavor}</p>
              </div>
            ))}
          </div>
        )
      }
      {
        section.toppings?.length > 0 && (
          <div className="row">
            {section.toppings.map((flavor, index) => (
              <div className="col-6 col-md-3 col-lg-4 mt-4" key={index}>
                <p style={{fontWeight: 'bold'}}>{flavor}</p>
              </div>
            ))}
          </div>
        )
      }
      {Array.isArray(section.images) && section.images.length > 0 && (
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          {section.images.map((imgSrc, idx) => (
            <img
              key={idx}
              src={imgSrc}
              alt={`${section.title} image ${idx + 1}`}
              className="img-fluid"
              style={{ maxWidth: "250px", maxHeight: "200px", marginLeft: '20px' }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderPairedSections = (sections) => {
    const output = [];
    for (let i = 0; i < sections.length; i++) {
      const current = sections[i];
      const next = sections[i + 1];

      if (current.display === "left" && next?.display === "right") {
        output.push(
          <div
            key={`${current.title}-${next.title}`}
            className="menu-row"
            style={{ display: "flex", gap: "2rem" }}
          >
            <div style={{ flex: 1 }}>{renderSection(current)}</div>
            <div style={{ flex: 1 }}>{renderSection(next)}</div>
          </div>
        );
        i++;
      } else {
        output.push(renderSection(current));
      }
    }
    return output;
  };

  const RenderImagesSection = () => {
    return (
      <div className="image-gallery d-flex flex-column justify-evenly">
        {menuImgs.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Menu item ${index + 1}`}
            style={{
              maxWidth: "300px",
              height: "auto",
              padding: "5px",
              alignSelf: index % 2 === 0 ? "flex-start" : "flex-end",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="deli-menu-container">
      <div className="column" style={{ flex: ".6" }}>
        <RenderImagesSection />
      </div>
      <div
        className="column"
        style={{
          borderLeft: "1px solid #F67065",
          borderRight: "1px solid #F67065",
          flex: "1.5",
          paddingLeft: "40px",
          paddingRight: "40px",
        }}
      >
        {renderPairedSections(column2Sections)}
      </div>
      <div className="column">{renderPairedSections(column3Sections)}</div>
    </div>
  );
};

export default MenuDelta;

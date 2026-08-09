// Shared response shaping, used by every endpoint that returns menu items.
//
// Prisma returns Decimal-typed columns (basePrice, price) as Decimal objects,
// not plain JS numbers — JSON.stringify would render them as strings like
// "10.99" instead of 10.99, which the frontend doesn't expect. Number(...)
// converts them back before the response goes out.
export function formatMenuItem(item) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl,
    basePrice: item.basePrice === null ? null : Number(item.basePrice),
    category: item.category,
    prices: item.prices.map((p) => ({ size: p.size, price: Number(p.price) })),
  };
}

// The old ASP.NET API's GET /api/MenuItems/grouped keyed its response by
// these camelCase names rather than the `category` string stored on each
// item — Edit.jsx destructures the response using exactly these keys
// (data.sandwiches, data.chickenWings, ...), so the new endpoint has to
// reproduce the same mapping to stay a drop-in replacement.
export const CATEGORY_TO_GROUP_KEY = {
  Sandwiches: 'sandwiches',
  'Chicken Wings': 'chickenWings',
  Pizza: 'pizza',
  Empanadas: 'empanadas',
  Yaroa: 'yaroa',
  'Fresh Juice': 'freshJuice',
  'Chilli Dogs': 'chiliDogs',
  Sides: 'sides',
  Desserts: 'desserts',
};

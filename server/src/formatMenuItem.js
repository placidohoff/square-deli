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

// Size-based pricing arrives on multipart requests as separate fields like
// "Prices[0].Size" and "Prices[0].Price" (FormData has no native array/object
// support — this bracket notation is just how the old .NET model binder
// expected a list to be flattened, and the frontend still sends it that
// way). Shared by both POST (create) and PUT (update) since both accept the
// same shape. Collects however many indexes were sent and rebuilds the array
// from them.
export function parsePricesFromBody(body) {
  const priceIndexes = new Set();
  for (const key of Object.keys(body)) {
    const match = key.match(/^Prices\[(\d+)\]\./);
    if (match) priceIndexes.add(Number(match[1]));
  }
  return [...priceIndexes]
    .sort((a, b) => a - b)
    .map((i) => ({
      size: body[`Prices[${i}].Size`],
      price: Number(body[`Prices[${i}].Price`]),
    }));
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

// Standalone Express API backed by Postgres (via Prisma). This is being built
// up one endpoint at a time to replace the ASP.NET API — each one matches the
// old API's response shape exactly, so the frontend won't need to change
// until every endpoint it calls has a working replacement here.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { prisma } from './prisma.js';
import { formatMenuItem, CATEGORY_TO_GROUP_KEY } from './formatMenuItem.js';
import { uploadImage } from './cloudinary.js';

const app = express();
app.use(cors());

// memoryStorage keeps the uploaded file as a Buffer in req.file instead of
// writing it to disk — we forward that buffer straight to Cloudinary, so
// there's no local file to clean up afterward.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

// GET /api/MenuItems/sandwiches — used by MenuSandwiches.jsx.
// Returns: [{ id, name, description, imageUrl, basePrice, prices: [{size, price}], category }]
app.get('/api/MenuItems/sandwiches', async (req, res) => {
  try {
    const sandwiches = await prisma.menuItem.findMany({
      where: { category: 'Sandwiches' },
      // Include pulls each item's related Price rows along with it in one
      // query, instead of a separate query per item (N+1 problem).
      include: { prices: true },
      orderBy: { id: 'asc' },
    });

    res.json(sandwiches.map(formatMenuItem));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sandwiches' });
  }
});

// GET /api/MenuItems — used by MenuDelta.jsx. Every item, every category,
// flat array (MenuDelta groups them client-side by item.category itself).
app.get('/api/MenuItems', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      include: { prices: true },
      orderBy: { id: 'asc' },
    });

    res.json(items.map(formatMenuItem));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// GET /api/MenuItems/grouped — used by Edit.jsx, which destructures the
// response as data.sandwiches, data.chickenWings, data.pizza, etc. Unlike
// the two endpoints above, this one's keyed by group name instead of
// returning a flat array — see CATEGORY_TO_GROUP_KEY for the mapping.
app.get('/api/MenuItems/grouped', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      include: { prices: true },
      orderBy: { id: 'asc' },
    });

    const grouped = {};
    for (const item of items) {
      const key = CATEGORY_TO_GROUP_KEY[item.category];
      if (!key) continue; // unrecognized category — nothing in Edit.jsx would read it anyway
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(formatMenuItem(item));
    }

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch grouped menu items' });
  }
});

// PUT /api/MenuItems/:id — used by EditItemCard.jsx and EditItemCardCharlie.jsx
// on the admin Edit page. Sent as multipart/form-data (not JSON) because it
// can include a new image file. Text fields arrive as plain strings on
// req.body; `upload.single('File')` pulls the optional image out into
// req.file and leaves the rest of req.body alone.
app.put('/api/MenuItems/:id', upload.single('File'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { Name, BasePrice, Description } = req.body;

    // Size-based pricing arrives as separate fields like "Prices[0].Size"
    // and "Prices[0].Price" (FormData has no native array/object support —
    // this bracket notation is just how the old .NET model binder expected
    // a list to be flattened, and EditItemCard.jsx still sends it that way).
    // Collect however many indexes were sent and rebuild the array from them.
    const priceIndexes = new Set();
    for (const key of Object.keys(req.body)) {
      const match = key.match(/^Prices\[(\d+)\]\./);
      if (match) priceIndexes.add(Number(match[1]));
    }
    const prices = [...priceIndexes]
      .sort((a, b) => a - b)
      .map((i) => ({
        size: req.body[`Prices[${i}].Size`],
        price: Number(req.body[`Prices[${i}].Price`]),
      }));

    const data = {
      name: Name,
      basePrice: BasePrice === '' || BasePrice === undefined ? null : Number(BasePrice),
    };
    // Only touch fields that were actually sent — EditItemCardCharlie.jsx,
    // for example, never sends Description or a File, and existing values
    // for those shouldn't be wiped out just because this form doesn't have
    // inputs for them.
    if (Description !== undefined) data.description = Description;
    if (req.file) data.imageUrl = await uploadImage(req.file.buffer);

    // A transaction here means "replace this item's prices and update its
    // fields" happens as one atomic step — if either half failed partway,
    // we'd rather the whole update roll back than leave stale price rows.
    const updated = await prisma.$transaction(async (tx) => {
      if (prices.length > 0) {
        await tx.price.deleteMany({ where: { menuItemId: id } });
        data.prices = { create: prices };
      }
      return tx.menuItem.update({
        where: { id },
        data,
        include: { prices: true },
      });
    });

    res.json(formatMenuItem(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// `upload.single('File')` above runs before our route handler and reports
// its own errors (e.g. a photo over the 8MB limit) by calling next(err)
// instead of throwing inside the handler's try/catch — so they never reach
// that catch block. Without this, Express falls back to its default error
// page, which is HTML, not JSON, and the frontend's `res.json()` call would
// blow up trying to parse it. This is Express's special 4-argument
// middleware signature — the extra `err` param is what tells Express to
// treat it as an error handler rather than a normal route.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

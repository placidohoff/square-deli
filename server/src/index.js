// Standalone Express API backed by Postgres (via Prisma). This is being built
// up one endpoint at a time to replace the ASP.NET API — each one matches the
// old API's response shape exactly, so the frontend won't need to change
// until every endpoint it calls has a working replacement here.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { prisma } from './prisma.js';
import { formatMenuItem, CATEGORY_TO_GROUP_KEY, parsePricesFromBody } from './formatMenuItem.js';
import { uploadImage } from './cloudinary.js';
import { login, requireAuth } from './auth.js';
import { getTvMode, setTvMode } from './settings.js';

const app = express();
app.use(cors());
// Only /api/auth/login needs this — the PUT endpoint below is multipart
// form data, parsed by multer instead, not JSON.
app.use(express.json());

// POST /api/auth/login — used by Edit.jsx's login form.
app.post('/api/auth/login', login);

// GET/PUT /api/settings/tv-mode — the in-store TV display toggle. GET is
// public (polled by whatever's showing /sandwiches or /items on the actual
// TVs); PUT is the admin-only on/off switch in Edit.jsx.
app.get('/api/settings/tv-mode', getTvMode);
app.put('/api/settings/tv-mode', requireAuth, setTvMode);

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
      // sortOrder is what the admin's up/down move buttons actually change;
      // id (secondary) just keeps ties (e.g. right after a fresh backfill)
      // in a stable, predictable order.
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
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
      // sortOrder is what the admin's up/down move buttons actually change;
      // id (secondary) just keeps ties (e.g. right after a fresh backfill)
      // in a stable, predictable order.
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
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
      // sortOrder is what the admin's up/down move buttons actually change;
      // id (secondary) just keeps ties (e.g. right after a fresh backfill)
      // in a stable, predictable order.
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
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
// requireAuth runs first and only looks at the Authorization header, so an
// unauthenticated request gets rejected before we bother parsing the
// (possibly large) multipart body at all.
app.put('/api/MenuItems/:id', requireAuth, upload.single('File'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { Name, BasePrice, Description } = req.body;
    const prices = parsePricesFromBody(req.body);

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

// POST /api/MenuItems — creates a new item, used by the admin "+ Add Item"
// form. Same multipart shape as PUT (Name/Category/BasePrice/Description/
// Prices[i].*/File), minus an :id since there isn't one yet.
app.post('/api/MenuItems', requireAuth, upload.single('File'), async (req, res) => {
  try {
    const { Name, Category, BasePrice, Description } = req.body;

    if (!Name || !Category) {
      res.status(400).json({ error: 'Name and Category are required' });
      return;
    }

    const prices = parsePricesFromBody(req.body);
    const imageUrl = req.file ? await uploadImage(req.file.buffer) : null;

    // New items go to the end of their category's list — one more than
    // whatever the current highest sortOrder in that category is (0 if it's
    // the category's first item).
    const lastInCategory = await prisma.menuItem.findFirst({
      where: { category: Category },
      orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = (lastInCategory?.sortOrder ?? -1) + 1;

    const created = await prisma.menuItem.create({
      data: {
        name: Name,
        category: Category,
        description: Description || null,
        basePrice: BasePrice === '' || BasePrice === undefined ? null : Number(BasePrice),
        imageUrl,
        sortOrder,
        // Omitting `prices` entirely (rather than passing an empty create
        // list) when there's nothing to add avoids creating a pointless
        // empty nested write.
        ...(prices.length > 0 && { prices: { create: prices } }),
      },
      include: { prices: true },
    });

    res.status(201).json(formatMenuItem(created));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// PUT /api/MenuItems/:id/move — used by the admin up/down move buttons.
// Body: { direction: 'up' | 'down' }. Swaps this item's sortOrder with
// whichever item is immediately before/after it *within the same category*
// (sortOrder isn't unique across categories, so "up" for a sandwich has
// nothing to do with pizza's ordering).
app.put('/api/MenuItems/:id/move', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { direction } = req.body ?? {};

    if (direction !== 'up' && direction !== 'down') {
      res.status(400).json({ error: 'direction must be "up" or "down"' });
      return;
    }

    const current = await prisma.menuItem.findUnique({ where: { id } });
    if (!current) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    // "up" means earlier in the list, i.e. the nearest item with a smaller
    // sortOrder; "down" is the nearest one with a larger sortOrder.
    const neighbor = await prisma.menuItem.findFirst({
      where: {
        category: current.category,
        sortOrder: direction === 'up' ? { lt: current.sortOrder } : { gt: current.sortOrder },
      },
      orderBy: { sortOrder: direction === 'up' ? 'desc' : 'asc' },
    });

    if (!neighbor) {
      // Already first/last in its category — nothing to swap with. Not an
      // error: the UI is expected to disable the button here, but a stale
      // page or a double-click could still send the request.
      res.json({ moved: false });
      return;
    }

    await prisma.$transaction([
      prisma.menuItem.update({ where: { id: current.id }, data: { sortOrder: neighbor.sortOrder } }),
      prisma.menuItem.update({ where: { id: neighbor.id }, data: { sortOrder: current.sortOrder } }),
    ]);

    res.json({ moved: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to move menu item' });
  }
});

// DELETE /api/MenuItems/:id — used by the admin Delete button. Related
// Price rows are removed automatically (schema.prisma sets onDelete: Cascade
// on the MenuItem/Price relation), so there's nothing extra to clean up here.
app.delete('/api/MenuItems/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.menuItem.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    if (err.code === 'P2025') {
      // Prisma's "record to delete does not exist" error — already gone,
      // which for a delete is close enough to success.
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to delete menu item' });
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

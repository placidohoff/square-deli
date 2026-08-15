// DisplaySettings is a single-row table (see schema.prisma) — these two
// handlers are the only way that row gets read or written.
import { prisma } from './prisma.js';

// GET /api/settings/tv-mode — public (the TV browsers hitting /sandwiches
// and /items have no admin login), just reports the current on/off state.
// No row yet means it's never been toggled on, i.e. off — same as the
// column's own default, so there's nothing to create here.
export async function getTvMode(req, res) {
  const settings = await prisma.displaySettings.findFirst();
  res.json({ enabled: settings?.tvModeEnabled ?? false });
}

// PUT /api/settings/tv-mode — requireAuth-protected, body { enabled: boolean }.
// upsert on a fixed id (1) since this table only ever has one row; the first
// toggle is what actually creates it.
export async function setTvMode(req, res) {
  const { enabled } = req.body ?? {};

  if (typeof enabled !== 'boolean') {
    res.status(400).json({ error: 'enabled must be a boolean' });
    return;
  }

  const settings = await prisma.displaySettings.upsert({
    where: { id: 1 },
    update: { tvModeEnabled: enabled },
    create: { id: 1, tvModeEnabled: enabled },
  });

  res.json({ enabled: settings.tvModeEnabled });
}

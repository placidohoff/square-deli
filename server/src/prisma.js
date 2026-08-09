// A single shared PrismaClient instance for the whole app. Each PrismaClient
// manages its own pool of DB connections, so creating a new one per request
// would exhaust Neon's connection limit fast — import this one everywhere instead.
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

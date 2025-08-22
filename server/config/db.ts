// server/config/db.js
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

/**
 * Prisma Client — Singleton for Vercel / Next.js
 * Uses PrismaPg driver adapter for Prisma 7 compatibility.
 *
 * Pool + adapter are created lazily and cached alongside the
 * PrismaClient instance so hot-reloads don't leak connections.
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pgPool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error(
            'DATABASE_URL is not set. Cannot initialise Prisma Client.'
        );
    }

    // Re-use an existing pool when the module is re-evaluated (HMR)
    if (!globalForPrisma.pgPool) {
        globalForPrisma.pgPool = new Pool({
            connectionString,
            max: 5,               // sensible default for serverless
            idleTimeoutMillis: 30_000,
        });
    }

    const adapter = new PrismaPg(globalForPrisma.pgPool);

    return new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === 'development'
                ? ['error', 'warn']
                : ['error'],
    });
}

export const prisma: PrismaClient =
    globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;

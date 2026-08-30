import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";

// One client per process. Next.js reloads modules in dev, so it is cached on
// globalThis to avoid opening a new connection pool on every hot reload.
const globalForPrisma = globalThis as unknown as { astroPrisma?: PrismaClient };

export const db: PrismaClient =
  globalForPrisma.astroPrisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env().DATABASE_URL }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.astroPrisma = db;
}

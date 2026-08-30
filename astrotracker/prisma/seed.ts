/**
 * First-run setup for the single account.
 *
 * Idempotent: running it again updates the password and tops up the reference
 * data without touching anything you have written.
 *
 *   npm run db:seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const DEFAULT_FAILURE_REASONS = [
  { code: "no_time", label: "Lack of time" },
  { code: "no_energy", label: "Lack of energy" },
  { code: "distraction", label: "Distraction" },
  { code: "poor_planning", label: "Poor planning" },
  { code: "procrastination", label: "Procrastination" },
  { code: "emotional_state", label: "Emotional state" },
  { code: "interruption", label: "External interruption" },
  { code: "unrealistic", label: "Goal was unrealistic" },
  { code: "other", label: "Other" },
];

const DEFAULT_CATEGORIES = [
  "Discipline",
  "Career",
  "Finance",
  "Health",
  "Mind",
  "Relationships",
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set. See .env.example.");

  const email = (process.env.SEED_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.SEED_PASSWORD ?? "";
  if (!email || !password) {
    throw new Error("Set SEED_EMAIL and SEED_PASSWORD in .env before seeding.");
  }
  if (password.length < 10) {
    throw new Error("SEED_PASSWORD should be at least 10 characters.");
  }

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      name: process.env.SEED_NAME?.trim() || null,
      timezone: process.env.SEED_TIMEZONE?.trim() || "Asia/Kolkata",
    },
  });

  for (const [index, reason] of DEFAULT_FAILURE_REASONS.entries()) {
    await db.failureReason.upsert({
      where: { userId_code: { userId: user.id, code: reason.code } },
      update: { label: reason.label, sortOrder: index },
      create: { userId: user.id, ...reason, isSystem: true, sortOrder: index },
    });
  }

  for (const [index, name] of DEFAULT_CATEGORIES.entries()) {
    await db.goalCategory.upsert({
      where: { userId_name: { userId: user.id, name } },
      update: {},
      create: { userId: user.id, name, sortOrder: index },
    });
  }

  console.log(`Seeded account ${user.email}`);
  console.log(`  ${DEFAULT_FAILURE_REASONS.length} failure reasons`);
  console.log(`  ${DEFAULT_CATEGORIES.length} goal categories`);
  await db.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

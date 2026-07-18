import { prisma } from "../config/prisma.js";

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Generates a URL-safe slug from an org name, appending a short random
// suffix if the base slug is already taken (e.g. "acme" -> "acme-4f2a").
export async function generateUniqueSlug(name) {
  const base = slugify(name);
  let candidate = base;
  let attempt = 0;

  while (await prisma.organization.findUnique({ where: { slug: candidate } })) {
    attempt += 1;
    const suffix = Math.random().toString(36).slice(2, 6);
    candidate = `${base}-${suffix}`;
    if (attempt > 5) {
      throw new Error("Could not generate a unique slug — try a different org name");
    }
  }

  return candidate;
}
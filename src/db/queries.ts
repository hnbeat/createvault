import { db } from "./index";
import { references, categories, tags, referenceTags, collections, collectionReferences, users, accessRequests } from "./schema";
import { eq, like, or, desc, asc, sql } from "drizzle-orm";

// ─── Categories ──────────────────────────────────────────

export async function getAllCategories() {
  return db.select().from(categories).orderBy(asc(categories.name)).all();
}

export async function getCategoryBySlug(slug: string) {
  const result = db.select().from(categories).where(eq(categories.slug, slug)).all();
  return result[0] ?? null;
}

// ─── References ──────────────────────────────────────────

export async function getAllReferences() {
  return db
    .select({
      id: references.id,
      title: references.title,
      url: references.url,
      description: references.description,
      thumbnail: references.thumbnail,
      categoryId: references.categoryId,
      isFeatured: references.isFeatured,
      isBookmarked: references.isBookmarked,
      votes: references.votes,
      createdAt: references.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    })
    .from(references)
    .leftJoin(categories, eq(references.categoryId, categories.id))
    .orderBy(desc(references.createdAt))
    .all();
}

export async function getFeaturedReferences() {
  return db
    .select({
      id: references.id,
      title: references.title,
      url: references.url,
      description: references.description,
      thumbnail: references.thumbnail,
      categoryId: references.categoryId,
      isFeatured: references.isFeatured,
      isBookmarked: references.isBookmarked,
      votes: references.votes,
      createdAt: references.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    })
    .from(references)
    .leftJoin(categories, eq(references.categoryId, categories.id))
    .where(eq(references.isFeatured, true))
    .orderBy(desc(references.createdAt))
    .all();
}

export async function getTopVotedReferences(limit = 10) {
  return db
    .select({
      id: references.id,
      title: references.title,
      url: references.url,
      description: references.description,
      thumbnail: references.thumbnail,
      categoryId: references.categoryId,
      isFeatured: references.isFeatured,
      isBookmarked: references.isBookmarked,
      votes: references.votes,
      createdAt: references.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    })
    .from(references)
    .leftJoin(categories, eq(references.categoryId, categories.id))
    .orderBy(desc(references.votes), desc(references.createdAt))
    .limit(limit)
    .all();
}

export async function getBookmarkedReferences() {
  return db
    .select({
      id: references.id,
      title: references.title,
      url: references.url,
      description: references.description,
      thumbnail: references.thumbnail,
      categoryId: references.categoryId,
      isFeatured: references.isFeatured,
      isBookmarked: references.isBookmarked,
      votes: references.votes,
      createdAt: references.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    })
    .from(references)
    .leftJoin(categories, eq(references.categoryId, categories.id))
    .where(eq(references.isBookmarked, true))
    .orderBy(desc(references.createdAt))
    .all();
}

export async function getReferencesByCategory(categorySlug: string) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];

  return db
    .select({
      id: references.id,
      title: references.title,
      url: references.url,
      description: references.description,
      thumbnail: references.thumbnail,
      categoryId: references.categoryId,
      isFeatured: references.isFeatured,
      isBookmarked: references.isBookmarked,
      votes: references.votes,
      createdAt: references.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    })
    .from(references)
    .leftJoin(categories, eq(references.categoryId, categories.id))
    .where(eq(references.categoryId, category.id))
    .orderBy(desc(references.createdAt))
    .all();
}

export async function searchReferences(query: string) {
  const pattern = `%${query}%`;
  return db
    .select({
      id: references.id,
      title: references.title,
      url: references.url,
      description: references.description,
      thumbnail: references.thumbnail,
      categoryId: references.categoryId,
      isFeatured: references.isFeatured,
      isBookmarked: references.isBookmarked,
      votes: references.votes,
      createdAt: references.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
    })
    .from(references)
    .leftJoin(categories, eq(references.categoryId, categories.id))
    .where(
      or(
        like(references.title, pattern),
        like(references.description, pattern),
        like(references.url, pattern)
      )
    )
    .orderBy(desc(references.createdAt))
    .all();
}

export async function createReference(data: {
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  categoryId?: number;
  tagIds?: number[];
}) {
  const result = db
    .insert(references)
    .values({
      title: data.title,
      url: data.url,
      description: data.description ?? null,
      thumbnail: data.thumbnail ?? null,
      categoryId: data.categoryId ?? null,
    })
    .returning()
    .all();

  const newRef = result[0];

  if (data.tagIds && data.tagIds.length > 0 && newRef) {
    for (const tagId of data.tagIds) {
      db.insert(referenceTags)
        .values({ referenceId: newRef.id, tagId })
        .run();
    }
  }

  return newRef;
}

export async function toggleBookmark(referenceId: number) {
  const ref = db.select().from(references).where(eq(references.id, referenceId)).all();
  if (!ref[0]) return null;

  return db
    .update(references)
    .set({ isBookmarked: !ref[0].isBookmarked })
    .where(eq(references.id, referenceId))
    .returning()
    .all();
}

export async function voteReference(referenceId: number, direction: "up" | "down") {
  const delta = direction === "up" ? 1 : -1;
  return db
    .update(references)
    .set({ votes: sql`${references.votes} + ${delta}` })
    .where(eq(references.id, referenceId))
    .returning()
    .all();
}

export async function deleteReference(referenceId: number) {
  return db.delete(references).where(eq(references.id, referenceId)).returning().all();
}

export async function updateReference(
  referenceId: number,
  data: {
    title?: string;
    url?: string;
    description?: string | null;
    thumbnail?: string | null;
    categoryId?: number | null;
    isFeatured?: boolean;
  }
) {
  return db
    .update(references)
    .set(data)
    .where(eq(references.id, referenceId))
    .returning()
    .all();
}

// ─── Tags ────────────────────────────────────────────────

export async function getAllTags() {
  return db.select().from(tags).orderBy(asc(tags.name)).all();
}

export async function getTagsForReference(referenceId: number) {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
    .from(referenceTags)
    .innerJoin(tags, eq(referenceTags.tagId, tags.id))
    .where(eq(referenceTags.referenceId, referenceId))
    .all();
}

export async function createTag(name: string) {
  const slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
  return db.insert(tags).values({ name, slug }).returning().all();
}

export async function addTagToReference(referenceId: number, tagId: number) {
  // Check if already exists
  const existing = db
    .select()
    .from(referenceTags)
    .where(
      sql`${referenceTags.referenceId} = ${referenceId} AND ${referenceTags.tagId} = ${tagId}`
    )
    .all();
  if (existing.length > 0) return existing[0];
  return db.insert(referenceTags).values({ referenceId, tagId }).returning().all();
}

export async function removeTagFromReference(referenceId: number, tagId: number) {
  return db
    .delete(referenceTags)
    .where(
      sql`${referenceTags.referenceId} = ${referenceId} AND ${referenceTags.tagId} = ${tagId}`
    )
    .returning()
    .all();
}

// ─── Collections ─────────────────────────────────────────

export async function getAllCollections() {
  return db.select().from(collections).orderBy(asc(collections.name)).all();
}

export async function getTeamFavorites() {
  return db
    .select()
    .from(collections)
    .where(
      or(
        eq(collections.slug, "jonathans-favorites"),
        eq(collections.slug, "brandons-favorites"),
        eq(collections.slug, "hazars-favorites")
      )
    )
    .all();
}

export async function getCollectionBySlug(slug: string) {
  const result = db.select().from(collections).where(eq(collections.slug, slug)).all();
  return result[0] ?? null;
}

export async function getCollectionReferences(collectionSlug: string) {
  const collection = await getCollectionBySlug(collectionSlug);
  if (!collection) return { collection: null, refs: [] };

  const refs = db
    .select({
      id: references.id,
      title: references.title,
      url: references.url,
      description: references.description,
      thumbnail: references.thumbnail,
      categoryId: references.categoryId,
      isFeatured: references.isFeatured,
      isBookmarked: references.isBookmarked,
      votes: references.votes,
      createdAt: references.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryIcon: categories.icon,
      categoryColor: categories.color,
      order: collectionReferences.order,
    })
    .from(collectionReferences)
    .innerJoin(references, eq(collectionReferences.referenceId, references.id))
    .leftJoin(categories, eq(references.categoryId, categories.id))
    .where(eq(collectionReferences.collectionId, collection.id))
    .orderBy(asc(collectionReferences.order))
    .all();

  return { collection, refs };
}

// ─── Users ───────────────────────────────────────────────

export async function getUserByEmail(email: string) {
  const result = db.select().from(users).where(eq(users.email, email)).all();
  return result[0] ?? null;
}

export async function createUser(email: string, name: string, role: string = "user") {
  return db.insert(users).values({ email, name, role }).returning().all();
}

export async function getAllUsers() {
  return db.select().from(users).orderBy(asc(users.name)).all();
}

export async function deleteUser(userId: number) {
  return db.delete(users).where(eq(users.id, userId)).returning().all();
}

export async function updateUserRole(userId: number, role: string) {
  return db.update(users).set({ role }).where(eq(users.id, userId)).returning().all();
}

// ─── Admin helpers ───────────────────────────────────────

export async function deleteCategory(categoryId: number) {
  return db.delete(categories).where(eq(categories.id, categoryId)).returning().all();
}

export async function createCategory(data: { name: string; slug: string; description?: string; icon?: string; color?: string }) {
  return db.insert(categories).values(data).returning().all();
}

export async function updateCategory(categoryId: number, data: { name?: string; description?: string; icon?: string; color?: string }) {
  return db.update(categories).set(data).where(eq(categories.id, categoryId)).returning().all();
}

export async function deleteCollection(collectionId: number) {
  return db.delete(collections).where(eq(collections.id, collectionId)).returning().all();
}

export async function createCollection(data: { name: string; slug: string; description?: string; icon?: string }) {
  return db.insert(collections).values(data).returning().all();
}

export async function deleteTag(tagId: number) {
  return db.delete(tags).where(eq(tags.id, tagId)).returning().all();
}

export async function getUserBookmarkedReferences(/* all bookmarked refs */) {
  return db
    .select({
      id: references.id,
      title: references.title,
      url: references.url,
    })
    .from(references)
    .where(eq(references.isBookmarked, true))
    .orderBy(desc(references.createdAt))
    .all();
}

export async function publishBookmarksAsCollection(userName: string, referenceIds: number[]) {
  const slug = userName.toLowerCase().replace(/\s+/g, "-") + "s-favorites";
  const name = `${userName}'s Favorites`;

  // Check if collection already exists
  const existing = db.select().from(collections).where(eq(collections.slug, slug)).all();

  let collectionId: number;

  if (existing.length > 0) {
    collectionId = existing[0].id;
    // Clear existing references
    db.delete(collectionReferences).where(eq(collectionReferences.collectionId, collectionId)).run();
  } else {
    const result = db.insert(collections).values({
      name,
      slug,
      description: `Handpicked references by ${userName}`,
      icon: userName.charAt(0).toUpperCase(),
    }).returning().all();
    collectionId = result[0].id;
  }

  // Add references
  for (let i = 0; i < referenceIds.length; i++) {
    db.insert(collectionReferences).values({
      collectionId,
      referenceId: referenceIds[i],
      order: i,
    }).run();
  }

  return { collectionId, slug, name, count: referenceIds.length };
}

// ─── Access Requests ─────────────────────────────────────

export async function createAccessRequest(email: string, name: string) {
  return db.insert(accessRequests).values({ email, name, status: "pending" }).returning().all();
}

export async function getAccessRequestByEmail(email: string) {
  const result = db.select().from(accessRequests).where(eq(accessRequests.email, email)).all();
  return result[0] ?? null;
}

export async function getPendingRequests() {
  return db.select().from(accessRequests).where(eq(accessRequests.status, "pending")).orderBy(desc(accessRequests.createdAt)).all();
}

export async function getAllAccessRequests() {
  return db.select().from(accessRequests).orderBy(desc(accessRequests.createdAt)).all();
}

export async function approveRequest(requestId: number) {
  const req = db.select().from(accessRequests).where(eq(accessRequests.id, requestId)).all();
  if (!req[0]) return null;

  // Create user
  const existing = await getUserByEmail(req[0].email);
  if (!existing) {
    await createUser(req[0].email, req[0].name);
  }

  // Update request status
  db.update(accessRequests).set({ status: "approved" }).where(eq(accessRequests.id, requestId)).run();
  return req[0];
}

export async function denyRequest(requestId: number) {
  db.update(accessRequests).set({ status: "denied" }).where(eq(accessRequests.id, requestId)).run();
}

export async function deleteAccessRequest(requestId: number) {
  return db.delete(accessRequests).where(eq(accessRequests.id, requestId)).returning().all();
}

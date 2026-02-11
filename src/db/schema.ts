import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"), // emoji icon
  color: text("color"), // tailwind color class
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const references = sqliteTable("references", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"), // URL to screenshot/og image
  categoryId: integer("category_id").references(() => categories.id),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  isBookmarked: integer("is_bookmarked", { mode: "boolean" }).default(false),
  votes: integer("votes").default(0).notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const referenceTags = sqliteTable("reference_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  referenceId: integer("reference_id").notNull().references(() => references.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
});

export const collections = sqliteTable("collections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const collectionReferences = sqliteTable("collection_references", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  collectionId: integer("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  referenceId: integer("reference_id").notNull().references(() => references.id, { onDelete: "cascade" }),
  order: integer("order").default(0),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // "admin" | "user"
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const accessRequests = sqliteTable("access_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "approved" | "denied"
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// Type exports
export type AccessRequest = typeof accessRequests.$inferSelect;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Reference = typeof references.$inferSelect;
export type NewReference = typeof references.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

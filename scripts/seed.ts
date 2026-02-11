import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../src/db/schema";

const sqlite = new Database("sqlite.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

// ─── Drop & Recreate tables ─────────────────────────────
sqlite.exec(`
  DROP TABLE IF EXISTS collection_references;
  DROP TABLE IF EXISTS reference_tags;
  DROP TABLE IF EXISTS collections;
  DROP TABLE IF EXISTS tags;
  DROP TABLE IF EXISTS "references";
  DROP TABLE IF EXISTS categories;

  CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE "references" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    category_id INTEGER REFERENCES categories(id),
    is_featured INTEGER DEFAULT 0,
    is_bookmarked INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
  );

  CREATE TABLE reference_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_id INTEGER NOT NULL REFERENCES "references"(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE collection_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    reference_id INTEGER NOT NULL REFERENCES "references"(id) ON DELETE CASCADE,
    "order" INTEGER DEFAULT 0
  );
`);

console.log("✅ Tables created");

// ─── Seed Categories ─────────────────────────────────────
const categoriesData = [
  { name: "Art", slug: "art", description: "Fine art, contemporary art, and creative inspiration", icon: "🎨", color: "purple" },
  { name: "Graphic Design", slug: "graphic-design", description: "Graphic design references, branding, layouts, and visual communication", icon: "🖼️", color: "blue" },
  { name: "3D", slug: "3d", description: "3D modeling, rendering, and CGI references", icon: "🧊", color: "cyan" },
  { name: "Illustration", slug: "illustration", description: "Digital and traditional illustration, character design, and concept art", icon: "✏️", color: "orange" },
  { name: "Music", slug: "music", description: "Music production, sound design, album art, and audio references", icon: "🎵", color: "pink" },
  { name: "Trailers", slug: "trailers", description: "Film trailers, teasers, cinematography, and video editing references", icon: "🎬", color: "red" },
  { name: "Photography", slug: "photography", description: "Photography inspiration, techniques, portfolios, and stock photography", icon: "📷", color: "green" },
  { name: "Motion Graphics", slug: "motion-graphics", description: "Motion design, animated graphics, visual effects, and kinetic typography", icon: "🎞️", color: "teal" },
  { name: "Branding", slug: "branding", description: "Brand identity, logo design, brand strategy, and visual branding systems", icon: "🏷️", color: "yellow" },
  { name: "Gaming", slug: "gaming", description: "Video game design, game art, UI/UX for games, and interactive entertainment", icon: "🎮", color: "indigo" },
  { name: "Experiential", slug: "experiential", description: "Immersive experiences, installations, exhibitions, and experiential design", icon: "🌐", color: "pink" },
];

const insertedCategories = db.insert(schema.categories).values(categoriesData).returning().all();
console.log(`✅ ${insertedCategories.length} categories seeded`);

const catMap: Record<string, number> = {};
for (const cat of insertedCategories) {
  catMap[cat.slug] = cat.id;
}

// ─── Seed Tags ───────────────────────────────────────────
const tagsData = [
  { name: "Free", slug: "free" },
  { name: "Open Source", slug: "open-source" },
  { name: "Premium", slug: "premium" },
  { name: "Inspiration", slug: "inspiration" },
  { name: "Tutorial", slug: "tutorial" },
  { name: "Portfolio", slug: "portfolio" },
  { name: "AI", slug: "ai" },
  { name: "Community", slug: "community" },
  { name: "Tool", slug: "tool" },
  { name: "Stock", slug: "stock" },
  { name: "Branding", slug: "branding" },
  { name: "Motion", slug: "motion" },
  { name: "Typography", slug: "typography" },
  { name: "Color", slug: "color" },
  { name: "Concept Art", slug: "concept-art" },
  { name: "Editorial", slug: "editorial" },
];

const insertedTags = db.insert(schema.tags).values(tagsData).returning().all();
console.log(`✅ ${insertedTags.length} tags seeded`);

const tagMap: Record<string, number> = {};
for (const tag of insertedTags) {
  tagMap[tag.slug] = tag.id;
}

// ─── Seed References ─────────────────────────────────────
const referencesData = [
  // ── Art ──
  { title: "Behance", url: "https://behance.net", description: "Showcase and discover creative work across all art & design disciplines.", categoryId: catMap["art"], isFeatured: true, tagNames: ["free", "inspiration", "portfolio"] },
  { title: "ArtStation", url: "https://artstation.com", description: "The leading showcase platform for games, film, media & entertainment artists.", categoryId: catMap["art"], isFeatured: true, tagNames: ["free", "inspiration", "portfolio", "concept-art"] },
  { title: "Google Arts & Culture", url: "https://artsandculture.google.com", description: "Explore collections and stories from cultural institutions around the world.", categoryId: catMap["art"], tagNames: ["free", "inspiration"] },
  { title: "Colossal", url: "https://thisiscolossal.com", description: "Art, design, and visual culture blog covering contemporary creativity.", categoryId: catMap["art"], tagNames: ["free", "inspiration", "editorial"] },
  { title: "It's Nice That", url: "https://itsnicethat.com", description: "Championing creativity across art, illustration, photography, design, and more.", categoryId: catMap["art"], tagNames: ["free", "inspiration", "editorial"] },
  { title: "Booooooom", url: "https://booooooom.com", description: "An art and design blog curating emerging and established artists worldwide.", categoryId: catMap["art"], tagNames: ["free", "inspiration"] },

  // ── Graphic Design ──
  { title: "Dribbble", url: "https://dribbble.com", description: "Discover the world's top designers & creatives sharing their work.", categoryId: catMap["graphic-design"], isFeatured: true, tagNames: ["free", "inspiration", "community"] },
  { title: "Awwwards", url: "https://awwwards.com", description: "Awards that recognize the talent and effort of the best web designers.", categoryId: catMap["graphic-design"], isFeatured: true, tagNames: ["free", "inspiration"] },
  { title: "Godly", url: "https://godly.website", description: "Astronomically good web design inspiration from around the internet.", categoryId: catMap["graphic-design"], tagNames: ["free", "inspiration"] },
  { title: "Brand New (Under Consideration)", url: "https://underconsideration.com/brandnew", description: "Reviews and opinions on corporate and brand identity work.", categoryId: catMap["graphic-design"], tagNames: ["free", "branding", "editorial"] },
  { title: "Fonts In Use", url: "https://fontsinuse.com", description: "An archive of typography in real-world graphic design projects.", categoryId: catMap["graphic-design"], tagNames: ["free", "typography", "inspiration"] },
  { title: "Typewolf", url: "https://typewolf.com", description: "Helps designers choose the perfect font for their next design project.", categoryId: catMap["graphic-design"], tagNames: ["free", "typography", "inspiration"] },
  { title: "SiteInspire", url: "https://siteinspire.com", description: "A curated CSS gallery of the best web design inspiration.", categoryId: catMap["graphic-design"], tagNames: ["free", "inspiration"] },
  { title: "Mobbin", url: "https://mobbin.com", description: "Browse 300,000+ mobile & web app screenshots — the world's largest design reference library.", categoryId: catMap["graphic-design"], tagNames: ["free", "inspiration"] },
  { title: "Coolors", url: "https://coolors.co", description: "Generate or browse beautiful color combinations for your designs.", categoryId: catMap["graphic-design"], tagNames: ["free", "tool", "color"] },
  { title: "Realtime Colors", url: "https://realtimecolors.com", description: "Visualize your color palette on a real website in real time.", categoryId: catMap["graphic-design"], tagNames: ["free", "tool", "color"] },

  // ── 3D ──
  { title: "Sketchfab", url: "https://sketchfab.com", description: "The largest platform to publish, share, and discover 3D content online.", categoryId: catMap["3d"], isFeatured: true, tagNames: ["free", "community", "inspiration"] },
  { title: "Blender", url: "https://blender.org", description: "Free and open source 3D creation suite — modeling, animation, rendering, and more.", categoryId: catMap["3d"], isFeatured: true, tagNames: ["free", "open-source", "tool"] },
  { title: "Poly Haven", url: "https://polyhaven.com", description: "Free high quality 3D assets — HDRIs, textures, and models for everyone.", categoryId: catMap["3d"], tagNames: ["free", "stock"] },
  { title: "Spline", url: "https://spline.design", description: "A 3D design tool for creating interactive experiences in the browser.", categoryId: catMap["3d"], tagNames: ["free", "tool"] },
  { title: "Three.js", url: "https://threejs.org", description: "JavaScript 3D library for creating and displaying 3D graphics on the web.", categoryId: catMap["3d"], tagNames: ["free", "open-source", "tool"] },
  { title: "CGSociety", url: "https://cgsociety.org", description: "The most respected global community for digital artists in film, games, and VFX.", categoryId: catMap["3d"], tagNames: ["free", "community", "inspiration"] },
  { title: "Turbosquid", url: "https://turbosquid.com", description: "3D models marketplace for games, architecture, and design professionals.", categoryId: catMap["3d"], tagNames: ["premium", "stock"] },

  // ── Illustration ──
  { title: "Procreate Folio", url: "https://folio.procreate.com", description: "Discover and share artwork made with Procreate by artists worldwide.", categoryId: catMap["illustration"], isFeatured: true, tagNames: ["free", "inspiration", "community"] },
  { title: "Illustration Age", url: "https://illustrationage.com", description: "Resources, portfolios, and inspiration for illustrators of all styles.", categoryId: catMap["illustration"], tagNames: ["free", "inspiration", "editorial"] },
  { title: "unDraw", url: "https://undraw.co", description: "Open-source illustrations for any idea. Beautiful, customizable SVGs.", categoryId: catMap["illustration"], tagNames: ["free", "open-source", "stock"] },
  { title: "Storyset", url: "https://storyset.com", description: "Free customizable illustrations — animate, customize, and download.", categoryId: catMap["illustration"], tagNames: ["free", "stock", "motion"] },
  { title: "DrawKit", url: "https://drawkit.com", description: "Beautiful, free illustrations updated weekly. Hand-drawn vector packs.", categoryId: catMap["illustration"], tagNames: ["free", "stock"] },
  { title: "Humaaans", url: "https://humaaans.com", description: "Mix-and-match illustrations of people with a design library.", categoryId: catMap["illustration"], tagNames: ["free", "stock"] },
  { title: "Adobe Fresco", url: "https://adobe.com/products/fresco.html", description: "Digital painting and drawing app with natural brushes and vectors.", categoryId: catMap["illustration"], tagNames: ["tool"] },

  // ── Music ──
  { title: "Spotify for Artists", url: "https://artists.spotify.com", description: "Tools and analytics for music artists to understand and grow their audience.", categoryId: catMap["music"], isFeatured: true, tagNames: ["free", "tool"] },
  { title: "Splice", url: "https://splice.com", description: "Royalty-free sounds, samples, and loops for music production.", categoryId: catMap["music"], tagNames: ["premium", "stock", "tool"] },
  { title: "Freesound", url: "https://freesound.org", description: "Collaborative database of Creative Commons licensed audio samples.", categoryId: catMap["music"], tagNames: ["free", "open-source", "stock"] },
  { title: "Artlist", url: "https://artlist.io", description: "Royalty-free music and SFX licensing for video creators.", categoryId: catMap["music"], tagNames: ["premium", "stock"] },
  { title: "Bandcamp", url: "https://bandcamp.com", description: "Discover amazing music and directly support the artists who make it.", categoryId: catMap["music"], tagNames: ["free", "inspiration", "community"] },
  { title: "Epidemic Sound", url: "https://epidemicsound.com", description: "Royalty-free music and sound effects for content creators.", categoryId: catMap["music"], tagNames: ["premium", "stock"] },

  // ── Trailers ──
  { title: "Art of the Title", url: "https://artofthetitle.com", description: "Leading resource for title sequence design in film, TV, and beyond.", categoryId: catMap["trailers"], isFeatured: true, tagNames: ["free", "inspiration", "motion"] },
  { title: "Vimeo Staff Picks", url: "https://vimeo.com/channels/staffpicks", description: "The best short films, motion graphics, and creative video curated by Vimeo.", categoryId: catMap["trailers"], tagNames: ["free", "inspiration", "motion"] },
  { title: "Stash Media", url: "https://stashmedia.tv", description: "Curated collection of the best motion design, VFX, and animation.", categoryId: catMap["trailers"], tagNames: ["inspiration", "motion"] },
  { title: "Motionographer", url: "https://motionographer.com", description: "Inspiring and promoting the best motion design, animation, and visual effects.", categoryId: catMap["trailers"], tagNames: ["free", "inspiration", "motion"] },
  { title: "The Trailer Park", url: "https://youtube.com/@TrailerCity", description: "High-quality movie trailers and teasers for cinematic reference.", categoryId: catMap["trailers"], tagNames: ["free", "inspiration"] },
  { title: "Mixkit", url: "https://mixkit.co", description: "Free stock videos, music, and video templates for your projects.", categoryId: catMap["trailers"], tagNames: ["free", "stock", "motion"] },

  // ── Photography ──
  { title: "Unsplash", url: "https://unsplash.com", description: "Beautiful, free images and photos you can download and use for any project.", categoryId: catMap["photography"], isFeatured: true, tagNames: ["free", "stock"] },
  { title: "Pexels", url: "https://pexels.com", description: "Free stock photos, royalty-free images & videos shared by creators.", categoryId: catMap["photography"], tagNames: ["free", "stock"] },
  { title: "500px", url: "https://500px.com", description: "Photography community for discovering, sharing, and licensing photos.", categoryId: catMap["photography"], tagNames: ["free", "inspiration", "community", "portfolio"] },
  { title: "Flickr", url: "https://flickr.com", description: "One of the best online photo management and sharing platforms.", categoryId: catMap["photography"], tagNames: ["free", "community"] },
  { title: "LensCulture", url: "https://lensculture.com", description: "Contemporary photography from around the world — exhibitions, awards, and features.", categoryId: catMap["photography"], tagNames: ["free", "inspiration", "editorial"] },
  { title: "1x.com", url: "https://1x.com", description: "Curated photography platform with carefully selected world-class images.", categoryId: catMap["photography"], tagNames: ["free", "inspiration"] },
  { title: "Magnum Photos", url: "https://magnumphotos.com", description: "The world's most prestigious photographic cooperative — iconic documentary photography.", categoryId: catMap["photography"], tagNames: ["inspiration", "editorial"] },
];

const insertedRefs = [];
for (const refData of referencesData) {
  const { tagNames, ...data } = refData;
  const inserted = db.insert(schema.references).values(data).returning().get();
  insertedRefs.push({ ...inserted, tagNames });
}

console.log(`✅ ${insertedRefs.length} references seeded`);

// ─── Seed Reference-Tag relationships ────────────────────
let tagRelCount = 0;
for (const ref of insertedRefs) {
  if (ref.tagNames) {
    for (const tagName of ref.tagNames) {
      const tagId = tagMap[tagName];
      if (tagId) {
        db.insert(schema.referenceTags)
          .values({ referenceId: ref.id, tagId })
          .run();
        tagRelCount++;
      }
    }
  }
}
console.log(`✅ ${tagRelCount} reference-tag relationships created`);

// ─── Seed Collections ────────────────────────────────────
const collectionsData = [
  {
    name: "Project Starter Kit",
    slug: "starter-kit",
    description: "Essential references to kickstart any new creative project",
    icon: "🚀",
  },
  {
    name: "Visual Inspiration",
    slug: "visual-inspiration",
    description: "The best places to find visual inspiration across disciplines",
    icon: "👁️",
  },
  {
    name: "Free Resources",
    slug: "free-resources",
    description: "The best free tools, assets, and resources for creatives",
    icon: "🆓",
  },
  {
    name: "Jonathan's Favorites",
    slug: "jonathans-favorites",
    description: "Handpicked references by Jonathan",
    icon: "J",
  },
  {
    name: "Brandon's Favorites",
    slug: "brandons-favorites",
    description: "Handpicked references by Brandon",
    icon: "B",
  },
  {
    name: "Hazar's Favorites",
    slug: "hazars-favorites",
    description: "Handpicked references by Hazar",
    icon: "H",
  },
];

const insertedCollections = db.insert(schema.collections).values(collectionsData).returning().all();
console.log(`✅ ${insertedCollections.length} collections seeded`);

const colMap: Record<string, number> = {};
for (const col of insertedCollections) {
  colMap[col.slug] = col.id;
}

const collectionMappings = [
  { slug: "starter-kit", titles: ["Dribbble", "Behance", "ArtStation", "Unsplash", "Coolors", "Blender", "Figma"] },
  { slug: "visual-inspiration", titles: ["Dribbble", "Awwwards", "Behance", "ArtStation", "Godly", "Colossal", "It's Nice That", "500px", "LensCulture", "Art of the Title"] },
  { slug: "free-resources", titles: ["Unsplash", "Pexels", "unDraw", "Storyset", "DrawKit", "Poly Haven", "Freesound", "Mixkit", "Blender"] },
];

let colRefCount = 0;
for (const mapping of collectionMappings) {
  const collectionId = colMap[mapping.slug];
  if (!collectionId) continue;

  for (let i = 0; i < mapping.titles.length; i++) {
    const ref = insertedRefs.find((r) => r.title === mapping.titles[i]);
    if (ref) {
      db.insert(schema.collectionReferences)
        .values({ collectionId, referenceId: ref.id, order: i })
        .run();
      colRefCount++;
    }
  }
}
console.log(`✅ ${colRefCount} collection-reference mappings created`);

console.log("\n🎉 Database seeded successfully!");
console.log("   Run `npm run dev` to start the app.");

sqlite.close();

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../src/db/schema";

const sqlite = new Database("sqlite.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

// Check if already seeded
const existing = sqlite.prepare("SELECT count(*) as cnt FROM categories").get() as { cnt: number };
if (existing.cnt > 0) {
  console.log("⏭️  Database already seeded, skipping.");
  sqlite.close();
  process.exit(0);
}

console.log("🌱 Seeding database...\n");

// ─── Seed Categories ─────────────────────────────────────
const categoriesData = [
  { name: "Art", slug: "art", description: "Fine art, contemporary art, and creative inspiration", icon: "🎨", color: "purple" },
  { name: "Graphic Design", slug: "graphic-design", description: "Graphic design references, branding, layouts, and visual communication", icon: "🖼️", color: "blue" },
  { name: "3D", slug: "3d", description: "3D modeling, rendering, motion graphics, and CGI references", icon: "🧊", color: "cyan" },
  { name: "Illustration", slug: "illustration", description: "Digital and traditional illustration, character design, and concept art", icon: "✏️", color: "orange" },
  { name: "Music", slug: "music", description: "Music production, sound design, album art, and audio references", icon: "🎵", color: "pink" },
  { name: "Trailers", slug: "trailers", description: "Film trailers, teasers, cinematography, and video editing references", icon: "🎬", color: "red" },
  { name: "Photography", slug: "photography", description: "Photography inspiration, techniques, portfolios, and stock photography", icon: "📷", color: "green" },
  { name: "Artists", slug: "artists", description: "Individual artists, portfolios, and creative practitioners to follow", icon: "👤", color: "yellow" },
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
  { name: "Articles", slug: "articles" },
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
  { title: "Behance", url: "https://behance.net", description: "Showcase and discover creative work across all art & design disciplines.", thumbnail: "https://a5.behance.net/6b16a1d00ea02302a6b0bbdb587420fc5581fd52/img/search/homepage-seo-image.webp", categoryId: catMap["art"], isFeatured: true, tagSlugs: ["free", "inspiration", "portfolio"] },
  { title: "ArtStation", url: "https://artstation.com", description: "The leading showcase platform for games, film, media & entertainment artists.", thumbnail: null, categoryId: catMap["art"], isFeatured: true, tagSlugs: ["free", "inspiration", "portfolio", "concept-art"] },
  { title: "Google Arts & Culture", url: "https://artsandculture.google.com", description: "Explore collections and stories from cultural institutions around the world.", thumbnail: "https://www.gstatic.com/culturalinstitute/images/gac-icon-200x200-v1.png", categoryId: catMap["art"], isFeatured: false, tagSlugs: ["free", "inspiration"] },
  { title: "Colossal", url: "https://thisiscolossal.com", description: "Art, design, and visual culture blog covering contemporary creativity.", thumbnail: "https://www.thisiscolossal.com/wp-content/uploads/2024/09/colossal-og.jpg", categoryId: catMap["art"], isFeatured: false, tagSlugs: ["free", "inspiration", "editorial"] },
  { title: "It's Nice That", url: "https://itsnicethat.com", description: "Championing creativity across art, illustration, photography, design, and more.", thumbnail: "https://admin.itsnicethat.com/images/HlZqd5DeXwnwpasbPY-7GiEnfME=/173987/width-1440%7Cformat-jpeg/ItsNiceThat.png", categoryId: catMap["art"], isFeatured: false, isBookmarked: true, tagSlugs: ["free", "inspiration", "editorial"] },
  { title: "Booooooom", url: "https://booooooom.com", description: "An art and design blog curating emerging and established artists worldwide.", thumbnail: "https://cdn.booooooom.com/wp-content/uploads/2018/08/logo-fb.jpg", categoryId: catMap["art"], isFeatured: false, tagSlugs: ["free", "inspiration"] },

  // ── Graphic Design ──
  { title: "Dribbble", url: "https://dribbble.com", description: "Discover the world's top designers & creatives sharing their work.", thumbnail: "https://cdn.dribbble.com/uploads/68059/original/f95c1a744395b01385a3685ba20daac0.png?1770659618", categoryId: catMap["graphic-design"], isFeatured: true, tagSlugs: ["free", "inspiration", "community"] },
  { title: "Awwwards", url: "https://awwwards.com", description: "Awards that recognize the talent and effort of the best web designers.", thumbnail: "https://assets.awwwards.com/assets/images/pages/about-certificates/awwwards.jpg", categoryId: catMap["graphic-design"], isFeatured: true, isBookmarked: true, tagSlugs: ["free", "inspiration"] },
  { title: "Godly", url: "https://godly.website", description: "Astronomically good web design inspiration from around the internet.", thumbnail: "https://godly.website/og.png", categoryId: catMap["graphic-design"], isFeatured: false, tagSlugs: ["free", "inspiration"] },
  { title: "Brand New (Under Consideration)", url: "https://underconsideration.com/brandnew", description: "Reviews and opinions on corporate and brand identity work.", thumbnail: "https://www.underconsideration.com/brandnew/wp/wp-content/uploads/2026/02/nice_portillos_type.jpg", categoryId: catMap["graphic-design"], isFeatured: false, tagSlugs: ["free", "branding", "editorial"] },
  { title: "Fonts In Use", url: "https://fontsinuse.com", description: "An archive of typography in real-world graphic design projects.", thumbnail: "https://cards.fontsinuse.com/cardshot?s=twitter&t=gallery&url=https://fontsinuse.com/&k=fea3b3b2f54abc640c7705b62dd465bd&v=ddb5541e", categoryId: catMap["graphic-design"], isFeatured: false, tagSlugs: ["free", "typography", "inspiration"] },
  { title: "Typewolf", url: "https://typewolf.com", description: "Helps designers choose the perfect font for their next design project.", thumbnail: "https://www.typewolf.com/assets/img/typewolf-og.png", categoryId: catMap["graphic-design"], isFeatured: false, tagSlugs: ["free", "typography", "inspiration"] },
  { title: "SiteInspire", url: "https://siteinspire.com", description: "A curated CSS gallery of the best web design inspiration.", thumbnail: null, categoryId: catMap["graphic-design"], isFeatured: false, tagSlugs: ["free", "inspiration"] },
  { title: "Mobbin", url: "https://mobbin.com", description: "Browse 300,000+ mobile & web app screenshots — the world's largest design reference library.", thumbnail: "https://mobbin.com/og_image.png?v=4.0", categoryId: catMap["graphic-design"], isFeatured: false, tagSlugs: ["free", "inspiration"] },
  { title: "Coolors", url: "https://coolors.co", description: "Generate or browse beautiful color combinations for your designs.", thumbnail: "https://coolors.co/assets/img/og_image.png", categoryId: catMap["graphic-design"], isFeatured: false, tagSlugs: ["free", "tool", "color"] },
  { title: "Realtime Colors", url: "https://realtimecolors.com", description: "Visualize your color palette on a real website in real time.", thumbnail: "https://realtimecolors.com/preview.png", categoryId: catMap["graphic-design"], isFeatured: false, tagSlugs: ["free", "tool", "color"] },

  // ── 3D ──
  { title: "Sketchfab", url: "https://sketchfab.com", description: "The largest platform to publish, share, and discover 3D content online.", thumbnail: "https://static.sketchfab.com/static/builds/web/dist/static/assets/images/favicon/a81e1fd93fc053fed8a5f56640f886f8-v2.png", categoryId: catMap["3d"], isFeatured: true, tagSlugs: ["free", "community", "inspiration"] },
  { title: "Blender", url: "https://blender.org", description: "Free and open source 3D creation suite — modeling, animation, rendering, and more.", thumbnail: "https://www.blender.org/wp-content/uploads/2025/10/blender_50_artwork_2K-480x270.webp", categoryId: catMap["3d"], isFeatured: true, tagSlugs: ["free", "open-source", "tool"] },
  { title: "Poly Haven", url: "https://polyhaven.com", description: "Free high quality 3D assets — HDRIs, textures, and models for everyone.", thumbnail: "https://cdn.polyhaven.com/site_images/home/window_rend.jpg?width=630&amp;quality=95", categoryId: catMap["3d"], isFeatured: false, tagSlugs: ["free", "stock"] },
  { title: "Spline", url: "https://spline.design", description: "A 3D design tool for creating interactive experiences in the browser.", thumbnail: "https://spline.design/_next/static/media/spline_image_banner.77c2eb63.png", categoryId: catMap["3d"], isFeatured: false, tagSlugs: ["free", "tool"] },
  { title: "Three.js", url: "https://threejs.org", description: "JavaScript 3D library for creating and displaying 3D graphics on the web.", thumbnail: "https://threejs.org/files/share.png", categoryId: catMap["3d"], isFeatured: false, tagSlugs: ["free", "open-source", "tool"] },
  { title: "CGSociety", url: "https://cgsociety.org", description: "The most respected global community for digital artists in film, games, and VFX.", thumbnail: null, categoryId: catMap["3d"], isFeatured: false, tagSlugs: ["free", "community", "inspiration"] },
  { title: "Turbosquid", url: "https://turbosquid.com", description: "3D models marketplace for games, architecture, and design professionals.", thumbnail: "https://static-assets.turbosquid.com/static/assets/ts_icon_full_color-47fdbacb9318e0d0990b3110bb5d4cc40ffc64b58b58fdd53513cd03b5128b02.png", categoryId: catMap["3d"], isFeatured: false, tagSlugs: ["premium", "stock"] },

  // ── Illustration ──
  { title: "Procreate Folio", url: "https://folio.procreate.com", description: "Discover and share artwork made with Procreate by artists worldwide.", thumbnail: "https://images.procreate.art/adminBucket/0F381FE8-2EEB-8AB8-491B-8E10B7AB01A6.jpg", categoryId: catMap["illustration"], isFeatured: true, tagSlugs: ["free", "inspiration", "community"] },
  { title: "Illustration Age", url: "https://illustrationage.com", description: "Resources, portfolios, and inspiration for illustrators of all styles.", thumbnail: "https://secure.gravatar.com/blavatar/15a3c848504e46b4f90118410d4b927c48207679685166d27cd7a6b2b3f010ef?s=200&#038;ts=1770342256", categoryId: catMap["illustration"], isFeatured: false, tagSlugs: ["free", "inspiration", "editorial"] },
  { title: "unDraw", url: "https://undraw.co", description: "Open-source illustrations for any idea. Beautiful, customizable SVGs.", thumbnail: "https://cdn.undraw.co/static/ud24ogimage.png", categoryId: catMap["illustration"], isFeatured: false, tagSlugs: ["free", "open-source", "stock"] },
  { title: "Storyset", url: "https://storyset.com", description: "Free customizable illustrations — animate, customize, and download.", thumbnail: null, categoryId: catMap["illustration"], isFeatured: false, tagSlugs: ["free", "stock", "motion"] },
  { title: "DrawKit", url: "https://drawkit.com", description: "Beautiful, free illustrations updated weekly. Hand-drawn vector packs.", thumbnail: "https://cdn.prod.website-files.com/626f5d0ae6c15c780f2dd5c4/6336572b684b9428785ccd40_DrawKit%20Website%20preview.png", categoryId: catMap["illustration"], isFeatured: false, tagSlugs: ["free", "stock"] },
  { title: "Humaaans", url: "https://humaaans.com", description: "Mix-and-match illustrations of people with a design library.", thumbnail: "https://cdn.prod.website-files.com/5bff8886c3964a992e90d465/5c050a75fc73fba30bf816f1_seo-rectangle.jpg", categoryId: catMap["illustration"], isFeatured: false, tagSlugs: ["free", "stock"] },
  { title: "Adobe Fresco", url: "https://adobe.com/products/fresco.html", description: "Digital painting and drawing app with natural brushes and vectors.", thumbnail: null, categoryId: catMap["illustration"], isFeatured: false, tagSlugs: ["tool"] },

  // ── Music ──
  { title: "Bandcamp", url: "https://bandcamp.com", description: "Discover amazing music and directly support the artists who make it.", thumbnail: "https://f4.bcbits.com/img/0042566101_171.jpg", categoryId: catMap["music"], isFeatured: false, tagSlugs: ["free", "inspiration", "community"] },
  { title: "Epidemic Sound", url: "https://epidemicsound.com", description: "Royalty-free music and sound effects for content creators.", thumbnail: "https://www.epidemicsound.com/staticfiles/legacy/20/images/epidemic-sound-logo-square.png", categoryId: catMap["music"], isFeatured: false, tagSlugs: ["premium", "stock"] },

  // ── Trailers ──
  { title: "Art of the Title", url: "https://artofthetitle.com", description: "Leading resource for title sequence design in film, TV, and beyond.", thumbnail: "https://artofthetitle.com/assets/resized/sm/upload/3y/qy/mk/rq/b_c-0-800-0-0.png?k=0a9283f328", categoryId: catMap["trailers"], isFeatured: true, tagSlugs: ["free", "inspiration", "motion"] },
  { title: "Vimeo Staff Picks", url: "https://vimeo.com/channels/staffpicks", description: "The best short films, motion graphics, and creative video curated by Vimeo.", thumbnail: null, categoryId: catMap["trailers"], isFeatured: false, tagSlugs: ["free", "inspiration", "motion"] },
  { title: "Stash Media", url: "https://stashmedia.tv", description: "Curated collection of the best motion design, VFX, and animation.", thumbnail: "https://stashmedia.tv/img.php?banners=banner_1556729532.jpg", categoryId: catMap["trailers"], isFeatured: false, tagSlugs: ["inspiration", "motion"] },
  { title: "Motionographer", url: "https://motionographer.com", description: "Inspiring and promoting the best motion design, animation, and visual effects.", thumbnail: "https://s0.wp.com/_si/?t=eyJpbWciOiJodHRwczpcL1wvczAud3AuY29tXC9pXC9ibGFuay5qcGciLCJ0eHQiOiJNb3Rpb25vZ3JhcGhlclx1MDBhZSIsInRlbXBsYXRlIjoiaGlnaHdheSIsImZvbnQiOiIiLCJibG9nX2lkIjoxMDMzNzIxMDV9.HDDvE6sYLMeqL5cd8QxIbMTdC-Ix-BPvkmHFOqVvRCAMQ", categoryId: catMap["trailers"], isFeatured: false, tagSlugs: ["free", "inspiration", "motion"] },
  { title: "The Trailer Park", url: "https://youtube.com/@TrailerCity", description: "High-quality movie trailers and teasers for cinematic reference.", thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_kjqOympicwHkG0FjqiVWl3NZ43jhErauq1gI7S2xc8_w=s900-c-k-c0x00ffffff-no-rj", categoryId: catMap["trailers"], isFeatured: false, tagSlugs: ["free", "inspiration"] },
  { title: "Mixkit", url: "https://mixkit.co", description: "Free stock videos, music, and video templates for your projects.", thumbnail: "https://assets.mixkit.co/mixkit-social-meta.png", categoryId: catMap["trailers"], isFeatured: false, tagSlugs: ["free", "stock", "motion"] },

  // ── Photography ──
  { title: "LensCulture", url: "https://lensculture.com", description: "Contemporary photography from around the world — exhibitions, awards, and features.", thumbnail: "https://images.lensculture.com/image/d6c6ccd9-5ea4-4de0-4784-ba78d35ec800/large", categoryId: catMap["photography"], isFeatured: false, isBookmarked: true, tagSlugs: ["free", "inspiration", "editorial"] },
  { title: "1x.com", url: "https://1x.com", description: "Curated photography platform with carefully selected world-class images.", thumbnail: "https://1x.com/assets/img/1x-logo-2.png", categoryId: catMap["photography"], isFeatured: false, tagSlugs: ["free", "inspiration"] },
  { title: "Magnum Photos", url: "https://magnumphotos.com", description: "The world's most prestigious photographic cooperative — iconic documentary photography.", thumbnail: "https://www.magnumphotos.com/wp-content/uploads/2016/05/magnum_sharing.jpg", categoryId: catMap["photography"], isFeatured: false, isBookmarked: true, tagSlugs: ["inspiration", "editorial"] },

  // ── Art (additional) ──
  { title: "Non Fiction", url: "https://nonfiction.cc/?ref=siteinspire", description: null, thumbnail: null, categoryId: catMap["art"], isFeatured: false, tagSlugs: [] },
];

const insertedRefs: (typeof referencesData[0] & { id: number })[] = [];
for (const refData of referencesData) {
  const { tagSlugs, ...data } = refData;
  const inserted = db.insert(schema.references).values(data).returning().get();
  insertedRefs.push({ ...inserted, tagSlugs } as typeof insertedRefs[0]);
}
console.log(`✅ ${insertedRefs.length} references seeded`);

// ─── Seed Reference-Tag relationships ────────────────────
let tagRelCount = 0;
for (const ref of insertedRefs) {
  if (ref.tagSlugs) {
    for (const slug of ref.tagSlugs) {
      const tagId = tagMap[slug];
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

// Helper to find ref ID by title
const refByTitle = (title: string) => insertedRefs.find((r) => r.title === title)?.id;

// ─── Seed Collections ────────────────────────────────────
const collectionsData = [
  { name: "Project Starter Kit", slug: "starter-kit", description: "Essential references to kickstart any new creative project", icon: "🚀" },
  { name: "Visual Inspiration", slug: "visual-inspiration", description: "The best places to find visual inspiration across disciplines", icon: "👁️" },
  { name: "Free Resources", slug: "free-resources", description: "The best free tools, assets, and resources for creatives", icon: "🆓" },
  { name: "Hazar's Favorites", slug: "hazars-favorites", description: "Handpicked references by Hazar", icon: "H" },
];

const insertedCollections = db.insert(schema.collections).values(collectionsData).returning().all();
console.log(`✅ ${insertedCollections.length} collections seeded`);

const colMap: Record<string, number> = {};
for (const col of insertedCollections) {
  colMap[col.slug] = col.id;
}

const collectionMappings = [
  { slug: "starter-kit", titles: ["Dribbble", "Behance", "ArtStation", "Coolors", "Blender"] },
  { slug: "visual-inspiration", titles: ["Dribbble", "Awwwards", "Behance", "ArtStation", "Godly", "Colossal", "It's Nice That", "LensCulture", "Art of the Title"] },
  { slug: "free-resources", titles: ["unDraw", "Storyset", "DrawKit", "Poly Haven", "Mixkit", "Blender"] },
  { slug: "hazars-favorites", titles: ["LensCulture", "Magnum Photos", "Awwwards", "It's Nice That"] },
];

let colRefCount = 0;
for (const mapping of collectionMappings) {
  const collectionId = colMap[mapping.slug];
  if (!collectionId) continue;

  for (let i = 0; i < mapping.titles.length; i++) {
    const refId = refByTitle(mapping.titles[i]);
    if (refId) {
      db.insert(schema.collectionReferences)
        .values({ collectionId, referenceId: refId, order: i })
        .run();
      colRefCount++;
    }
  }
}
console.log(`✅ ${colRefCount} collection-reference mappings created`);

// ─── Seed Admin User ─────────────────────────────────────
db.insert(schema.users).values({
  email: "hazar.bayindir@createadvertising.com",
  name: "Hazar",
  role: "admin",
}).run();
console.log("✅ Admin user seeded");

console.log("\n🎉 Database seeded successfully!");

sqlite.close();

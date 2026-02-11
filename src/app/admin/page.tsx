"use client";

import { useEffect, useState } from "react";
import { getDomainFromUrl, getFaviconUrl } from "@/lib/utils";

interface Reference {
  id: number;
  title: string;
  url: string;
  description: string | null;
  thumbnail: string | null;
  categoryId: number | null;
  categoryName: string | null;
  categoryIcon: string | null;
  isFeatured: boolean | null;
  isBookmarked: boolean | null;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface AccessRequest {
  id: number;
  email: string;
  name: string;
  status: string;
  createdAt: string;
}

type AdminSection = "references" | "categories" | "collections" | "requests" | "tags" | "users";

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("references");
  const [refs, setRefs] = useState<Reference[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/references").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
      fetch("/api/collections").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/requests").then((r) => r.json()),
    ])
      .then(([r, c, t, col, u, req]) => {
        setRefs(r);
        setCategories(c);
        setTags(t);
        setCollections(col);
        setUsers(u);
        setRequests(Array.isArray(req) ? req : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const sidebarItems: { key: AdminSection; label: string }[] = [
    { key: "categories", label: "Categories" },
    { key: "collections", label: "Collections" },
    { key: "references", label: "References" },
    { key: "requests", label: "Requests" },
    { key: "tags", label: "Tags" },
    { key: "users", label: "Users" },
  ];

  return (
    <div className="flex gap-6 min-h-[70vh]">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-bd pr-6">
        <h1 className="text-xl font-bold text-white mb-6">Admin Panel</h1>
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                activeSection === item.key
                  ? "bg-neutral-800 text-white"
                  : "text-white/50 hover:text-white hover:bg-neutral-900"
              }`}
            >
              {item.label}
              {item.key === "categories" && <span className="ml-2 text-white/20">{categories.length}</span>}
              {item.key === "collections" && <span className="ml-2 text-white/20">{collections.length}</span>}
              {item.key === "requests" && pendingCount > 0 && <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-red-500 text-white">{pendingCount}</span>}
              {item.key === "references" && <span className="ml-2 text-white/20">{refs.length}</span>}
              {item.key === "tags" && <span className="ml-2 text-white/20">{tags.length}</span>}
              {item.key === "users" && <span className="ml-2 text-white/20">{users.length}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-white/50">Loading...</p>
          </div>
        ) : (
          <>
            {activeSection === "references" && (
              <ReferencesSection refs={refs} categories={categories} tags={tags} onRefresh={fetchAll} />
            )}
            {activeSection === "categories" && (
              <CategoriesSection categories={categories} onRefresh={fetchAll} />
            )}
            {activeSection === "collections" && (
              <CollectionsSection collections={collections} users={users} onRefresh={fetchAll} />
            )}
            {activeSection === "requests" && (
              <RequestsSection requests={requests} onRefresh={fetchAll} />
            )}
            {activeSection === "tags" && (
              <TagsSection tags={tags} onRefresh={fetchAll} />
            )}
            {activeSection === "users" && (
              <UsersSection users={users} onRefresh={fetchAll} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REFERENCES SECTION
   ═══════════════════════════════════════════════════════════ */
function ReferencesSection({ refs, categories, tags: allTags, onRefresh }: { refs: Reference[]; categories: Category[]; tags: Tag[]; onRefresh: () => void }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", url: "", description: "", thumbnail: "", categoryId: "", isFeatured: false });
  const [editTags, setEditTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchingOg, setFetchingOg] = useState(false);
  const [batchFetching, setBatchFetching] = useState(false);

  const startEdit = (ref: Reference) => {
    setEditingId(ref.id);
    setEditForm({
      title: ref.title, url: ref.url, description: ref.description ?? "",
      thumbnail: ref.thumbnail ?? "", categoryId: ref.categoryId?.toString() ?? "",
      isFeatured: ref.isFeatured ?? false,
    });
    setNewTagName("");
    fetch(`/api/tags?referenceId=${ref.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEditTags(data); })
      .catch(() => setEditTags([]));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const res = await fetch(`/api/references/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title, url: editForm.url,
        description: editForm.description || null,
        thumbnail: editForm.thumbnail || null,
        categoryId: editForm.categoryId ? parseInt(editForm.categoryId) : null,
        isFeatured: editForm.isFeatured,
      }),
    });
    if (res.ok) { setEditingId(null); onRefresh(); }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await fetch(`/api/references/${id}`, { method: "DELETE" });
    if (res.ok) onRefresh();
  };

  const fetchOgForEdit = async () => {
    if (!editForm.url) return;
    setFetchingOg(true);
    try {
      const res = await fetch("/api/og-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: editForm.url }) });
      if (res.ok) {
        const data = await res.json();
        setEditForm((prev) => ({ ...prev, thumbnail: data.image || prev.thumbnail, title: prev.title || data.title || prev.title, description: prev.description || data.description || prev.description }));
      }
    } catch {} finally { setFetchingOg(false); }
  };

  const fetchAllMissing = async () => {
    setBatchFetching(true);
    try { const res = await fetch("/api/og-image", { method: "PATCH" }); if (res.ok) onRefresh(); } catch {} finally { setBatchFetching(false); }
  };

  const handleAddTag = async (tagId: number) => {
    if (!editingId) return;
    await fetch("/api/tags", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ referenceId: editingId, tagId }) });
    const tag = allTags.find((t) => t.id === tagId);
    if (tag && !editTags.find((t) => t.id === tagId)) setEditTags((prev) => [...prev, tag]);
  };

  const handleRemoveTag = async (tagId: number) => {
    if (!editingId) return;
    await fetch("/api/tags", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ referenceId: editingId, tagId }) });
    setEditTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const handleCreateAndAddTag = async () => {
    if (!editingId || !newTagName.trim()) return;
    const res = await fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newTagName.trim() }) });
    if (res.ok) { const tag = await res.json(); await handleAddTag(tag.id); onRefresh(); }
    setNewTagName("");
  };

  const filtered = refs.filter((r) => {
    const matchCat = !filterCategory || r.categoryId?.toString() === filterCategory;
    const matchSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">References</h2>
        <div className="flex gap-2">
          <button onClick={fetchAllMissing} disabled={batchFetching} className="border border-bd px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors disabled:opacity-40">
            {batchFetching ? "Fetching..." : "Fetch Missing Images"}
          </button>
          <a href="/submit" className="border border-white bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-200 transition-colors">+ Add New</a>
        </div>
      </div>

      <div className="flex gap-2">
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="flex-1 border border-bd bg-neutral-900 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/40" />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border border-bd bg-neutral-900 px-3 py-2 text-sm text-white outline-none">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <p className="text-xs text-white/30">{filtered.length} of {refs.length}</p>

      <div className="border border-bd">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bd bg-neutral-900">
              <th className="text-left py-2 px-3 text-xs font-medium text-white/40 uppercase">Reference</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-white/40 uppercase w-28">Category</th>
              <th className="text-left py-2 px-3 text-xs font-medium text-white/40 uppercase w-16">Img</th>
              <th className="text-right py-2 px-3 text-xs font-medium text-white/40 uppercase w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ref) => (
              <tr key={ref.id} className="border-b border-bd/30 hover:bg-neutral-900/50">
                {editingId === ref.id ? (
                  <td colSpan={4} className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" className="border border-bd bg-neutral-800 px-3 py-2 text-sm text-white outline-none" />
                        <input type="url" value={editForm.url} onChange={(e) => setEditForm({ ...editForm, url: e.target.value })} placeholder="URL" className="border border-bd bg-neutral-800 px-3 py-2 text-sm text-white outline-none" />
                      </div>
                      <input type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" className="w-full border border-bd bg-neutral-800 px-3 py-2 text-sm text-white outline-none" />
                      <div className="flex gap-2">
                        <input type="url" value={editForm.thumbnail} onChange={(e) => setEditForm({ ...editForm, thumbnail: e.target.value })} placeholder="Thumbnail URL" className="flex-1 border border-bd bg-neutral-800 px-3 py-2 text-sm text-white outline-none" />
                        <button onClick={fetchOgForEdit} disabled={fetchingOg} className="border border-bd px-3 py-2 text-xs text-white hover:bg-neutral-700 disabled:opacity-40">{fetchingOg ? "..." : "Fetch"}</button>
                      </div>
                      <select value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })} className="w-full border border-bd bg-neutral-800 px-3 py-2 text-sm text-white outline-none">
                        <option value="">No Category</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      {/* Tags */}
                      <div className="space-y-2">
                        <p className="text-xs text-white/40 uppercase tracking-wide">Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {editTags.map((t) => (
                            <span key={t.id} className="inline-flex items-center gap-1 border border-bd px-2 py-0.5 text-xs text-white/60">
                              {t.name}
                              <button onClick={() => handleRemoveTag(t.id)} className="text-white/20 hover:text-red-400">✕</button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <select onChange={(e) => { if (e.target.value) { handleAddTag(parseInt(e.target.value)); e.target.value = ""; } }} className="flex-1 border border-bd bg-neutral-800 px-2 py-1.5 text-xs text-white outline-none" defaultValue="">
                            <option value="" disabled>Add tag...</option>
                            {allTags.filter((t) => !editTags.find((et) => et.id === t.id)).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreateAndAddTag()} placeholder="New tag..." className="flex-1 border border-bd bg-neutral-800 px-2 py-1.5 text-xs text-white outline-none" />
                          <button onClick={handleCreateAndAddTag} disabled={!newTagName.trim()} className="border border-bd px-2 py-1.5 text-xs text-white hover:bg-neutral-700 disabled:opacity-40">+</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-xs text-white"><input type="checkbox" checked={editForm.isFeatured} onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })} /> Featured</label>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-white/50 hover:text-white">Cancel</button>
                          <button onClick={saveEdit} className="bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-200">Save</button>
                        </div>
                      </div>
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <img src={getFaviconUrl(ref.url)} alt="" className="h-4 w-4 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <div className="min-w-0">
                          <p className="text-white truncate text-sm">{ref.title}</p>
                          <p className="text-xs text-white/30 truncate">{getDomainFromUrl(ref.url)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-xs text-white/50">{ref.categoryName || "—"}</td>
                    <td className="py-2 px-3">
                      {ref.thumbnail ? <div className="w-8 h-5 overflow-hidden bg-neutral-800"><img src={ref.thumbnail} alt="" className="w-full h-full object-cover" /></div> : <span className="text-white/15 text-xs">—</span>}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button onClick={() => startEdit(ref)} className="px-2 py-1 text-xs text-white/40 hover:text-white hover:bg-neutral-800">Edit</button>
                      <button onClick={() => handleDelete(ref.id, ref.title)} className="px-2 py-1 text-xs text-red-400/40 hover:text-red-400">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CATEGORIES SECTION
   ═══════════════════════════════════════════════════════════ */
function CategoriesSection({ categories, onRefresh }: { categories: Category[]; onRefresh: () => void }) {
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || undefined }) });
    if (res.ok) { setNewName(""); setNewDesc(""); onRefresh(); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    await fetch("/api/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categoryId: id }) });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Categories</h2>
      {/* Add new */}
      <div className="flex gap-2">
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="Category name..." className="flex-1 border border-bd bg-neutral-900 px-3 py-2 text-sm text-white placeholder-white/20 outline-none" />
        <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)..." className="flex-1 border border-bd bg-neutral-900 px-3 py-2 text-sm text-white placeholder-white/20 outline-none" />
        <button onClick={handleAdd} disabled={!newName.trim()} className="border border-white bg-white px-4 py-2 text-xs font-medium text-black hover:bg-neutral-200 disabled:opacity-40">+ Add</button>
      </div>
      {/* List */}
      <div className="border border-bd divide-y divide-bd/50">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-900/50">
            <div>
              <p className="text-sm font-medium text-white">{cat.icon} {cat.name}</p>
              {cat.description && <p className="text-xs text-white/30 mt-0.5">{cat.description}</p>}
            </div>
            <button onClick={() => handleDelete(cat.id, cat.name)} className="text-xs text-red-400/40 hover:text-red-400 px-2 py-1">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COLLECTIONS SECTION
   ═══════════════════════════════════════════════════════════ */
function CollectionsSection({ collections, users, onRefresh }: { collections: Collection[]; users: User[]; onRefresh: () => void }) {
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [publishing, setPublishing] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/collections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || undefined }) });
    if (res.ok) { setNewName(""); setNewDesc(""); onRefresh(); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete collection "${name}"?`)) return;
    await fetch("/api/collections", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collectionId: id }) });
    onRefresh();
  };

  const publishUserBookmarks = async (userName: string) => {
    if (!confirm(`Publish all bookmarked references as "${userName}'s Favorites"?`)) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publishBookmarks: true, userName }) });
      if (res.ok) {
        const data = await res.json();
        alert(`Published ${data.count} references as "${data.name}"`);
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to publish");
      }
    } catch {} finally { setPublishing(false); }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Collections</h2>
        <div className="flex gap-2">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="Collection name..." className="flex-1 border border-bd bg-neutral-900 px-3 py-2 text-sm text-white placeholder-white/20 outline-none" />
          <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)..." className="flex-1 border border-bd bg-neutral-900 px-3 py-2 text-sm text-white placeholder-white/20 outline-none" />
          <button onClick={handleAdd} disabled={!newName.trim()} className="border border-white bg-white px-4 py-2 text-xs font-medium text-black hover:bg-neutral-200 disabled:opacity-40">+ Add</button>
        </div>
        <div className="border border-bd divide-y divide-bd/50">
          {collections.map((col) => (
            <div key={col.id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-900/50">
              <div>
                <p className="text-sm font-medium text-white">{col.icon} {col.name}</p>
                {col.description && <p className="text-xs text-white/30 mt-0.5">{col.description}</p>}
              </div>
              <button onClick={() => handleDelete(col.id, col.name)} className="text-xs text-red-400/40 hover:text-red-400 px-2 py-1">Delete</button>
            </div>
          ))}
        </div>
      </div>

      {/* Publish user bookmarks */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">Publish User Bookmarks as Collection</h3>
        <p className="text-xs text-white/30">Select a user to publish all currently bookmarked references as their favorites collection.</p>
        <div className="flex flex-wrap gap-2">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => publishUserBookmarks(u.name)}
              disabled={publishing}
              className="border border-bd px-4 py-2 text-sm text-white hover:bg-neutral-800 transition-colors disabled:opacity-40"
            >
              Publish {u.name}&apos;s Bookmarks
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAGS SECTION
   ═══════════════════════════════════════════════════════════ */
function TagsSection({ tags, onRefresh }: { tags: Tag[]; onRefresh: () => void }) {
  const [newName, setNewName] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) });
    if (res.ok) { setNewName(""); onRefresh(); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    await fetch("/api/tags", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deleteTagId: id }) });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Tags</h2>
      <div className="flex gap-2">
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="New tag name..." className="flex-1 border border-bd bg-neutral-900 px-3 py-2 text-sm text-white placeholder-white/20 outline-none" />
        <button onClick={handleAdd} disabled={!newName.trim()} className="border border-white bg-white px-4 py-2 text-xs font-medium text-black hover:bg-neutral-200 disabled:opacity-40">+ Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag.id} className="inline-flex items-center gap-2 border border-bd px-3 py-1.5 text-xs uppercase tracking-wide text-white/60">
            {tag.name}
            <button onClick={() => handleDelete(tag.id, tag.name)} className="text-white/20 hover:text-red-400 transition-colors">✕</button>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REQUESTS SECTION
   ═══════════════════════════════════════════════════════════ */
function RequestsSection({ requests, onRefresh }: { requests: AccessRequest[]; onRefresh: () => void }) {
  const pending = requests.filter((r) => r.status === "pending");
  const handled = requests.filter((r) => r.status !== "pending");

  const handleAction = async (id: number, action: "approve" | "deny") => {
    const res = await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, action }),
    });
    if (res.ok) onRefresh();
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/requests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id }),
    });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-white">Access Requests</h2>

      {/* Pending */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">
          Pending {pending.length > 0 && <span className="text-red-400">({pending.length})</span>}
        </h3>
        {pending.length === 0 ? (
          <p className="text-xs text-white/20">No pending requests</p>
        ) : (
          <div className="border border-bd divide-y divide-bd/50">
            {pending.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center bg-yellow-500/10 border border-yellow-500/30 text-xs font-bold text-yellow-400">
                    {req.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{req.name}</p>
                    <p className="text-xs text-white/30">{req.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(req.id, "approve")}
                    className="px-3 py-1.5 text-xs font-medium border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "deny")}
                    className="px-3 py-1.5 text-xs font-medium border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {handled.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">History</h3>
          <div className="border border-bd divide-y divide-bd/50">
            {handled.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-4 py-3 opacity-60">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center text-xs font-bold ${
                    req.status === "approved"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/30 text-red-400"
                  }`}>
                    {req.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-white">{req.name} <span className="text-xs text-white/30">({req.email})</span></p>
                    <p className="text-xs text-white/30">
                      {req.status === "approved" ? "Approved" : "Denied"}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(req.id)} className="text-xs text-white/20 hover:text-red-400 px-2 py-1">Clear</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   USERS SECTION
   ═══════════════════════════════════════════════════════════ */
function UsersSection({ users, onRefresh }: { users: User[]; onRefresh: () => void }) {
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [publishing, setPublishing] = useState<number | null>(null);

  const handleAddUser = async () => {
    setAddError("");
    const email = newEmail.toLowerCase().trim();
    if (!email) return;
    if (!email.endsWith("@createadvertising.com")) {
      setAddError("Must be an @createadvertising.com email");
      return;
    }
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setNewEmail("");
      onRefresh();
    } else {
      const data = await res.json();
      setAddError(data.error || "Failed to add user");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remove user "${name}"? They can still log in again.`)) return;
    await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id }) });
    onRefresh();
  };

  const toggleRole = async (id: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await fetch("/api/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: id, role: newRole }) });
    onRefresh();
  };

  const publishToCollection = async (userName: string, userId: number) => {
    if (!confirm(`Publish bookmarked references as "${userName}'s Favorites" collection?`)) return;
    setPublishing(userId);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishBookmarks: true, userName }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Published ${data.count} references as "${data.name}"`);
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to publish");
      }
    } catch {} finally {
      setPublishing(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Users</h2>

      {/* Add user */}
      <div className="flex gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
          placeholder="name@createadvertising.com"
          className="flex-1 border border-bd bg-neutral-900 px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/40"
        />
        <button onClick={handleAddUser} disabled={!newEmail.trim()} className="border border-white bg-white px-4 py-2 text-xs font-medium text-black hover:bg-neutral-200 disabled:opacity-40">
          + Add User
        </button>
      </div>
      {addError && <p className="text-xs text-red-400">{addError}</p>}

      <p className="text-xs text-white/30">Users are also auto-created when someone logs in with an @createadvertising.com email.</p>

      {/* User list */}
      <div className="border border-bd divide-y divide-bd/50">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center bg-neutral-800 text-xs font-bold text-white">
                {u.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{u.name}</p>
                <p className="text-xs text-white/30">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => publishToCollection(u.name, u.id)}
                disabled={publishing === u.id}
                className="px-2.5 py-1 text-xs font-medium border border-emerald-500/30 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors disabled:opacity-40"
                title={`Publish bookmarks as ${u.name}'s Favorites`}
              >
                {publishing === u.id ? "Publishing..." : "Publish to Collection"}
              </button>
              <button
                onClick={() => toggleRole(u.id, u.role)}
                className={`px-2.5 py-1 text-xs font-medium border transition-colors ${
                  u.role === "admin"
                    ? "border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                    : "border-bd text-white/40 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {u.role === "admin" ? "Admin" : "User"}
              </button>
              <button onClick={() => handleDelete(u.id, u.name)} className="text-xs text-red-400/40 hover:text-red-400 px-2 py-1">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

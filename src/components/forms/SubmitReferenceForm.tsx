"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Category, Tag } from "@/db/schema";

export function SubmitReferenceForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    url: "",
    description: "",
    thumbnail: "",
    categoryId: "",
    tagIds: [] as number[],
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});

    fetch("/api/references?allTags=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAllTags(data);
      })
      .catch(() => {});
  }, []);

  const fetchOgData = async () => {
    if (!form.url) return;
    setFetching(true);
    try {
      const res = await fetch("/api/og-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.url }),
      });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          thumbnail: data.image || prev.thumbnail,
          title: prev.title || data.title || prev.title,
          description: prev.description || data.description || prev.description,
        }));
      }
    } catch {
      // silently fail
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          url: form.url,
          description: form.description || undefined,
          thumbnail: form.thumbnail || undefined,
          categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
          tagIds: form.tagIds,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setForm({ title: "", url: "", description: "", thumbnail: "", categoryId: "", tagIds: [] });
        setTimeout(() => router.push("/"), 1500);
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: number) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="rounded-xl bg-green-950/50 border border-green-800/50 p-4 text-sm text-green-400">
          ✅ Reference added successfully! Redirecting...
        </div>
      )}

      {/* URL + Fetch */}
      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          URL <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            required
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://example.com"
            className="flex-1 rounded-xl border border-bd bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-neutral-500 focus:ring-1 focus:ring-neutral-600"
          />
          <button
            type="button"
            onClick={fetchOgData}
            disabled={!form.url || fetching}
            className="shrink-0 rounded-xl border border-bd bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {fetching ? "Fetching..." : "Fetch Info"}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-white/30">
          Paste a URL and click &quot;Fetch Info&quot; to auto-fill title, description & image
        </p>
      </div>

      {/* Thumbnail preview */}
      {form.thumbnail && (
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            Preview
          </label>
          <div className="relative rounded-xl overflow-hidden border border-bd bg-neutral-800 aspect-[16/10] max-w-xs">
            <img
              src={form.thumbnail}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>
      )}

      {/* Thumbnail URL */}
      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Thumbnail URL
        </label>
        <input
          type="url"
          value={form.thumbnail}
          onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
          placeholder="https://example.com/image.jpg (or use Fetch Info above)"
          className="w-full rounded-xl border border-bd bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-neutral-500 focus:ring-1 focus:ring-neutral-600"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Dribbble - Design Inspiration"
          className="w-full rounded-xl border border-bd bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-neutral-500 focus:ring-1 focus:ring-neutral-600"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What is this reference useful for?"
          rows={3}
          className="w-full rounded-xl border border-bd bg-neutral-800 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-neutral-500 focus:ring-1 focus:ring-neutral-600 resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-white mb-1.5">
          Category
        </label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="w-full rounded-xl border border-bd bg-neutral-800 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-neutral-500 focus:ring-1 focus:ring-neutral-600"
        >
          <option value="">Select a category...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.tagIds.includes(tag.id)
                    ? "bg-white text-black"
                    : "bg-neutral-800 text-white/60 hover:bg-neutral-700 hover:text-white"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-white px-6 py-3 text-sm font-medium text-black shadow-sm hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add Reference"}
      </button>
    </form>
  );
}

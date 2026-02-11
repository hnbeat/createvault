import { NextRequest, NextResponse } from "next/server";
import { getAllTags, createTag, getTagsForReference, addTagToReference, removeTagFromReference, deleteTag } from "@/db/queries";

// GET /api/tags — list all tags, or tags for a specific reference
export async function GET(request: NextRequest) {
  try {
    const referenceId = request.nextUrl.searchParams.get("referenceId");
    if (referenceId) {
      const tags = await getTagsForReference(parseInt(referenceId));
      return NextResponse.json(tags);
    }
    const tags = await getAllTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

// POST /api/tags — create a new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }
    const result = await createTag(name.trim());
    return NextResponse.json(result[0] ?? null);
  } catch (error: any) {
    if (error?.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
    }
    console.error("Error creating tag:", error);
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}

// PATCH /api/tags — add a tag to a reference
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { referenceId, tagId } = body;
    if (!referenceId || !tagId) {
      return NextResponse.json({ error: "referenceId and tagId are required" }, { status: 400 });
    }
    await addTagToReference(referenceId, tagId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error adding tag:", error);
    return NextResponse.json({ error: "Failed to add tag" }, { status: 500 });
  }
}

// DELETE /api/tags — remove a tag from a reference, or delete a tag entirely
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { referenceId, tagId, deleteTagId } = body;

    // Delete tag entirely
    if (deleteTagId) {
      await deleteTag(deleteTagId);
      return NextResponse.json({ ok: true });
    }

    // Remove tag from reference
    if (!referenceId || !tagId) {
      return NextResponse.json({ error: "referenceId and tagId are required" }, { status: 400 });
    }
    await removeTagFromReference(referenceId, tagId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error removing tag:", error);
    return NextResponse.json({ error: "Failed to remove tag" }, { status: 500 });
  }
}

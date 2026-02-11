import { NextRequest, NextResponse } from "next/server";
import { getAllCollections, createCollection, deleteCollection } from "@/db/queries";
import { slugify } from "@/lib/utils";

export async function GET() {
  const cols = await getAllCollections();
  return NextResponse.json(cols);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon } = body;
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const slug = slugify(name);
    const result = await createCollection({ name, slug, description, icon });
    return NextResponse.json(result[0]);
  } catch (error: any) {
    if (error?.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "Collection already exists" }, { status: 409 });
    }
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionId } = body;
    if (!collectionId) return NextResponse.json({ error: "collectionId required" }, { status: 400 });
    const result = await deleteCollection(collectionId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}

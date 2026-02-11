import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, createCategory, deleteCategory, updateCategory } from "@/db/queries";
import { slugify } from "@/lib/utils";

export async function GET() {
  const cats = await getAllCategories();
  return NextResponse.json(cats);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, color } = body;
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const slug = slugify(name);
    const result = await createCategory({ name, slug, description, icon, color });
    return NextResponse.json(result[0]);
  } catch (error: any) {
    if (error?.message?.includes("UNIQUE")) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId } = body;
    if (!categoryId) return NextResponse.json({ error: "categoryId required" }, { status: 400 });
    const result = await deleteCategory(categoryId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, ...data } = body;
    if (!categoryId) return NextResponse.json({ error: "categoryId required" }, { status: 400 });
    const result = await updateCategory(categoryId, data);
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

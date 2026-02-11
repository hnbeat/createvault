import { NextRequest, NextResponse } from "next/server";
import { deleteReference, updateReference } from "@/db/queries";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const referenceId = parseInt(id);
    if (isNaN(referenceId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await deleteReference(referenceId);
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reference:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const referenceId = parseInt(id);
    if (isNaN(referenceId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const result = await updateReference(referenceId, body);

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating reference:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

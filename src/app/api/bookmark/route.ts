import { NextRequest, NextResponse } from "next/server";
import { toggleBookmark } from "@/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referenceId } = body;

    if (!referenceId) {
      return NextResponse.json(
        { error: "referenceId is required" },
        { status: 400 }
      );
    }

    const result = await toggleBookmark(referenceId);

    if (!result) {
      return NextResponse.json(
        { error: "Reference not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { voteReference } from "@/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referenceId, direction } = body;

    if (!referenceId || !["up", "down"].includes(direction)) {
      return NextResponse.json(
        { error: "referenceId and direction (up|down) are required" },
        { status: 400 }
      );
    }

    const result = await voteReference(referenceId, direction);
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Reference not found" }, { status: 404 });
    }

    return NextResponse.json({ votes: result[0].votes });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}

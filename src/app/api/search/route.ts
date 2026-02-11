import { NextRequest, NextResponse } from "next/server";
import { searchReferences } from "@/db/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json([]);
  }

  const results = await searchReferences(query);
  return NextResponse.json(results);
}

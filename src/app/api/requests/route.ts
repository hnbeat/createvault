import { NextRequest, NextResponse } from "next/server";
import { getAllAccessRequests, approveRequest, denyRequest, deleteAccessRequest } from "@/db/queries";

// GET /api/requests — list all access requests
export async function GET() {
  try {
    const requests = await getAllAccessRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// PATCH /api/requests — approve or deny a request
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, action } = body;

    if (!requestId || !["approve", "deny"].includes(action)) {
      return NextResponse.json({ error: "requestId and action (approve|deny) required" }, { status: 400 });
    }

    if (action === "approve") {
      const result = await approveRequest(requestId);
      return NextResponse.json({ ok: true, approved: result });
    } else {
      await denyRequest(requestId);
      return NextResponse.json({ ok: true });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// DELETE /api/requests — delete a request
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId } = body;
    if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });
    await deleteAccessRequest(requestId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 });
  }
}

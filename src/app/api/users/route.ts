import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, deleteUser, updateUserRole, getUserBookmarkedReferences, publishBookmarksAsCollection } from "@/db/queries";

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    const result = await deleteUser(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, publishBookmarks, userName } = body;

    // Publish bookmarks as collection
    if (publishBookmarks && userName) {
      const bookmarks = await getUserBookmarkedReferences();
      if (bookmarks.length === 0) {
        return NextResponse.json({ error: "No bookmarks to publish" }, { status: 400 });
      }
      const result = await publishBookmarksAsCollection(
        userName,
        bookmarks.map((b) => b.id)
      );
      return NextResponse.json(result);
    }

    // Update role
    if (userId && role) {
      const result = await updateUserRole(userId, role);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

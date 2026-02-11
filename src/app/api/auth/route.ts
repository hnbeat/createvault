import { NextRequest, NextResponse } from "next/server";
import { createSession, getCurrentUser, getCookieName } from "@/lib/auth";
import { getUserByEmail, createAccessRequest, getAccessRequestByEmail } from "@/db/queries";

// POST /api/auth — login or request access
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate @createadvertising.com domain
    if (!normalizedEmail.endsWith("@createadvertising.com")) {
      return NextResponse.json(
        { error: "Only @createadvertising.com emails are allowed" },
        { status: 403 }
      );
    }

    // Check if user exists (approved)
    const user = await getUserByEmail(normalizedEmail);

    if (user) {
      // User is approved — log them in
      const token = await createSession({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      const response = NextResponse.json({
        status: "logged_in",
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });

      response.cookies.set(getCookieName(), token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    // User not found — check for existing request
    const existingRequest = await getAccessRequestByEmail(normalizedEmail);

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return NextResponse.json({ status: "pending", message: "Your access request is pending admin approval." });
      }
      if (existingRequest.status === "denied") {
        return NextResponse.json({ status: "denied", message: "Your access request was denied. Contact your admin." });
      }
    }

    // Create a new access request
    const localPart = normalizedEmail.split("@")[0];
    const firstName = localPart.split(".")[0];
    const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);

    try {
      await createAccessRequest(normalizedEmail, name);
    } catch {
      // Might be duplicate — that's fine
    }

    return NextResponse.json({
      status: "requested",
      message: "Access request submitted! An admin will review your request.",
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

// GET /api/auth — get current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

// DELETE /api/auth — logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}

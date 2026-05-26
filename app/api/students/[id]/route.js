import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing student id." }, { status: 400 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const identity = payload?.identity ?? {};
  if (!identity.firstName?.trim() || !identity.lastName?.trim()) {
    return NextResponse.json(
      { error: "First name and last name are required." },
      { status: 400 }
    );
  }

  // Never let client-managed metadata be overwritten by form data.
  const { id: _id, createdAt: _createdAt, ...data } = payload;

  try {
    const db = getDb();
    const ref = db.collection("students").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }
    await ref.set(
      { ...data, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    return NextResponse.json({ id });
  } catch (err) {
    console.error("Failed to update student:", err);
    const message = err?.message?.includes("Firebase Admin credentials")
      ? err.message
      : "Failed to update the admission. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

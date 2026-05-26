import { NextResponse } from "next/server";
import { getDb } from "../../../lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const snap = await db
      .collection("students")
      .orderBy("createdAt", "desc")
      .get();
    const students = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ students });
  } catch (err) {
    console.error("Failed to load students:", err);
    const message = err?.message?.includes("Firebase Admin credentials")
      ? err.message
      : "Failed to load admissions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const status = payload?.status === "draft" ? "draft" : "complete";
  const identity = payload?.identity ?? {};
  if (
    status === "complete" &&
    (!identity.firstName?.trim() || !identity.lastName?.trim())
  ) {
    return NextResponse.json(
      { error: "First name and last name are required." },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const now = new Date().toISOString();
    const doc = await db.collection("students").add({
      ...payload,
      status,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ id: doc.id }, { status: 201 });
  } catch (err) {
    console.error("Failed to save student:", err);
    const message =
      err?.message?.includes("Firebase Admin credentials")
        ? err.message
        : "Failed to save the admission form. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

const statuses = new Set(["new","reviewing","replied","closed","spam"]);

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let payload: { id?: unknown; status?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = String(payload.id ?? "");
  const status = String(payload.status ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !statuses.has(status)) {
    return NextResponse.json({ error: "Invalid status update." }, { status: 400 });
  }

  const { data, error } = await supabase.from("enquiries")
    .update({ status }).eq("id", id).select("id,status").single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not update enquiry. Please try again." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, enquiry: data });
}

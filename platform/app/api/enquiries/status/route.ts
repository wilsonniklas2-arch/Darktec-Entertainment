import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";

const statuses = new Set(["new","reviewing","replied","closed","spam"]);

export async function POST(request: Request) {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !statuses.has(status)) {
    return NextResponse.json({ error: "Invalid status update." }, { status: 400 });
  }
  const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: "Could not update enquiry." }, { status: 503 });
  return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
}

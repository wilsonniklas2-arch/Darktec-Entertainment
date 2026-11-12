import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedTopics = new Set([
  "Lighting & show lighting", "Sound & audio", "Video, LED & media servers",
  "Stage & event build crew", "Event & show operations", "Creative content & concepts",
  "Partner introduction / project connection", "Join the DARKTEC network",
  "Festival directory correction / submission", "Other"
]);

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Honeypot field: bots often fill hidden fields; silently reject them.
    if (clean(body.website, 200)) return NextResponse.json({ ok: true });
    const requestType = clean(body.requestType, 80);
    const topic = clean(body.topic, 120);
    const name = clean(body.name, 120);
    const company = clean(body.company, 160);
    const email = clean(body.email, 200).toLowerCase();
    const phone = clean(body.phone, 60);
    const location = clean(body.location, 160);
    const dates = clean(body.dates, 160);
    const details = clean(body.details, 5000);
    const privacyConsent = body.privacyConsent === true;

    if (!requestType || !allowedTopics.has(topic) || name.length < 2 ||
        !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) ||
        details.length < 10 || !privacyConsent) {
      return NextResponse.json({ error: "Please check the required fields and privacy consent." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("enquiries").insert({
      request_type: requestType, topic, name, company: company || null,
      email, phone: phone || null, location: location || null, dates: dates || null,
      details, privacy_consent: true, source: "DARKTEC website"
    });
    if (error) {
      console.error("Enquiry insert failed:", error.code);
      return NextResponse.json({ error: "The enquiry could not be saved. Please try again later." }, { status: 503 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

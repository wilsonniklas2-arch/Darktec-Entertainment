import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

const allowedOrigin = "https://wilsonniklas2-arch.github.io";
const allowedTopics = new Set([
  "Lighting & show lighting", "Sound & audio", "Video, LED & media servers",
  "Stage & event build crew", "Event & show operations", "Creative content & concepts",
  "Partner introduction / project connection", "Join the DARKTEC network",
  "Festival directory correction / submission", "Other"
]);

function response(body: unknown, status = 200, origin: string | null = null) {
  const headers = new Headers();
  if (origin === allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Vary", "Origin");
  }
  return NextResponse.json(body, { status, headers });
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function sendAdminNotification(enquiry: {
  requestType: string; topic: string; name: string; company: string;
  email: string; phone: string; location: string; dates: string; details: string;
}) {
  const smtpUser = process.env.GMAIL_SMTP_USER;
  const smtpPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  const recipient = process.env.DARKTEC_NOTIFICATION_EMAIL || "darktec.evolution@gmail.com";
  if (!smtpUser || !smtpPassword) {
    console.warn("Enquiry saved, but Gmail SMTP notification is not configured.");
    return;
  }

  const lines = [
    "A new enquiry has arrived in the DARKTEC Control Desk.",
    "",
    `Name: ${enquiry.name}`,
    `Company: ${enquiry.company || "—"}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone || "—"}`,
    `Request: ${enquiry.requestType}`,
    `Topic: ${enquiry.topic}`,
    `Location: ${enquiry.location || "—"}`,
    `Dates: ${enquiry.dates || "—"}`,
    "",
    "Details:",
    enquiry.details,
    "",
    "Open the DARKTEC Control Desk to review and manage this enquiry."
  ];

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPassword }
  });
  await transporter.sendMail({
    from: `DARKTEC Control Desk <${smtpUser}>`,
    to: recipient,
    replyTo: enquiry.email,
    subject: `New DARKTEC enquiry: ${enquiry.topic}`,
    text: lines.join("\n")
  });
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  if (origin !== allowedOrigin) return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    }
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== allowedOrigin) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }
  try {
    const body = await request.json();
    if (clean(body.website, 200)) return response({ ok: true }, 200, origin);
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
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        details.length < 10 || !privacyConsent) {
      return response({ error: "Please check the required fields and privacy consent." }, 400, origin);
    }

    const supabase = await createClient();
    const { error } = await supabase.from("enquiries").insert({
      request_type: requestType, topic, name, company: company || null,
      email, phone: phone || null, location: location || null, dates: dates || null,
      details, privacy_consent: true, source: "DARKTEC website"
    });
    if (error) {
      console.error("Enquiry insert failed:", error.code);
      return response({ error: "The enquiry could not be saved. Please try again later." }, 503, origin);
    }

    // The enquiry is safely stored first. Email delivery is best-effort and
    // must not make a successful submission appear to have failed.
    try {
      await sendAdminNotification({
        requestType, topic, name, company, email, phone, location, dates, details
      });
    } catch (notificationError) {
      console.error("DARKTEC notification email error:", notificationError);
    }
    return response({ ok: true }, 201, origin);
  } catch {
    return response({ error: "Invalid request." }, 400, origin);
  }
}

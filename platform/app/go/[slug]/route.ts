import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (!/^[a-z0-9-]{2,80}$/.test(slug)) {
    return NextResponse.redirect(new URL("/discover/festivals.html?affiliate=unavailable", request.url), 302);
  }

  try {
    const supabase = await createClient();
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer");
    let referrerHost: string | null = null;
    try { referrerHost = referrer ? new URL(referrer).host : null; } catch {}

    const { data, error } = await supabase.rpc("record_affiliate_click", {
      p_slug: slug,
      p_referrer_host: referrerHost,
      p_landing_path: new URL(request.url).pathname,
      p_user_agent: userAgent
    });

    const destination = Array.isArray(data) ? data[0]?.destination_url : null;
    if (error || !destination || !/^https:\/\//i.test(destination)) {
      return NextResponse.redirect(new URL("/discover/festivals.html?affiliate=unavailable", request.url), 302);
    }
    return NextResponse.redirect(destination, 302);
  } catch (error) {
    console.error("Affiliate redirect failed:", error);
    return NextResponse.redirect(new URL("/discover/festivals.html?affiliate=unavailable", request.url), 302);
  }
}

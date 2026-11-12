import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!user) redirect("/login");
  if (!isAdmin) return <main className="shell"><section className="hero"><h1>Access restricted.</h1><p className="lead">This account is not authorised to access the DARKTEC admin desk.</p><Link href="/">Return to Network</Link></section></main>;

  const { data: enquiries, error } = await supabase.from("enquiries")
    .select("id,request_type,topic,name,company,email,location,dates,details,status,created_at")
    .order("created_at", { ascending: false }).limit(100);
  const rows = enquiries ?? [];
  const counts = ["new","reviewing","replied","closed","spam"].map(status => ({
    status, count: rows.filter(item => item.status === status).length
  }));

  return <><header className="topbar"><div className="shell topbar-inner"><Link className="brand" href="/">DARK<span>TEC</span><small>CONTROL DESK</small></Link><nav className="nav"><Link href="/">Network</Link><Link href="/login">Sign out</Link></nav></div></header><main className="shell"><section className="hero"><div className="eyebrow">PRIVATE ADMIN AREA</div><h1>Project <span className="gradient">Control.</span></h1><p className="lead">Signed in as {user.email}. Latest 100 customer and partner enquiries.</p><div className="grid">{counts.map(item=><article className="panel" key={item.status}><h3>{item.count}</h3><p>{item.status.toUpperCase()}</p></article>)}</div></section><section><h2>Enquiry inbox</h2>{error && <p className="notice">Inbox could not be loaded. Confirm the database migration and admin claim.</p>}{!error && rows.length===0 && <p className="muted">No enquiries yet.</p>}<div className="grid">{rows.map(item=><article className="panel" key={item.id}><div className="eyebrow">{item.status} · {new Date(item.created_at).toLocaleString("en-GB")}</div><h3>{item.name}</h3><p><strong>{item.topic}</strong></p><p>{item.request_type}{item.company ? " · "+item.company : ""}</p><p><a href={"mailto:"+item.email}>{item.email}</a>{item.location ? " · "+item.location : ""}</p><p>{item.details}</p><form action="/api/enquiries/status" method="post" className="form"><input type="hidden" name="id" value={item.id}/><label className="field">Update status<select name="status" defaultValue={item.status}><option value="new">New</option><option value="reviewing">Reviewing</option><option value="replied">Replied</option><option value="closed">Closed</option><option value="spam">Spam</option></select></label><button className="action">Save status</button></form></article>)}</div></section></main></>;
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const { user, isAdmin } = await requireAdmin();
  if (!user) redirect("/login");
  if (!isAdmin) return <main className="shell"><section className="hero"><h1>Access restricted.</h1><Link href="/">Return to Network</Link></section></main>;

  return <>
    <header className="topbar"><div className="shell topbar-inner">
      <Link className="brand" href="/">DARK<span>TEC</span><small>CONTROL DESK</small></Link>
      <nav className="nav"><Link href="/dashboard">Enquiry inbox</Link><Link href="/">Network</Link><Link href="/auth/signout">Sign out</Link></nav>
    </div></header>
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">DARKTEC BUSINESS PLATFORM · REVENUE</div>
        <h1>Revenue <span className="gradient">&amp; Partners.</span></h1>
        <p className="lead">Build commercial partnerships around the DARKTEC Festival Directory. Visitors discover events on DARKTEC and complete their purchase with the official ticket seller. DARKTEC earns a commission only when a partner program tracks and approves a qualifying sale.</p>
        <p><span className="pill">Partner setup · Application stage</span></p>
      </section>

      <section>
        <div className="eyebrow">TICKETING · FIRST PARTNER TARGET</div>
        <h2>Ticket affiliate programs</h2>
        <p className="partner-intro">We do not become the ticket seller. The ticketing provider handles checkout, payment, delivery, refunds and customer support. DARKTEC provides discovery and a tracked referral link.</p>
        <div className="partner-grid">
          <article className="partner-panel">
            <div className="partner-kicker">Best first target · Rock am Ring</div>
            <h3>CTS EVENTIM via AWIN</h3>
            <p>Rock am Ring’s official 2027 terms identify CTS EVENTIM as the ticket outlet. EVENTIM’s German AWIN program currently lists a commission of 20% of the net advance booking fee, not 20% of the ticket price. The listed attribution window is 1 day.</p>
            <ul className="partner-list">
              <li>Free affiliate partnership</li>
              <li>Commission applies to the net advance booking fee</li>
              <li>Sales reporting and monthly commission payment are listed by EVENTIM</li>
              <li>Approval and current contract terms are subject to AWIN/EVENTIM</li>
            </ul>
            <a className="partner-link" href="https://ui.awin.com/merchant-profile/11388" target="_blank" rel="noreferrer">Open EVENTIM on AWIN ↗</a>
            <a className="partner-link" href="https://www.eventim.de/campaign/eventim-partner/" target="_blank" rel="noreferrer">EVENTIM partner information ↗</a>
          </article>
          <article className="partner-panel">
            <div className="partner-kicker">International option</div>
            <h3>Ticketmaster Global Affiliate</h3>
            <p>Ticketmaster accepts affiliate applications for a range of markets including Germany, Austria, Norway and many other countries. Access includes several ticketing brands and markets, subject to approval and individual market terms.</p>
            <ul className="partner-list">
              <li>Useful for international festival coverage</li>
              <li>Commission rates depend on market and contract</li>
              <li>Some presales and the first 24 hours after public onsale are excluded from commission</li>
            </ul>
            <a className="partner-link" href="https://developer.ticketmaster.com/partners/distribution-partners/affiliate-sign-up/" target="_blank" rel="noreferrer">Apply to Ticketmaster ↗</a>
          </article>
        </div>
        <div className="partner-note"><strong>Important:</strong> No affiliate relationship is active yet. Until approval and tracking links are issued, DARKTEC must use ordinary official ticket links and must not describe them as commission-generating.</div>
      </section>

      <section>
        <div className="eyebrow">HOW THE MONEY FLOWS</div>
        <h2>Our referral model</h2>
        <div className="partner-grid">
          <article className="partner-panel"><h3>01 · Discover</h3><p>A visitor finds a festival in the DARKTEC Directory and opens its detail page.</p></article>
          <article className="partner-panel"><h3>02 · Redirect</h3><p>The “Tickets” button uses our approved affiliate URL and sends the visitor to the official ticket shop.</p></article>
          <article className="partner-panel"><h3>03 · Purchase</h3><p>The provider completes the checkout and attributes eligible purchases to DARKTEC according to its tracking rules.</p></article>
          <article className="partner-panel"><h3>04 · Commission</h3><p>Approved sales appear in the partner dashboard. The provider pays commission under its payout schedule.</p></article>
        </div>
      </section>

      <section>
        <div className="eyebrow">NEXT IMPLEMENTATION STAGE</div>
        <h2>DARKTEC affiliate control</h2>
        <ul className="partner-list">
          <li>Store partner status, affiliate IDs and approved tracking URLs securely.</li>
          <li>Connect each festival to its correct official ticket partner.</li>
          <li>Use a DARKTEC redirect endpoint to count outbound clicks without handling ticket payments.</li>
          <li>Show clicks, tracked orders, approved commission and pending commission once partner reporting is available.</li>
          <li>Label affiliate links clearly and publish the required privacy/cookie disclosures.</li>
        </ul>
      </section>
    </main>
  </>;
}

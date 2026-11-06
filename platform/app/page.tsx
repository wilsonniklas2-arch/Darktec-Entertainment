const areas = [
  { title: "Artists & Talent", copy: "Discover performers, DJs, musicians, hosts and creative talent." },
  { title: "Partners & Organizers", copy: "Connect festivals, venues, promoters, agencies and event teams." },
  { title: "Crew & Services", copy: "Find technical specialists, production teams and event service providers." },
  { title: "Project Command", copy: "A future workspace for project briefs, applications, tasks and team coordination." },
  { title: "Communication Hub", copy: "A dedicated place for contact requests, direct messages and project conversations." },
  { title: "DARKTEC AI CORE", copy: "Permission-aware assistance for discovery, matching and project planning." }
];

export default function Home() {
  return <><header className="topbar"><div className="shell topbar-inner"><a className="brand" href="/">DARK<span>TEC</span><small>NETWORK</small></a><nav className="nav"><a href="/">Overview</a><a href="/login">Sign in</a><a href="https://wilsonniklas2-arch.github.io/Darktec-Entertainment/">Main website ↗</a></nav></div></header>
  <main className="shell"><section className="hero"><div className="eyebrow">THE LIVE ENTERTAINMENT NETWORK</div><h1>Where talent meets <span className="gradient">opportunity.</span></h1><p className="lead">One connected ecosystem for artists, organizers, partners, crew and production professionals. Discover people, build teams and bring projects to life.</p><p><span className="pill">Platform foundation · Early build</span></p><p className="muted">The member platform is being built in stages. Account creation and private member data remain disabled until the backend is configured and security policies are deployed.</p></section>
  <section><div className="eyebrow">ONE NETWORK · MANY POSSIBILITIES</div><h2>Explore the ecosystem</h2><div className="grid">{areas.map((area) => <article className="panel" key={area.title}><h3>{area.title}</h3><p>{area.copy}</p></article>)}</div></section></main><footer><div className="shell">DARKTEC Network · Part of DARKTEC Entertainment</div></footer></>;
}
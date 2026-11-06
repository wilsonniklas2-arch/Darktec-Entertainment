"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage("Sign-in successful. Your protected member area will be enabled in the next platform stage.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return <><header className="topbar"><div className="shell topbar-inner"><Link className="brand" href="/">DARK<span>TEC</span><small>NETWORK</small></Link><nav className="nav"><Link href="/">Overview</Link><a href="https://wilsonniklas2-arch.github.io/Darktec-Entertainment/">Main website ↗</a></nav></div></header><main className="shell"><section className="hero"><div className="eyebrow">MEMBER ACCESS</div><h1>Enter the <span className="gradient">Network.</span></h1><p className="lead">Secure member sign-in will become available once the DARKTEC Supabase project is connected.</p><form className="form" onSubmit={submit}><label className="field">Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} /></label><label className="field">Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} /></label><button className="action" disabled={busy}>{busy ? "Connecting…" : "Sign in"}</button>{message && <p className="notice" role="status">{message}</p>}</form><p className="muted">New member registration is not open yet. No account or personal data is collected by this preview.</p></section></main></>;
}
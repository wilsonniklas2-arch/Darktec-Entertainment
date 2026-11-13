"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Enquiry = {
  id: string;
  request_type: string;
  topic: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  dates: string | null;
  details: string;
  admin_notes?: string | null;
  status: string;
  created_at: string;
};

const labels: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  replied: "Replied",
  closed: "Closed",
  spam: "Spam",
};

export default function EnquiryCard({ item }: { item: Enquiry }) {
  const router = useRouter();
  const [status, setStatus] = useState(item.status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveStatus() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/enquiries/status", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ id: item.id, status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Status could not be saved.");
      setMessage("Status saved");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="panel enquiry-card">
      <div className="eyebrow">{labels[item.status] ?? item.status} · {new Date(item.created_at).toLocaleString("en-GB")}</div>
      <h3>{item.name}</h3>
      <p><strong>{item.topic}</strong></p>
      <p>{item.request_type}{item.company ? " · " + item.company : ""}</p>
      <p><a href={"mailto:" + item.email}>{item.email}</a>{item.location ? " · " + item.location : ""}</p>
      <p className="enquiry-preview">{item.details}</p>

      <details className="enquiry-details">
        <summary>Open complete enquiry</summary>
        <dl>
          <dt>Contact</dt><dd>{item.name}</dd>
          <dt>Company</dt><dd>{item.company || "—"}</dd>
          <dt>Email</dt><dd><a href={"mailto:" + item.email}>{item.email}</a></dd>
          <dt>Phone</dt><dd>{item.phone || "—"}</dd>
          <dt>Request</dt><dd>{item.request_type}</dd>
          <dt>Topic</dt><dd>{item.topic}</dd>
          <dt>Location</dt><dd>{item.location || "—"}</dd>
          <dt>Dates</dt><dd>{item.dates || "—"}</dd>
          <dt>Full message</dt><dd className="full-message">{item.details}</dd>
          {item.admin_notes ? <><dt>Admin notes</dt><dd>{item.admin_notes}</dd></> : null}
        </dl>
      </details>

      <div className="form status-form">
        <label className="field">Update status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
            <option value="spam">Spam</option>
          </select>
        </label>
        <button className="action" type="button" onClick={saveStatus} disabled={saving}>
          {saving ? "Saving…" : "Save status"}
        </button>
        {message ? <p className="save-feedback" role="status">{message}</p> : null}
      </div>
    </article>
  );
}

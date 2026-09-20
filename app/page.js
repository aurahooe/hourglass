"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase, hourSlot } from "@/lib/supabase";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function Floor() {
  const [now, setNow] = useState(() => new Date());
  const [hour, setHour] = useState(null);
  const [notes, setNotes] = useState([]);
  const [log, setLog] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    async function load() {
      const slot = hourSlot(now);
      const [{ data: hours }, { data: publicNotes }, { data: features }] = await Promise.all([
        sb.from("hours").select("*").eq("slot", slot).maybeSingle(),
        sb.from("notes").select("id,title,body,created_at,user_id,is_public").eq("is_public", true).order("created_at", { ascending: false }).limit(24),
        sb.from("feature_log").select("*").order("shipped_at", { ascending: false }).limit(8),
      ]);
      setHour(hours || null);
      setNotes(publicNotes || []);
      setLog(features || []);
    }
    load().catch(() => {});
  }, [now.getHours(), now.getDate()]);

  const remain = useMemo(() => {
    const end = new Date(now);
    end.setMinutes(60, 0, 0);
    const ms = Math.max(0, end - now);
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${pad(m)}:${pad(s)}`;
  }, [now]);

  const progress = useMemo(() => ((now.getMinutes() * 60 + now.getSeconds()) / 3600) * 100, [now]);

  return (
    <>
      <section className="hero">
        <div>
          <p className="section-title" style={{ marginTop: 0 }}>
            This hour
          </p>
          <h1>{hour?.headline || "The glass is still filling."}</h1>
          <p className="lede">
            {hour?.editorial ||
              "Leave a public note at the desk. Anything marked public lands on this floor. Every hour the masthead turns."}
          </p>
        </div>
        <aside className="clock">
          <div className="label">Local time</div>
          <div className="time">
            {pad(now.getHours())}:{pad(now.getMinutes())}
          </div>
          <div className="remain">{remain} until the next turn</div>
          <div className="sand" style={{ "--p": `${progress}%` }}>
            <i />
          </div>
        </aside>
      </section>

      <p className="section-title">
        Public notes
        <span>{notes.length} on the floor</span>
      </p>
      <div className="grid">
        {notes.length === 0 && (
          <article className="card">
            <h3>Quiet so far</h3>
            <p>Sign in at the desk and pin something public. It shows here immediately.</p>
            <div className="meta">waiting</div>
          </article>
        )}
        {notes.map((n, i) => (
          <article className="card" key={n.id} style={{ animationDelay: `${i * 40}ms` }}>
            <h3>{n.title}</h3>
            <p>{n.body.slice(0, 220)}{n.body.length > 220 ? "…" : ""}</p>
            <div className="meta">{new Date(n.created_at).toLocaleString()}</div>
          </article>
        ))}
      </div>

      <p className="section-title">Shipped this week</p>
      <ul className="log">
        {log.map((row) => (
          <li key={row.id}>
            <strong>{row.title}</strong>
            <div className="editorial">{row.body}</div>
            <div className="meta">{new Date(row.shipped_at).toLocaleString()}</div>
          </li>
        ))}
        {log.length === 0 && <li>No entries yet. The hourly keep will start writing here.</li>}
      </ul>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function Desk() {
  const sb = getSupabase();
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [mine, setMine] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [mode, setMode] = useState("signin");

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    loadMine();
  }, [session?.user?.id]);

  async function loadMine() {
    const { data } = await sb
      .from("notes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    setMine(data || []);
  }

  async function auth(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      if (mode === "signup") {
        const { error } = await sb.auth.signUp({
          email,
          password,
          options: { data: { handle: handle || email.split("@")[0] } },
        });
        if (error) throw error;
        setMsg("Account created. If email confirm is on, check your inbox — otherwise you can sign in now.");
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setErr(e.message);
    }
  }

  async function save(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const { error } = await sb.from("notes").insert({
      user_id: session.user.id,
      title: title.trim() || "Untitled",
      body: body.trim(),
      is_public: isPublic,
    });
    if (error) {
      setErr(error.message);
      return;
    }
    setTitle("");
    setBody("");
    setMsg(isPublic ? "Posted to the public floor." : "Saved privately.");
    loadMine();
  }

  async function togglePublic(note) {
    await sb.from("notes").update({ is_public: !note.is_public }).eq("id", note.id);
    loadMine();
  }

  async function remove(note) {
    await sb.from("notes").delete().eq("id", note.id);
    loadMine();
  }

  if (!session) {
    return (
      <div className="desk">
        <div>
          <h1>The desk</h1>
          <p className="lede">
            Sign in to keep notes. Mark them public and they appear on the floor for everyone.
          </p>
        </div>
        <form className="panel" onSubmit={auth}>
          <div className="row">
            <button type="button" className="ghost" onClick={() => setMode("signin")}>
              Sign in
            </button>
            <button type="button" className="ghost" onClick={() => setMode("signup")}>
              Create account
            </button>
          </div>
          {mode === "signup" && (
            <>
              <label>Handle</label>
              <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="how you appear" />
            </>
          )}
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <div style={{ height: 16 }} />
          <button className="ink" type="submit">
            {mode === "signup" ? "Open a desk" : "Sit down"}
          </button>
          {err && <div className="err">{err}</div>}
          {msg && <div className="ok">{msg}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="desk">
      <form className="panel" onSubmit={save}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>{session.user.email}</strong>
          <button type="button" className="ghost" onClick={() => sb.auth.signOut()}>
            Leave
          </button>
        </div>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A line that holds" />
        <label>Note</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} required placeholder="What belongs on paper." />
        <label className="toggle">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Show this on the public floor
        </label>
        <button className="ink" type="submit">
          Save
        </button>
        {err && <div className="err">{err}</div>}
        {msg && <div className="ok">{msg}</div>}
      </form>
      <div>
        <p className="section-title" style={{ marginTop: 0 }}>
          Your drawer
        </p>
        {mine.map((n) => (
          <article className="card" key={n.id} style={{ marginBottom: 12, minHeight: 0 }}>
            <h3>{n.title}</h3>
            <p>{n.body}</p>
            <div className="row" style={{ marginTop: 12 }}>
              <span className="meta">{n.is_public ? "public" : "private"}</span>
              <button className="ghost" type="button" onClick={() => togglePublic(n)}>
                {n.is_public ? "Make private" : "Make public"}
              </button>
              <button className="ghost" type="button" onClick={() => remove(n)}>
                Delete
              </button>
            </div>
          </article>
        ))}
        {mine.length === 0 && <p className="lede">Nothing in the drawer yet.</p>}
      </div>
    </div>
  );
}

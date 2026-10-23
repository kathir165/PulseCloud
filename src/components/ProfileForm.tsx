"use client";

import { useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import { useSites } from "@/components/SitesProvider";
import { saveProfile, useProfile, type Profile } from "@/lib/profileStore";

const fields = [
  { key: "name", label: "Full name", placeholder: "Your name", max: 60, type: "text" },
  { key: "email", label: "Email", placeholder: "you@example.com", max: 120, type: "email" },
  { key: "role", label: "Role", placeholder: "e.g. DevOps engineer", max: 60, type: "text" },
  { key: "org", label: "Organization", placeholder: "e.g. Acme Inc.", max: 80, type: "text" },
] as const;

async function toAvatar(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) throw new Error("Choose a JPG, PNG, WebP or GIF image");
  if (file.size > 8 * 1024 * 1024) throw new Error("That image is larger than 8 MB");
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image");
  ctx.fillStyle = "#161c28";
  ctx.fillRect(0, 0, size, size);
  const side = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function ProfileForm() {
  const stored = useProfile();
  const { sites } = useSites();
  const [edits, setEdits] = useState<Partial<Profile>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const current: Profile = { ...stored, ...edits };
  const dirty = Object.keys(edits).length > 0;
  const checks = sites.reduce((n, s) => n + s.history.length, 0);

  function change(key: (typeof fields)[number]["key"], value: string) {
    setEdits((e) => ({ ...e, [key]: value }));
    setMsg(null);
  }

  function save() {
    const email = current.email.trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setMsg({ ok: false, text: "Enter a valid email address" });
      return;
    }
    try {
      saveProfile({
        ...current,
        name: current.name.trim(),
        email,
        role: current.role.trim(),
        org: current.org.trim(),
      });
      setEdits({});
      setMsg({ ok: true, text: "Saved" });
    } catch {
      setMsg({ ok: false, text: "Could not save in this browser" });
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const avatar = await toAvatar(file);
      saveProfile({ ...stored, avatar });
      setMsg({ ok: true, text: "Photo updated" });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
  }

  function removePhoto() {
    try {
      saveProfile({ ...stored, avatar: null });
      setMsg({ ok: true, text: "Photo removed" });
    } catch {
      setMsg({ ok: false, text: "Could not update in this browser" });
    }
  }

  return (
    <div className="max-w-2xl rounded-xl border border-line bg-graphite-800/75">
      <div className="flex flex-col items-start gap-4 border-b border-line p-5 sm:flex-row sm:items-center">
        <Avatar src={stored.avatar} name={current.name} className="h-24 w-24" textClass="text-3xl" />
        <div>
          <p className="text-lg font-semibold text-fg">{current.name || "Your name"}</p>
          <p className="font-mono text-xs text-muted">{current.role || "Your role"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-navy-950 transition hover:brightness-110"
            >
              {stored.avatar ? "Change photo" : "Upload photo"}
            </button>
            {stored.avatar && (
              <button
                onClick={removePhoto}
                className="rounded-full border border-line px-4 py-1.5 text-xs text-fg transition hover:border-red-400/50 hover:text-red-400"
              >
                Remove
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onFile} className="hidden" />
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">{f.label}</span>
            <input
              type={f.type}
              value={current[f.key]}
              maxLength={f.max}
              placeholder={f.placeholder}
              onChange={(e) => change(f.key, e.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-navy-900 px-4 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-line p-5">
        <button
          onClick={save}
          disabled={!dirty}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-navy-950 transition hover:brightness-110 disabled:opacity-50"
        >
          Save changes
        </button>
        <p aria-live="polite" className={`text-sm ${msg?.ok ? "text-accent" : "text-red-400"}`}>
          {msg?.text}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
        <div className="bg-graphite-800 p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Websites</p>
          <p className="mt-2 text-2xl font-semibold text-fg">{sites.length}</p>
        </div>
        <div className="bg-graphite-800 p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Checks run</p>
          <p className="mt-2 text-2xl font-semibold text-fg">{checks}</p>
        </div>
      </div>

      <p className="border-t border-line px-5 py-4 text-xs text-muted">
        Saved in this browser only. There is no sign-in or account yet, so nothing is sent to a server.
      </p>
    </div>
  );
}
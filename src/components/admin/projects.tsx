"use client";

import { useState, type FormEvent } from "react";
import { ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { projectCover, sized, type Project, type ProjectImage } from "@/lib/projects";

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const dropImage = (publicId: string | null) => publicId && fetch(`/api/upload?publicId=${encodeURIComponent(publicId)}`, { method: "DELETE" });

/** Uploads one photo to Cloudinary. Gallery photos get the logo watermark; the cover (thumbnail) does not. */
async function upload(file: File, watermark: boolean): Promise<ProjectImage> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", watermark ? "projects" : "projects/covers");
  if (watermark) body.append("watermark", "1");
  const res = await fetch("/api/upload", { method: "POST", body });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Image upload failed");
  return { url: json.url, publicId: json.publicId };
}

type ListProps = { items: Project[]; loading: boolean; onEdit: (project: Project) => void; onChanged: () => void; onNotice: (message: string) => void };

export function Projects({ items, loading, onEdit, onChanged, onNotice }: ListProps) {
  const remove = async (project: Project) => {
    if (!window.confirm(`Delete "${project.title}" and all its photos? This can't be undone.`)) return;
    const { error } = await createClient().from("projects").delete().eq("id", project.id);
    if (error) return onNotice(error.message);
    dropImage(project.cover_public_id);
    project.images.forEach((image) => dropImage(image.publicId));
    onNotice("Project deleted.");
    onChanged();
  };

  return <section className="admin-panel">
    <div className="table-wrap"><table>
      <thead><tr><th>PROJECT</th><th>LOCATION</th><th>PHOTOS</th><th>ORDER</th><th /></tr></thead>
      <tbody>
        {items.length === 0 && <tr><td colSpan={5}>{loading ? "Loading…" : "No projects yet — add your first one."}</td></tr>}
        {items.map((project) => <tr key={project.id}>
          <td><div className="inventory-product"><div className="mini-product-image" style={projectCover(project) ? { backgroundImage: `url(${sized(projectCover(project), 120)})` } : undefined} /><strong>{project.title}</strong></div></td>
          <td>{project.place}</td>
          <td>{project.images.length}</td>
          <td>{project.sort}</td>
          <td className="row-actions">
            <a className="more-button" href={`/projects/${project.id}`} target="_blank" rel="noreferrer" aria-label={`View ${project.title}`}><ExternalLink size={16} /></a>
            <button className="more-button" aria-label={`Edit ${project.title}`} onClick={() => onEdit(project)}><Pencil size={16} /></button>
            <button className="more-button" aria-label={`Delete ${project.title}`} onClick={() => remove(project)}><Trash2 size={16} /></button>
          </td>
        </tr>)}
      </tbody>
    </table></div>
  </section>;
}

const blank = { title: "", place: "Lahore", sector: "", scope: "", summary: "", challenge: "", solution: "", sort: "0" };
type Field = keyof typeof blank;

type EditorProps = { project: Project | "new"; nextSort: number; onClose: () => void; onSaved: (message: string) => void };

export function ProjectEditor({ project, nextSort, onClose, onSaved }: EditorProps) {
  const [form, setForm] = useState(() => project === "new" ? { ...blank, sort: String(nextSort) } : {
    title: project.title, place: project.place, sector: project.sector, scope: project.scope,
    summary: project.summary, challenge: project.challenge, solution: project.solution, sort: String(project.sort),
  });
  const [kept, setKept] = useState<ProjectImage[]>(project === "new" ? [] : project.images);
  const [cover, setCover] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const set = (key: Field, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (kept.length + photos.length === 0) return setError("Add at least one project photo.");
    setError("");
    try {
      let coverImage: { cover_url?: string; cover_public_id?: string } = {};
      if (cover) {
        setProgress("Uploading cover…");
        const uploaded = await upload(cover, false);
        coverImage = { cover_url: uploaded.url, cover_public_id: uploaded.publicId };
      }
      const added: ProjectImage[] = [];
      for (const [i, file] of photos.entries()) {
        setProgress(`Uploading photo ${i + 1} of ${photos.length}…`);
        added.push(await upload(file, true));
      }
      setProgress("Saving…");
      const row = {
        title: form.title.trim(), place: form.place.trim(), sector: form.sector.trim(), scope: form.scope.trim(),
        summary: form.summary.trim(), challenge: form.challenge.trim(), solution: form.solution.trim(),
        sort: Number(form.sort) || 0, images: [...kept, ...added], ...coverImage,
      };
      const supabase = createClient();
      const { error } = project === "new"
        ? await supabase.from("projects").insert({ id: `${slugify(row.title)}-${Math.random().toString(36).slice(2, 6)}`, ...row })
        : await supabase.from("projects").update(row).eq("id", project.id);
      if (error) throw new Error(error.message);
      if (project !== "new") {
        if (cover) dropImage(project.cover_public_id);
        project.images.filter((image) => !kept.some((item) => item.publicId === image.publicId)).forEach((image) => dropImage(image.publicId));
      }
      onSaved(project === "new" ? "Project added." : "Project updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
      setProgress("");
    }
  };

  const text = (key: Field, label: string, wide = false, placeholder = "") =>
    <label className={wide ? "span-2" : undefined}>{label}<input required={key === "title"} value={form[key]} onChange={(event) => set(key, event.target.value)} placeholder={placeholder} /></label>;
  const area = (key: Field, label: string) =>
    <label className="span-2">{label}<textarea rows={3} value={form[key]} onChange={(event) => set(key, event.target.value)} /></label>;

  return <div className="modal-backdrop" onClick={onClose}>
    <form className="product-modal product-modal-wide" onSubmit={save} onClick={(event) => event.stopPropagation()}>
      <div className="modal-heading">
        <div><p className="eyebrow">PROJECTS</p><h2>{project === "new" ? "Add a project" : "Edit project"}</h2></div>
        <button type="button" className="admin-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
      </div>
      <div className="form-grid">
        {text("title", "Title", true, "e.g. Corporate open-plan floor")}
        {text("place", "Location", false, "e.g. Gulberg, Lahore")}
        {text("sector", "Sector", false, "e.g. Corporate office")}
        {text("scope", "Scope", true, "e.g. 120 workstations & meeting rooms")}
        {area("summary", "Summary")}
        {area("challenge", "The challenge")}
        {area("solution", "Our solution")}
        {text("sort", "Order on site (1 shows first)")}
        <label>Cover photo — no watermark{project !== "new" && project.cover_url ? " (leave empty to keep)" : ""}<input type="file" accept="image/*,.heic,.heif" onChange={(event) => setCover(event.target.files?.[0] ?? null)} /></label>
        <div className="span-2 project-photos-field">
          <span>Project photos — the logo watermark is added automatically</span>
          {kept.length > 0 && <div className="project-photos">{kept.map((image) => <div key={image.publicId} style={{ backgroundImage: `url(${sized(image.url, 240)})` }}>
            <button type="button" aria-label="Remove photo" onClick={() => setKept((current) => current.filter((item) => item.publicId !== image.publicId))}><X size={14} /></button>
          </div>)}</div>}
          <input type="file" accept="image/*,.heic,.heif" multiple onChange={(event) => setPhotos([...(event.target.files ?? [])])} />
          {photos.length > 0 && <small>{photos.length} new {photos.length === 1 ? "photo" : "photos"} will be uploaded.</small>}
        </div>
      </div>
      {error && <p className="admin-error">{error}</p>}
      <div className="modal-actions">
        <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
        <button type="submit" className="admin-primary-button" disabled={!!progress}>{progress || "Save project"}</button>
      </div>
    </form>
  </div>;
}

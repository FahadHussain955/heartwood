import { anonClient } from "@/lib/products";

export type ProjectImage = { url: string; publicId: string };
export type Project = {
  id: string; title: string; place: string; sector: string; scope: string;
  summary: string; challenge: string; solution: string;
  cover_url: string | null; cover_public_id: string | null; images: ProjectImage[]; sort: number;
};

/** Projects from Supabase, in the order set in the admin. Empty when the table is missing or unreachable. */
export async function getProjects(): Promise<Project[]> {
  const supabase = anonClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("projects").select("*").order("sort").order("created_at");
  if (error || !data) return [];
  return data as Project[];
}

/** The thumbnail (no watermark); falls back to the first gallery photo. */
export const projectCover = (project: Project) => project.cover_url ?? project.images[0]?.url ?? "";

/** A smaller copy of a Cloudinary image for cards and thumbnails. */
export const sized = (url: string, width: number) => url.replace("/image/upload/", `/image/upload/c_limit,w_${width}/`);

import { NextResponse } from "next/server";
import { deleteImage, uploadImage } from "@/lib/cloudinary";
import { getAdmin } from "@/lib/admin";

export const runtime = "nodejs";

const isAdmin = async () => !!(await getAdmin());

// POST multipart/form-data with `file` (and optional `folder`). Returns { url, publicId }.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/"))
    return NextResponse.json({ error: "An image file is required" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Max 10 MB" }, { status: 413 });

  const folder = String(form.get("folder") ?? "products").replace(/[^a-z0-9/_-]/gi, "");
  try {
    const result = await uploadImage(Buffer.from(await file.arrayBuffer()), folder);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : (error as { message?: string })?.message;
    return NextResponse.json({ error: message ?? "Image upload failed" }, { status: 502 });
  }
}

// DELETE /api/upload?publicId=products/abc — removes an image from Cloudinary.
export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const publicId = new URL(req.url).searchParams.get("publicId");
  if (!publicId) return NextResponse.json({ error: "publicId required" }, { status: 400 });
  await deleteImage(publicId);
  return NextResponse.json({ ok: true });
}

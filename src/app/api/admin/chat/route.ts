import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { catalog } from "@/lib/store";

export const runtime = "nodejs";

// Groq free tier (OpenAI-compatible API). Get a free key at https://console.groq.com/keys
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-120b";
const MAX_TURNS = 6;

type Chat = { role: "user" | "assistant"; content: string };
type Image = { url: string; publicId: string };

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const categories = catalog.map((category) => `- ${category.slug} (${category.name}): ${category.subcategories.map((sub) => `${sub.slug} = ${sub.name}`).join(", ")}`).join("\n");

const system = `You are the product assistant inside the admin panel of Afzal Enterprises, a Pakistani furniture store. The admin tells you in plain words which product they want to add, and you add it to the catalogue with the add_product tool.

Always reply in English, briefly and politely, even if the admin writes in Roman Urdu or Urdu.

Required to add a product: name, category + subcategory, and price in Pakistani rupees (a whole number). Optional: short description, stock (default 0), SKU, tag (e.g. New, Bestseller).
- Pick the category and subcategory yourself from the list below when it is obvious from the product name. Ask only when it is genuinely ambiguous.
- If the name or price is missing, ask for just what is missing, in one message. Never invent a price.
- Once you have the required details, call add_product straight away; do not ask for a separate confirmation.
- If the admin attached a photo (stated in a system note), set use_attached_image to true. If no photo is attached, add the product without one and mention they can add a photo from the Products tab.
- After the tool succeeds, confirm in one or two lines what was added (name, category, price, stock). If it fails, tell the admin the error.
- You can only add products. For anything else, say it isn't something you can do here.

Categories (slug, with subcategory slug = name):
${categories}`;

const tools = [{
  type: "function",
  function: {
    name: "add_product",
    description: "Add a new product to the store catalogue. It becomes visible on the storefront immediately.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Product name, e.g. 'Executive Leather Chair'" },
        type: { type: "string", description: "Short description, e.g. 'High-back leather chair'" },
        category: { type: "string", enum: catalog.map((category) => category.slug) },
        sub: { type: "string", description: "Subcategory slug belonging to the chosen category" },
        price: { type: "integer", description: "Price in Pakistani rupees" },
        stock: { type: "integer", description: "Units in stock; 0 if not given" },
        sku: { type: "string", description: "SKU, if given" },
        tag: { type: "string", description: "Badge such as 'New' or 'Bestseller', if given" },
        use_attached_image: { type: "boolean", description: "True if the admin attached a photo of this product" },
      },
      required: ["name", "category", "sub", "price"],
    },
  },
}];

type AddInput = { name: string; type?: string; category: string; sub: string; price: number | string; stock?: number | string; sku?: string; tag?: string; use_attached_image?: boolean | string };

async function addProduct(input: AddInput, image: Image | null) {
  const category = catalog.find((item) => item.slug === input.category);
  if (!category?.subcategories.some((sub) => sub.slug === input.sub)) return { ok: false, error: `Subcategory "${input.sub}" does not belong to category "${input.category}".` };
  const name = String(input.name ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const price = Number(input.price);
  const stock = Math.max(0, Math.floor(Number(input.stock)) || 0);
  if (!Number.isInteger(price) || price < 0) return { ok: false, error: "Price must be a whole number of rupees." };

  const supabase = await createClient();
  const attach = (input.use_attached_image === true || input.use_attached_image === "true") && image;
  const { error } = await supabase.from("products").insert({
    id: `${slugify(name) || "product"}-${Math.random().toString(36).slice(2, 6)}`,
    name, type: (input.type ?? "").trim(), category: input.category, sub: input.sub, price, stock,
    sku: input.sku?.trim() || null, tag: input.tag?.trim() || null,
    ...(attach ? { image_url: image.url, image_public_id: image.publicId } : {}),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, added: `${name} (${category.name} / ${input.sub}) at Rs. ${price}, stock ${stock}${attach ? ", with photo" : ", no photo"}` };
}

// POST { messages: [{ role, content }], image?: { url, publicId } } → { reply, added }
export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.GROQ_API_KEY) return NextResponse.json({ error: "GROQ_API_KEY is not set in .env.local (free key: console.groq.com/keys)" }, { status: 500 });

  const body = (await req.json().catch(() => null)) as { messages?: Chat[]; image?: Image | null } | null;
  const history = (body?.messages ?? []).filter((message) => (message.role === "user" || message.role === "assistant") && typeof message.content === "string").slice(-20);
  if (history.length === 0 || history[history.length - 1].role !== "user") return NextResponse.json({ error: "A user message is required" }, { status: 400 });
  const image = body?.image?.url && body.image.publicId ? body.image : null;

  const imageNote = image ? " Note: the admin has attached a photo of the product. Set use_attached_image to true." : "";
  type ToolCall = { id: string; function: { name: string; arguments: string } };
  type ApiMessage = { role: string; content: string | null; tool_calls?: ToolCall[]; tool_call_id?: string };
  const messages: ApiMessage[] = [{ role: "system", content: system + imageNote }, ...history];

  let added = false;
  try {
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({ model: MODEL, messages, tools, tool_choice: "auto", temperature: 0.2, max_tokens: 1000 }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) return NextResponse.json({ error: json?.error?.message ?? `AI service error (${res.status})` }, { status: 502 });

      const message = json.choices?.[0]?.message as ApiMessage | undefined;
      if (!message) return NextResponse.json({ error: "Empty response from the AI service" }, { status: 502 });
      if (!message.tool_calls?.length) return NextResponse.json({ reply: message.content?.trim() || "Done.", added });

      messages.push({ role: "assistant", content: message.content ?? null, tool_calls: message.tool_calls });
      for (const call of message.tool_calls) {
        let result: { ok: boolean; error?: string; added?: string } = { ok: false, error: "Unknown tool" };
        if (call.function.name === "add_product") {
          try { result = await addProduct(JSON.parse(call.function.arguments || "{}") as AddInput, image); }
          catch { result = { ok: false, error: "Invalid arguments" }; }
        }
        if (result.ok) added = true;
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
      }
    }
    return NextResponse.json({ reply: "That took too many steps — please try again.", added });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the AI service" }, { status: 502 });
  }
}

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, ImagePlus, Send, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };
type Image = { url: string; publicId: string };

const greeting: Message = { role: "assistant", content: "Hello! Tell me which product to add — name, price and (if you have one) a photo. I will take care of the rest." };

export function ProductAssistant({ onClose, onProductAdded }: { onClose: () => void; onProductAdded: () => void }) {
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<Image | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  const attach = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `Image upload failed (${res.status})`);
      setImage({ url: json.url, publicId: json.publicId });
    } catch (caught) {
      setMessages((current) => [...current, { role: "assistant", content: caught instanceof Error ? caught.message : "Image upload failed" }]);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy || uploading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      // The greeting is UI-only; the API conversation must start with a user turn.
      const res = await fetch("/api/admin/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1), image }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Assistant is unavailable");
      setMessages((current) => [...current, { role: "assistant", content: json.reply }]);
      if (json.added) { setImage(null); onProductAdded(); }
    } catch (caught) {
      setMessages((current) => [...current, { role: "assistant", content: caught instanceof Error ? caught.message : "Something went wrong" }]);
    } finally {
      setBusy(false);
    }
  };

  return <aside className="assistant-panel" aria-label="Product assistant">
    <div className="assistant-head"><span><Bot size={16} /> Product assistant</span><button className="admin-icon" onClick={onClose} aria-label="Close assistant"><X size={16} /></button></div>
    <div className="assistant-messages">
      {messages.map((message, index) => <p key={index} className={message.role === "user" ? "assistant-bubble user" : "assistant-bubble"}>{message.content}</p>)}
      {busy && <p className="assistant-bubble">Typing…</p>}
      <div ref={bottom} />
    </div>
    {(image || uploading) && <div className="assistant-attachment">{uploading ? "Uploading photo…" : <>Photo attached <button type="button" onClick={() => setImage(null)}>Remove</button></>}</div>}
    <form className="assistant-form" onSubmit={send}>
      <label className="admin-icon assistant-attach" title="Attach photo" aria-label="Attach photo">
        <ImagePlus size={17} />
        <input ref={fileInput} type="file" accept="image/*" onChange={(event) => attach(event.target.files?.[0])} />
      </label>
      <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="e.g. Add executive chair, 45000" aria-label="Message the assistant" />
      <button className="admin-primary-button" disabled={busy || uploading || !input.trim()} aria-label="Send"><Send size={14} /></button>
    </form>
  </aside>;
}

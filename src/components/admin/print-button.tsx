"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return <button type="button" className="admin-primary-button" onClick={() => window.print()}><Printer size={14} /> Print / Save as PDF</button>;
}

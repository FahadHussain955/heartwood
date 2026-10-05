import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { TrackOrder } from "@/components/track-order";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackOrderPage() {
  return <>
    <PageHero crumbs={[{ label: "Track order" }]} eyebrow="Order status" title="Track your order" text="Enter your order number and the phone number you used at checkout to see where your order is — or to cancel it." />
    <section className="section section-tight">
      <div className="container"><TrackOrder /></div>
    </section>
  </>;
}

import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { TrackOrder } from "@/components/track-order";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackOrderPage() {
  return <>
    <PageHero crumbs={[{ label: "Track order" }]} eyebrow="Order status" title="Track your order" text="Log in to see every order placed from your account and where it is. You can edit or cancel an order while it's still pending." />
    <section className="section section-tight">
      <div className="container"><TrackOrder /></div>
    </section>
  </>;
}

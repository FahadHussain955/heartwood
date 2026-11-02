import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import { AccountForm } from "@/components/account-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <>
    <PageHero crumbs={[{ label: "Account" }]} eyebrow="Your account" title="Sign in or create an account" text="An account is needed to place orders and track them." />
    <section className="section section-tight">
      <div className="container"><AccountForm next={next?.startsWith("/") ? next : "/"} /></div>
    </section>
  </>;
}

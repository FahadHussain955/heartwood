import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { getProjects } from "@/lib/projects";
import { catalog } from "@/lib/store";

const siteUrl = "https://www.afzalenterprises.pk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, projects] = await Promise.all([getProducts(), getProjects()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/shop`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/help`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/projects`, changeFrequency: "monthly", priority: 0.7 },
    ...catalog.flatMap((category) => [
      { url: `${siteUrl}/shop/${category.slug}`, changeFrequency: "weekly" as const, priority: 0.8 },
      ...category.subcategories.map((subcategory) => ({
        url: `${siteUrl}/shop/${category.slug}/${subcategory.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ]),
  ];

  return [
    ...staticPages,
    ...products.map((product) => ({
      url: `${siteUrl}/product/${encodeURIComponent(product.id)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...projects.map((project) => ({
      url: `${siteUrl}/projects/${encodeURIComponent(project.id)}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

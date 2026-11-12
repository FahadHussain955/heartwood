import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, Tag } from "lucide-react";
import { CtaBand, PageHero } from "@/components/ui";
import { getProjects, projectCover, sized } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getProjects()).find((item) => item.id === slug);
  return project ? { title: `${project.title} — ${project.place}`, description: project.summary } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const projects = await getProjects();
  const index = projects.findIndex((item) => item.id === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  return <>
    <PageHero crumbs={[{ label: "Projects", href: "/projects" }, { label: project.title }]} eyebrow={project.sector} title={project.title} text={project.summary} image={projectCover(project)}>
      <ul className="hero-points">{project.place && <li><MapPin size={16} /> {project.place}</li>}{project.scope && <li><Tag size={16} /> {project.scope}</li>}</ul>
    </PageHero>

    <section className="section">
      <div className="container case-study">
        <div className="case-text">
          {project.challenge && <><h2>The challenge</h2><p>{project.challenge}</p></>}
          {project.solution && <><h2>Our solution</h2><p>{project.solution}</p></>}
        </div>
        <aside className="case-facts">
          <dl className="facts facts-stack">{project.scope && <div><dt>Scope</dt><dd>{project.scope}</dd></div>}<div><dt>Location</dt><dd>{project.place}</dd></div><div><dt>Photos</dt><dd>{project.images.length}</dd></div></dl>
          <Link className="button button-dark" href="/contact">Start a similar project <ArrowRight size={16} /></Link>
        </aside>
      </div>
      <div className="container case-gallery">{project.images.map((image, i) => <span key={image.publicId} className={i === 0 ? "is-wide" : ""} style={{ backgroundImage: `url("${i === 0 ? image.url : sized(image.url, 900)}")` }} />)}</div>
    </section>

    {next.id !== project.id && <section className="section section-tight">
      <div className="container">
        <Link className="next-project" href={`/projects/${next.id}`}>
          <span style={{ backgroundImage: `url("${sized(projectCover(next), 1200)}")` }} />
          <div><p className="eyebrow">Next project</p><h2>{next.title}</h2><p>{next.place}</p></div>
          <ArrowRight size={28} />
        </Link>
      </div>
    </section>}
    <CtaBand />
  </>;
}

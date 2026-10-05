import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, ClipboardList, Hammer, PencilRuler, Truck } from "lucide-react";
import { CtaBand, PageHero, SectionHeading } from "@/components/ui";
import { photo, projects, sectors } from "@/lib/store";

export const metadata: Metadata = { title: "Projects", description: "Offices, cafés and restaurants we have furnished across Pakistan." };

const process = [
  { icon: ClipboardList, title: "Brief & site visit", text: "We visit your space, take measurements and understand how your team works." },
  { icon: PencilRuler, title: "Layout & quotation", text: "Free space plan, 3D layout on request and an itemised quotation with samples." },
  { icon: Hammer, title: "Manufacturing", text: "Furniture is built in our own factory to your size, fabric and finish." },
  { icon: Truck, title: "Delivery & installation", text: "Our team delivers, installs and cleans up — often over a weekend." },
];

export default function ProjectsPage() {
  return <>
    <PageHero crumbs={[{ label: "Projects" }]} eyebrow="Our work" title="Spaces we've furnished" text="From corporate headquarters to neighbourhood cafés — complete fit-outs, delivered on schedule." image="1497366754035-f200968a6e72" />

    <section className="section">
      <div className="container">
        <div className="project-list">{projects.map((project) => <Link className="project-row" href={`/projects/${project.slug}`} key={project.slug}>
          <span className="project-row-img" style={{ backgroundImage: `url("${photo(project.image, 1000)}")` }} />
          <div>
            <p className="eyebrow">{project.sector} · {project.place}</p>
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
            <dl className="facts">{project.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <span className="text-link">View project <ArrowRight size={15} /></span>
          </div>
        </Link>)}</div>
      </div>
    </section>

    <section className="section process-section">
      <div className="container">
        <SectionHeading eyebrow="How we work" title="From brief to installation" />
        <ol className="process">{process.map((step, index) => <li key={step.title}><span className="process-num">0{index + 1}</span><step.icon size={26} /><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
        <div className="sectors"><span className="sectors-label"><Building2 size={18} /> Sectors we serve</span>{sectors.map((sector) => <span key={sector}>{sector}</span>)}</div>
      </div>
    </section>
    <CtaBand title="Planning a fit-out?" text="Send us your floor plan and get a free layout and quotation within 48 hours." />
  </>;
}

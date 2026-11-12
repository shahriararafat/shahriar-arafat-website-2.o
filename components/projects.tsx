"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { site, type Project } from "@/content/site";
import { Section } from "./section";

export function Projects() {
  const categories = ["All", ...new Set(site.projects.map((project) => project.category))];
  const [filter, setFilter] = useState("All");
  const [project, setProject] = useState<Project | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const visible =
    filter === "All" ? site.projects : site.projects.filter((item) => item.category === filter);

  function openProject(item: Project) {
    setProject(item);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    requestAnimationFrame(() => titleRef.current?.focus());
  }

  return (
    <Section id="projects">
      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Project categories">
        {categories.map((category) => {
          const selected = filter === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={selected}
              className={`min-h-11 rounded-full px-4 text-sm ${
                selected ? "bg-brass text-brass-ink" : "border border-line hover:bg-surface"
              }`}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          );
        })}
      </div>
      {visible.length === 0 ? (
        <p className="mt-8 text-muted">No projects in this category.</p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {visible.map((item) => (
            <li key={item.title}>
              <button
                type="button"
                className="w-full rounded-2xl border border-line bg-surface p-3 text-left hover:border-brass"
                onClick={() => openProject(item)}
              >
                <span className="relative block aspect-square overflow-hidden rounded-xl bg-surface-2">
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 640px) 320px, 90vw"
                    className="object-cover"
                  />
                </span>
                <span className="mt-4 block text-sm text-brass">{item.category}</span>
                <span className="mt-1 block font-serif text-2xl">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <dialog
        ref={dialogRef}
        className="w-[min(52rem,calc(100%-1.5rem))] rounded-2xl border border-line bg-surface p-0 text-foreground shadow-2xl"
        aria-labelledby="project-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        onClose={() => setProject(null)}
      >
        {project ? (
          <div className="max-h-[85vh] overflow-y-auto p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-brass">{project.category}</p>
              <button
                type="button"
                className="min-h-11 rounded-full border border-line px-4 text-sm hover:bg-background"
                onClick={() => dialogRef.current?.close()}
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-6 md:grid-cols-[16rem_minmax(0,1fr)]">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-2">
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  fill
                  sizes="(min-width: 768px) 256px, 90vw"
                  className="object-cover"
                />
              </div>
              <div>
                <h3
                  id="project-dialog-title"
                  ref={titleRef}
                  tabIndex={-1}
                  className="font-serif text-3xl outline-none"
                >
                  {project.title}
                </h3>
                {project.description ? (
                  <p className="mt-3 leading-relaxed text-muted">{project.description}</p>
                ) : null}
                {project.liveUrl || project.githubUrl ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center rounded-full bg-brass px-4 text-sm font-medium text-brass-ink"
                      >
                        Live site
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : null}
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm"
                      >
                        GitHub
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : null}
                  </div>
                ) : null}
                {project.tech && project.tech.length > 0 ? (
                  <div className="mt-6">
                    <h4 className="text-sm tracking-[0.14em] text-muted uppercase">Technology</h4>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {project.tech.map((item) => (
                        <li key={item} className="rounded-full border border-line px-3 py-1 text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {project.features && project.features.length > 0 ? (
                  <div className="mt-6">
                    <h4 className="text-sm tracking-[0.14em] text-muted uppercase">Features</h4>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {project.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </Section>
  );
}

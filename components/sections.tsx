import Image from "next/image";
import { site, type Skill, type TimelineItem } from "@/content/site";
import { ContactForm } from "./contact-form";
import { DiscordCard } from "./discord-card";
import { Section } from "./section";

const externalLink = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function Hero() {
  return (
    <section id="top" tabIndex={-1} className="hero-wash scroll-mt-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] md:py-24">
        <div>
          <p className="text-xs tracking-[0.2em] text-brass uppercase">{site.location}</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.95] sm:text-7xl">{site.name}</h1>
          <p className="mt-4 text-lg text-muted">
            {site.title}
            <span aria-hidden="true"> · </span>
            <span className="sr-only">, </span>
            {site.role}
          </p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed">{site.heroIntro}</p>
          <a
            href={`mailto:${site.email}`}
            className="mt-6 inline-block text-base underline decoration-brass underline-offset-4"
          >
            {site.email}
          </a>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {site.socials.map((item) => (
              <li key={item.href}>
                <a {...externalLink} href={item.href} className="text-sm underline decoration-line underline-offset-4 hover:decoration-brass">
                  {item.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4">
          <div className="rounded-[1.75rem] bg-brass/40 p-2">
            <Image
              src="/images/profile.jpg"
              alt="Portrait of Shahriar Arafat"
              width={960}
              height={960}
              priority
              className="h-auto w-full rounded-[1.35rem]"
              sizes="(min-width: 768px) 420px, 90vw"
            />
          </div>
          <DiscordCard />
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <Section id="about">
      <div className="max-w-3xl space-y-4 text-lg leading-relaxed">
        {site.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <h3 className="mt-12 font-serif text-3xl">What I’m doing</h3>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {site.doing.map((item, index) => (
          <li key={item.title} className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-sm text-brass tabular-nums">{String(index + 1).padStart(2, "0")}</p>
            <h4 className="mt-3 font-serif text-2xl">{item.title}</h4>
            <p className="mt-2 text-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Experience() {
  return (
    <Section id="experience">
      <Timeline items={site.experience} />
    </Section>
  );
}

export function Education() {
  return (
    <Section id="education">
      <Timeline items={site.education} />
    </Section>
  );
}

export function Skills() {
  return (
    <Section id="skills">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <div className="space-y-10">
          <SkillGroup label="Technical" skills={site.skills.technical} />
          <SkillGroup label="General" skills={site.skills.general} />
        </div>
        <div>
          <h3 className="font-serif text-2xl">Certifications</h3>
          <ul className="mt-4 space-y-3">
            {site.certifications.map((item) => (
              <li key={item} className="border-b border-line pb-3">
                {item}
              </li>
            ))}
          </ul>
          <a
            href={site.resume.href}
            download={site.resume.fileName}
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brass px-5 text-sm font-medium text-brass-ink"
          >
            Download resume
          </a>
        </div>
      </div>
    </Section>
  );
}

export function ContactSection() {
  return (
    <Section id="contact">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <p className="max-w-sm leading-relaxed text-muted">
            Email{" "}
            <a className="text-foreground underline decoration-brass underline-offset-4" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            , or send a message here.
          </p>
          <ul className="mt-6 space-y-2">
            {site.socials.map((item) => (
              <li key={item.href}>
                <a {...externalLink} href={item.href} className="underline decoration-line underline-offset-4 hover:decoration-brass">
                  {item.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}

function Timeline({ items }: { items: readonly TimelineItem[] }) {
  return (
    <ol className="space-y-8 border-l border-line pl-6">
      {items.map((item) => (
        <li key={`${item.title}-${item.period}`} className="relative">
          <span
            className="absolute top-1.5 -left-[1.68rem] size-2.5 rounded-full bg-brass"
            aria-hidden="true"
          />
          <p className="text-sm text-brass tabular-nums">{item.period}</p>
          <h3 className="mt-1 font-serif text-2xl leading-snug">{item.title}</h3>
          <p className="mt-2 leading-relaxed text-muted">{item.detail}</p>
        </li>
      ))}
    </ol>
  );
}

function SkillGroup({ label, skills }: { label: string; skills: readonly Skill[] }) {
  return (
    <div>
      <h3 className="font-serif text-2xl">{label}</h3>
      <ul className="mt-4 space-y-4">
        {skills.map((skill) => (
          <li key={skill.name}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span>{skill.name}</span>
              <span className="text-muted tabular-nums">{skill.percent}%</span>
            </div>
            <div
              className="mt-2 h-1.5 rounded-full bg-surface-2"
              role="meter"
              aria-label={skill.name}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={skill.percent}
            >
              <div className="h-full rounded-full bg-brass" style={{ width: `${skill.percent}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

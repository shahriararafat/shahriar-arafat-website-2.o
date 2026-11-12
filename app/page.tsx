import { SiteHeader } from "@/components/site-header";
import { About, ContactSection, Education, Experience, Hero, Skills } from "@/components/sections";
import { Projects } from "@/components/projects";
import { site } from "@/content/site";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="content">
        <Hero />
        <About />
        <Experience />
        <Education />
        <Skills />
        <Projects />
        <ContactSection />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-xl">{site.name}</p>
          <p className="text-sm text-muted">{site.location}</p>
          <a className="text-sm underline decoration-brass underline-offset-4" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </div>
      </footer>
    </>
  );
}

import type { ReactNode } from "react";
import { sections, type SectionId } from "@/content/site";

export function Section({ id, children }: { id: SectionId; children: ReactNode }) {
  const index = sections.findIndex((item) => item.id === id);
  const section = sections[index];
  if (!section) return null;

  return (
    <section id={id} tabIndex={-1} className="scroll-mt-32 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-[10.5rem_minmax(0,1fr)] md:py-20">
        <h2 className="font-serif text-4xl leading-none">
          <span
            className="mb-3 block font-sans text-xs tracking-[0.2em] text-brass"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {section.label}
        </h2>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

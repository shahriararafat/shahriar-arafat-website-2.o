import { site } from "@/content/site";

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    image: new URL("images/profile.jpg", site.url).href,
    jobTitle: site.title,
    email: site.email,
    description: site.metaDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mirpur",
      addressRegion: "Dhaka",
      addressCountry: "Bangladesh",
    },
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "Bangladesh University of Business and Technology",
      url: "https://www.bubt.edu.bd/",
    },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "Jashore Polytechnic Institute",
      },
      {
        "@type": "HighSchool",
        name: "Bagherpara Gov. Pilot Model High School",
      },
    ],
    sameAs: site.socials.map((item) => item.href),
    knowsAbout: [
      ...site.skills.technical.map((skill) => skill.name),
      ...site.skills.general.map((skill) => skill.name),
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: site.url,
    name: site.name,
    author: {
      "@type": "Person",
      name: site.name,
      url: site.url,
    },
  };
}

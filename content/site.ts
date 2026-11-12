export type TimelineItem = {
  title: string;
  period: string;
  detail: string;
};

export type Skill = {
  name: string;
  percent: number;
};

export type Project = {
  title: string;
  category: string;
  image: string;
  imageAlt: string;
  description?: string;
  liveUrl?: string;
  githubUrl?: string;
  tech?: readonly string[];
  features?: readonly string[];
};

export type SocialLink = {
  label: string;
  href: string;
};

export const site = {
  name: "Shahriar Arafat",
  title: "Student",
  role: "CSE at BUBT",
  location: "Mirpur, Dhaka, Bangladesh",
  email: "arafatshahriar98@gmail.com",
  discordUsername: "shahriararafat",
  url: "https://shahriararafat.dev/",
  metaDescription:
    "Hi, I\u2019m Shahriar Arafat, a Computer Science student at BUBT and a web developer in Mirpur, Dhaka. Projects, resume, and experience.",
  keywords: [
    "Shahriar Arafat",
    "Shahriar",
    "Arafat",
    "Web Developer",
    "Computer Science",
    "BUBT",
    "Bangladesh",
    "Portfolio",
    "Gears Hut",
    "CricFace",
  ],
  gtmId: "GTM-WXV34KKR",
  resume: {
    href: "/Shahriar-Arafat-Resume.pdf",
    fileName: "Shahriar-Arafat-Resume.pdf",
  },
  heroIntro:
    "I\u2019ve always been passionate about technology especially AI and ML and my bigger dream is to become an entrepreneur. I believe technology has the power to transform lives, and I want to be a part of that change.",
  about: [
    "Hi, I\u2019m Shahriar Arafat currently studying B.Sc. Eng in CSE at Bangladesh University of Business and Technology. Before this, I completed my Diploma in Computer Science and Technology, where I gained a lot of practical experience.",
    "I\u2019ve always been passionate about technology especially AI and ML and my bigger dream is to become an entrepreneur. I believe technology has the power to transform lives, and I want to be a part of that change.",
    "To gain experience, I\u2019m constantly exploring new opportunities. I take on different jobs, work on projects, and volunteer whenever I can. As a member of Bangladesh Scouts, I\u2019ve had the opportunity to lead and mentor fellow scouts, organize camps, and take part in various community service projects. Through scouting, I have developed a strong sense of discipline, leadership, and teamwork, which continue to shape my personal and professional journey.",
    "I also enjoy writing about technology, sharing my thoughts and experiences through my blog. And when I\u2019m not working or studying, you\u2019ll probably find me gaming, watching anime, or just hanging out with friends.",
  ],
  doing: [
    {
      title: "Student",
      text: "I am currently studying B.Sc. Eng in Computer Science & Engineering.",
    },
    {
      title: "Web development",
      text: "I am a front-end developer and WordPress expert.",
    },
    {
      title: "Gamer",
      text: "I love playing video games. In my spare time I play video games.",
    },
    {
      title: "Videography",
      text: "I enjoy it very much. I have worked on some projects as a videographer.",
    },
  ],
  experience: [
    {
      title: "Founder of Gears Hut \u2013 A Gadget Shop",
      period: "2023 \u2014 Present",
      detail:
        "Established Gears Hut, an innovative gadget shop focused on providing high-quality tech accessories, smart devices, and electronic essentials to customers.",
    },
    {
      title: "Editor Of CricFace - A Cricket Media",
      period: "2020 \u2014 2023",
      detail:
        "Led content strategy, analysis, and reporting for a dynamic cricket media platform. Covered major events, delivered insightful articles, and engaged a passionate cricket audience.",
    },
    {
      title: "Rover Scout \u2013 Bangladesh Scout",
      period: "2020 \u2014 Present",
      detail:
        "Led and mentored fellow scouts, Team Work, organized camps, and participated in community service. Committed to discipline, leadership, and the spirit of scouting.",
    },
  ],
  education: [
    {
      title: "Bangladesh University of Business and Technology",
      period: "2025 \u2014 Present",
      detail: "B.Sc. Eng in Computer Science & Engineering",
    },
    {
      title: "Jashore Polytechnic Institute",
      period: "2021 \u2014 2025",
      detail: "Diploma in Computer Science & Technology",
    },
    {
      title: "Bagherpara Gov. Pilot Model High School",
      period: "2015 \u2014 2020",
      detail:
        "Junior School Certificate (2017) & Secondary School Certificate (2020)",
    },
  ],
  skills: {
    technical: [
      { name: "Web Development", percent: 80 },
      { name: "WordPress Expert", percent: 90 },
      { name: "Social Media Management", percent: 95 },
      { name: "Problem Solving", percent: 60 },
    ],
    general: [
      { name: "Pressure Handling", percent: 80 },
      { name: "Communication Skill", percent: 80 },
      { name: "Leadership", percent: 85 },
      { name: "Time Management", percent: 90 },
    ],
  },
  certifications: [
    "Pro. Web Design Course (Creative IT)",
    "Videography & Editing Course (Bangladesh Scout)",
    "Journalism Skill Course (Bangladesh Scout)",
    "Microsoft Office Expert (Technical Board)",
    "Digital Literacy Course for Youth (ICT Division)",
  ],
  projects: [
    {
      title: "Startup Bangladesh",
      category: "Discord Bot",
      image: "/images/startup-bangladesh.jpg",
      imageAlt: "Startup Bangladesh",
    },
  ] satisfies readonly Project[],
  socials: [
    { label: "GitHub", href: "https://github.com/shahriararafat" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shahriararafat" },
    { label: "Facebook", href: "https://www.facebook.com/meshahriaarafat" },
    { label: "Twitter", href: "https://twitter.com/meshahriaarafat" },
    { label: "Instagram", href: "https://www.instagram.com/sha_ara75/" },
  ] satisfies readonly SocialLink[],
  contact: {
    endpoint: "https://formspree.io/f/xkgzwlzn",
  },
};

export const sections = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

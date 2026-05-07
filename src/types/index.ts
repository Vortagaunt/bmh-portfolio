export interface CaseStudy {
  slug: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  video?: string;
  poster?: string;
  href: string;
}

export interface ContactLink {
  label: string;
  href: string;
}

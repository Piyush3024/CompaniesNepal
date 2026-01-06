
export const SITE_CONFIG = {
  name: "KITM",
  title: "Divya Gyan College of Technology and Management",
  description: "Leading educational institution in Nepal offering quality higher education in technology and management fields.",
  url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  ogImage: "/images/og-image.jpg",
  links: {
    facebook: "https://facebook.com/kitm",
    twitter: "https://twitter.com/kitm",
    linkedin: "https://linkedin.com/school/kitm",
    instagram: "https://instagram.com/kitm",
    youtube: "https://youtube.com/@kitm",
  },
  keywords: [
    "KITM",
    "Divya Gyan College of Technology and Management",
    "Nepal",
    "education",
    "technology",
    "management",
    "higher education"
  ],
} as const;

// Simplified static navigation - dynamic items are handled by useDynamicNavigation hook
export const NAVIGATION_ITEMS = [
  {
    title: "Home",
    href: "/",
  },
  // Dynamic menus (About Us, Programs, Resources) are added by the hook
  // Static direct links are also handled by the hook based on configuration
] as const;

// Program levels for filtering
export const PROGRAM_LEVELS = {
  UNDERGRADUATE: 'undergraduate',
  GRADUATE: 'graduate',
  CERTIFICATE: 'certificate',
  PROFESSIONAL: 'professional',
} as const;

// Academic departments
export const DEPARTMENTS = [
  {
    id: 'computer-engineering',
    name: 'Computer Engineering',
    shortName: 'CE',
    description: 'Comprehensive program in computer systems and software development',
  },
  {
    id: 'civil-engineering',
    name: 'Civil Engineering',
    shortName: 'Civil',
    description: 'Infrastructure development and construction engineering',
  },
  {
    id: 'management',
    name: 'Management',
    shortName: 'MGT',
    description: 'Business administration and management studies',
  },
  {
    id: 'information-technology',
    name: 'Information Technology',
    shortName: 'IT',
    description: 'Modern IT solutions and system administration',
  },
] as const;

// Social media links for footer
export const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    url: SITE_CONFIG.links.facebook,
    icon: 'facebook',
  },
  {
    name: 'Twitter',
    url: SITE_CONFIG.links.twitter,
    icon: 'twitter',
  },
  {
    name: 'LinkedIn',
    url: SITE_CONFIG.links.linkedin,
    icon: 'linkedin',
  },
  {
    name: 'Instagram',
    url: SITE_CONFIG.links.instagram,
    icon: 'instagram',
  },
  {
    name: 'YouTube',
    url: SITE_CONFIG.links.youtube,
    icon: 'youtube',
  },
] as const;

// Quick links for footer
export const QUICK_LINKS = [
  { title: 'About Us', href: '/about' },
  { title: 'Programs', href: '/programs' },
  { title: 'Admission', href: '/admission' },
  { title: 'Faculty', href: '/faculty' },
  { title: 'News', href: '/news' },
  { title: 'Contact', href: '/contact' },
] as const;

// Student services links
export const STUDENT_SERVICES = [
  { title: 'Academic Calendar', href: '/academics/calendar' },
  { title: 'Library', href: '/academics/library' },
  { title: 'Examination', href: '/academics/examination' },
  { title: 'Career Services', href: '/services/career' },
  { title: 'Student Support', href: '/services/support' },
  { title: 'Campus Life', href: '/campus-life' },
] as const;
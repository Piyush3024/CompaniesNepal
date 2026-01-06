import { NavigationItem } from "@/src/hooks/useDynamicNavigation";

// Navigation menu categories for organizing dynamic content
export const MENU_CATEGORIES = {
  ABOUT_US: "about-us",
  RESOURCES: "resources",
  ACADEMICS: "academics",
  // Add more categories as needed
} as const;

// Configuration for which pages should appear in which dropdown menus
export const PAGE_MENU_CONFIG = {
  // Pages that should appear under "About Us" dropdown
  [MENU_CATEGORIES.ABOUT_US]: [
    "about-kitm",

    // Add more page slugs as needed
  ],

  // Pages that should appear under "Resources" dropdown
  [MENU_CATEGORIES.RESOURCES]: [
    "professional-training",
    "internship",
    "placement-cell",
    "research",
    "publications",
    "downloads",
    // Add more page slugs as needed
  ],

  // Pages that should appear under "Academics" dropdown
  [MENU_CATEGORIES.ACADEMICS]: [
    "examination",
    "grading-system",
    "academic-policies",
    // Add more page slugs as needed
  ],

  // Add more menu categories as needed
} as const;

// Static navigation items that don't change
export const STATIC_NAV_ITEMS: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    order: 1,
  },
  // About Us will be dynamically populated
  // Programs will be dynamically populated

  {
    title: "Posts",
    href: "/posts",
    order: 5,
  },
  {
    title: "Events",
    href: "/events",
    order: 6,
  },
  {
    title: "Notices",
    href: "/notices",
    order: 7,
  },
  {
    title: "Gallery",
    href: "/gallery",
    order: 8,
  },
];

// Configuration for dynamic dropdown menus
export const DYNAMIC_MENU_CONFIG = [
  {
    title: "About Us",
    href: "/about",
    order: 2,
    category: MENU_CATEGORIES.ABOUT_US,
    showEmptyMenu: false, // Hide menu if no pages found
  },
  {
    title: "Programs",
    href: "/programs",
    order: 3,
    category: "programs", // Special category for programs
    showEmptyMenu: true, // Always show even if no programs
  },
  {
    title: "Resources",
    href: "/resources",
    order: 4.5, // Insert between Faculty and News
    category: MENU_CATEGORIES.RESOURCES,
    showEmptyMenu: false,
  },
  // Add more dynamic menus as needed
];

// Content type configurations for direct links with optional counters
export const CONTENT_TYPE_CONFIG = {
  posts: {
    enabled: true,
    showCount: false,
    countThreshold: 0, // Show count if > 0
  },
  events: {
    enabled: true,
    showCount: false,
    countThreshold: 0,
  },
  notices: {
    enabled: true,
    showCount: false, // Don't show count for notices
  },
  galleries: {
    enabled: true,
    showCount: false,
  },
} as const;


export const CATEGORY_URL_CONFIG = {
  [MENU_CATEGORIES.ABOUT_US]: "/about",
  [MENU_CATEGORIES.RESOURCES]: "/resources", 
  [MENU_CATEGORIES.ACADEMICS]: "/academics",
  // Add more as needed
} as const;
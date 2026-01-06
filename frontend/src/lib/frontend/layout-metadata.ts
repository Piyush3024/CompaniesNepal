
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: "KITM - Divya Gyan College of Technology and Management",
    template: "%s | KITM"
  },
  description: "Leading educational institution in Nepal offering quality higher education in technology and management fields.",
  keywords: ["KITM", "Nepal", "Technology", "Management", "Education", "Institute"],
  authors: [{ name: "KITM" }],
  creator: "KITM",
  publisher: "KITM",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    siteName: 'KITM - Divya Gyan College of Technology and Management',
    title: 'KITM - Divya Gyan College of Technology and Management',
    description: 'Leading educational institution in Nepal offering quality higher education in technology and management fields.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KITM - Divya Gyan College of Technology and Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KITM - Divya Gyan College of Technology and Management',
    description: 'Leading educational institution in Nepal offering quality higher education in technology and management fields.',
    images: ['/images/og-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};
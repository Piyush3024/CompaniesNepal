
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "../components/providers/QueryProvider";
import { SettingsProvider } from "../components/providers/SettingsProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CompaniesNepal - Leading B2B Marketplace in Nepal",
    template: "%s | CompaniesNepal",
  },
  description: "Leading B2B Marketplace in Nepal",
  keywords: ["companiesNepal", "Nepal", "B2B", "Marketplace"],
  authors: [{ name: "CompaniesNepal" }],
  creator: "CompaniesNepal",
  publisher: "CompaniesNepal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'CompaniesNepal',
    description: '.',
    siteName: 'CompaniesNepal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CompaniesNepal ',
    description: '',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <SettingsProvider>
            {children}
            <Toaster position="top-right" richColors />
          </SettingsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

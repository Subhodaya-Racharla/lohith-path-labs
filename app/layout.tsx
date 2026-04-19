import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const BASE_URL = "https://lohithpathlabs.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  icons: { icon: "/icon.svg" },

  title: {
    default: "Lohith Advanced Quality Testing Path Labs | Medak, Telangana",
    template: "%s | Lohith Path Labs",
  },
  description:
    "Trusted pathology laboratory in Medak & Hussainpur, Telangana. Accurate blood tests, thyroid panel, ECG, allergy testing with home sample collection. Fast reports on WhatsApp.",
  keywords: [
    "pathology lab Medak",
    "blood test Medak",
    "blood test Hussainpur",
    "thyroid test Telangana",
    "ECG testing Medak",
    "home sample collection Medak",
    "diagnostic lab Telangana",
    "Lohith Path Labs",
    "pathology Hussainpur",
    "lab test near me Medak",
  ],
  authors: [{ name: "Lohith Advanced Quality Testing Path Labs" }],
  creator: "Lohith Advanced Quality Testing Path Labs",

  alternates: {
    canonical: BASE_URL,
  },

  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Lohith Path Labs",
    title: "Lohith Advanced Quality Testing Path Labs | Medak, Telangana",
    description:
      "Trusted pathology laboratory in Medak & Hussainpur, Telangana. Blood tests, thyroid, ECG, allergy testing with home sample collection. Reports on WhatsApp.",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "Lohith Advanced Quality Testing Path Labs | Medak, Telangana",
    description:
      "Trusted pathology lab in Medak, Telangana. Blood tests, thyroid, ECG, allergy & more with home collection. Fast WhatsApp reports.",
  },

  verification: {
    google: "BBoAdCS5sB9Kb0LxyaeEcQ8eLcsRLw60kqlGecRDt-o",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "Lohith Advanced Quality Testing Path Labs",
  description:
    "Pathology laboratory in Medak & Hussainpur, Telangana offering blood tests, thyroid panel, ECG, allergy testing and home sample collection.",
  url: BASE_URL,
  telephone: "+919182147180",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Hussainpur",
    addressLocality: "Medak",
    addressRegion: "Telangana",
    postalCode: "502110",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 17.9,
    longitude: 77.9,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "07:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "08:00",
      closes: "14:00",
    },
  ],
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI",
  medicalSpecialty: "Pathology",
  availableService: [
    { "@type": "MedicalTest", name: "Blood Tests" },
    { "@type": "MedicalTest", name: "Thyroid Panel" },
    { "@type": "MedicalTest", name: "ECG Testing" },
    { "@type": "MedicalTest", name: "Allergy Testing" },
    { "@type": "MedicalTest", name: "Home Sample Collection" },
  ],
  sameAs: ["https://instagram.com/lohithpathlabs"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}

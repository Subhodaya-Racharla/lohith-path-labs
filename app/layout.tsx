import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: "Lohith Advanced Quality Testing Path Labs | Medak, Telangana",
  description:
    "Trusted pathology laboratory in Medak, Hussainpur, Telangana. Blood tests, thyroid, ECG, allergy testing with home sample collection. Accurate results, experienced staff.",
  keywords: "pathology lab Medak, blood test Hussainpur, thyroid test Telangana, ECG testing, home sample collection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Hanselminutes - Fresh Air for Developers",
  description: "Weekly talk show on tech with Scott Hanselman. Bringing you the latest in technology and developer culture.",
  keywords: ["podcast", "technology", "developers", "scott hanselman", "programming"],
  authors: [{ name: "Scott Hanselman" }],
  openGraph: {
    title: "Hanselminutes - Fresh Air for Developers",
    description: "Weekly talk show on tech with Scott Hanselman",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@shanselman",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50">
        <ToastProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}

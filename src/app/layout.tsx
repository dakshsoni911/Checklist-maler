import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChecklistMaker - Turn any document into an actionable checklist",
  description: "Upload any document or paste text, and we'll generate an actionable list of topics you can tick off.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900 antialiased`}>
        <AuthProvider>
          <AppProvider>
            <Navbar />
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

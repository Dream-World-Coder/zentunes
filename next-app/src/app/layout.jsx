import Header from "@/components/header";
import Footer from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

export const metadata = {
  title: "Zentunes",
  description: "An music app just for you",
  width: "device-width",
  initialScale: 1,
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="">
        <Header />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

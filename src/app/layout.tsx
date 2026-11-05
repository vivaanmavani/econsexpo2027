import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "@fontsource/kalam/700.css";
import "./globals.css";
import "./v6.css";
import "./expo.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Loader } from "@/components/Loader";
import { Cursor } from "@/components/Cursor";
import { ThemeWatcher } from "@/components/ThemeWatcher";
import { site } from "@/content/site";
import { SITE_URL } from "@/lib/url";

export const metadata: Metadata = {
  title: { default: "Econs Expo 2027 · Economics, out loud", template: "%s · Econs Expo 2027" },
  description: site.description,
  metadataBase: new URL(`${SITE_URL}/`),
  openGraph: {
    title: "Econs Expo 2027 · Economics, out loud.",
    description: site.description,
    type: "website",
    siteName: "Econs Expo",
    locale: "en_SG",
    images: [{ url: `${SITE_URL}/media/og.jpg`, width: 1200, height: 630, alt: "Participants at Econs Expo 2026" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#f7f2e6" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-SG" suppressHydrationWarning>
      <head>
        {/* Decide before first paint whether the opening plays, so returning visitors never see it flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if('scrollRestoration' in history)history.scrollRestoration='manual';if(!location.hash)scrollTo(0,0)}catch(e){}try{if(sessionStorage.getItem('ee-intro')!=='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('ee-intro')}catch(e){}",
          }}
        />
      </head>
      <body>
        <Loader />
        <SmoothScroll />
        <Cursor />
        <ThemeWatcher />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

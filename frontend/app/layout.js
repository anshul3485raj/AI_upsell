import "./globals.css";
import { Suspense } from "react";
import Providers from "./providers";
import Navigation from "../components/Navigation";

export const metadata = {
  title: "AI Upsell Admin",
  description: "Embedded Shopify app for upsell configuration and analytics.",
};
export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div />}>
          <Providers>
            <div className="app-shell">
              <aside className="sidebar">
                <div className="sidebar-brand">Ai Upsell</div>
                <Navigation />
              </aside>

              <main className="page-body">{children}</main>
            </div>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}

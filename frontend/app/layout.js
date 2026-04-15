import "./globals.css";
import { Suspense } from "react";
import Providers from "./providers";

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
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
}

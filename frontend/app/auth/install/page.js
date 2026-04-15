"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getInstallUrl } from "../../../auth/installUrl";

export default function InstallPage() {
  const searchParams = useSearchParams();
  const shop = searchParams.get("shop");
  const host = searchParams.get("host");

  useEffect(() => {
    if (!shop) {
      return;
    }
    window.location.href = getInstallUrl(shop, host || "");
  }, [shop, host]);

  return (
    <main className="app-shell">
      <div className="surface">
        <h1>Installing app...</h1>
        <p className="small">Redirecting to Shopify authorization.</p>
      </div>
    </main>
  );
}

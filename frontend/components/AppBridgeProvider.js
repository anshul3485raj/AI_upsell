"use client";

import createApp from "@shopify/app-bridge";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const AppBridgeContext = createContext({
  app: null,
  shop: "",
  host: "",
});

export function AppBridgeProvider({ children }) {
  const searchParams = useSearchParams();
  const host = searchParams.get("host") || "";
  const shop = searchParams.get("shop") || "";
  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
  const [app, setApp] = useState(null);

  useEffect(() => {
    if (!apiKey || !host || !shop) {
      setApp(null);
      return;
    }

    const appInstance = createApp({
      apiKey,
      host,
      forceRedirect: true,
    });
    setApp(appInstance);
  }, [apiKey, host, shop]);

  const value = useMemo(
    () => ({
      app,
      shop,
      host,
    }),
    [app, shop, host],
  );

  return <AppBridgeContext.Provider value={value}>{children}</AppBridgeContext.Provider>;
}

export function useAppBridgeContext() {
  return useContext(AppBridgeContext);
}

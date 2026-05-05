"use client";

import { AppBridgeProvider } from "../components/AppBridgeProvider";
import { LanguageProvider } from "../components/LanguageProvider";

export default function Providers({ children }) {
  return (
    <AppBridgeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </AppBridgeProvider>
  );
}

"use client";

import { AppBridgeProvider } from "../components/AppBridgeProvider";

export default function Providers({ children }) {
  return <AppBridgeProvider>{children}</AppBridgeProvider>;
}

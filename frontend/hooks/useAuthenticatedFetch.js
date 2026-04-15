"use client";

import { useCallback } from "react";
import { useAppBridgeContext } from "../components/AppBridgeProvider";
import { authenticatedFetch } from "../lib/apiClient";

export function useAuthenticatedFetch() {
  const { app, shop } = useAppBridgeContext();

  const apiFetch = useCallback(
    (path, options = {}) => {
      return authenticatedFetch(app, path, options, shop);
    },
    [app, shop],
  );

  return {
    apiFetch,
    isReady: Boolean(app),
  };
}

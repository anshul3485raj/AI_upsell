import { getSessionToken } from "@shopify/app-bridge-utils";

export async function authenticatedFetch(app, path, options = {}, shopDomain) {
  if (!app) {
    throw new Error("Shopify App Bridge is not initialized.");
  }

  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendBase) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is missing.");
  }

  const sessionToken = await getSessionToken(app);
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${sessionToken}`);
  if (!headers.has("Content-Type") && options.method && options.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }
  if (shopDomain) {
    headers.set("X-Shop-Domain", shopDomain);
  }

  const response = await fetch(`${backendBase}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

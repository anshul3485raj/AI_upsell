export function buildAuthInstallUrl(shop, host) {
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendBase) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is missing.");
  }
  const url = new URL(`${backendBase}/auth/install`);
  url.searchParams.set("shop", shop);
  if (host) {
    url.searchParams.set("host", host);
  }
  return url.toString();
}

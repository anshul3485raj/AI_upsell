const SHOP_DOMAIN_REGEX = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;

export const sanitizeShopDomain = (value: string): string | null => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || !SHOP_DOMAIN_REGEX.test(normalized)) {
    return null;
  }
  return normalized;
};

export const toProductGid = (idOrGid: string | number): string => {
  const input = String(idOrGid);
  if (input.startsWith("gid://shopify/Product/")) {
    return input;
  }
  return `gid://shopify/Product/${input}`;
};

export const toCollectionGid = (idOrGid: string | number): string => {
  const input = String(idOrGid);
  if (input.startsWith("gid://shopify/Collection/")) {
    return input;
  }
  return `gid://shopify/Collection/${input}`;
};

export const parseNumericIdFromGid = (gid?: string | null): string | null => {
  if (!gid) {
    return null;
  }
  const pieces = gid.split("/");
  return pieces.length > 0 ? pieces[pieces.length - 1] : null;
};

export const buildEmbeddedAppRedirect = (
  shopDomain: string,
  apiKey: string,
  host?: string,
): string => {
  const base = `https://${shopDomain}/admin/apps/${apiKey}`;
  if (!host) {
    return base;
  }
  const url = new URL(base);
  url.searchParams.set("host", host);
  url.searchParams.set("shop", shopDomain);
  return url.toString();
};

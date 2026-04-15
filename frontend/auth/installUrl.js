import { buildAuthInstallUrl } from "../lib/appBridge";

export function getInstallUrl(shop, host) {
  return buildAuthInstallUrl(shop, host);
}

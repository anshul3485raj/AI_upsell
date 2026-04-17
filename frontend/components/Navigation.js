"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  {
    href: "/recommendations",
    label: "Recommendations",
    icon: "✨",
    submenu: [
      { href: "/recommendations/frequently-bought-together", label: "Frequently Bought Together", icon: "🧺" },
      { href: "/recommendations/handpicked-recommendations", label: "Handpicked Recommendations", icon: "🎯" },
      { href: "/recommendations/related-products", label: "Related Products", icon: "🔗" },
      { href: "/recommendations/post-purchase-upsell", label: "Post Purchase Upsell", icon: "💥" },
    ],
  },
  {
    href: "/section/checkout-extension",
    label: "Checkout Extension",
    icon: "🛒",
    submenu: [
      { href: "/section/checkout-extension/thankyou-page-upsell", label: "Thankyou Page Upsell", icon: "🎁" },
      { href: "/section/checkout-extension/order-status-page-upsell", label: "Order Status Page Upsell", icon: "📌" },
    ],
  },
  { href: "/section/customize-widgets", label: "Customize Widgets", icon: "⚙️" },
  { href: "/section/intelli-search-filter", label: "Intelli Search and Filter", icon: "🔎" },
  { href: "/section/product-addons", label: "Product Addons", icon: "➕" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/section/cart-drawer", label: "Cart Drawer", icon: "🛍️" },
  { href: "/section/my-plan", label: "My Plan", icon: "💳" },
  { href: "/section/exclude-products", label: "Exclude Products", icon: "🚫" },
  { href: "/section/more", label: "More", icon: "⋯" },
];

export default function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = searchParams.toString();

  return (
    <nav className="nav">
      {links.map((link) => {
        const href = params ? `${link.href}?${params}` : link.href;
        const isParentActive = pathname === link.href || pathname.startsWith(link.href + "/");
        const className = isParentActive ? "active" : "";

        return (
          <div key={link.href} className="nav-group">
            <Link href={href} prefetch={false} className={className}>
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
              {link.submenu ? <span className="nav-chevron">›</span> : null}
            </Link>
            {link.submenu && isParentActive ? (
              <div className="nav-submenu">
                {link.submenu.map((sub) => {
                  const subHref = params ? `${sub.href}?${params}` : sub.href;
                  const isActive = pathname === sub.href;
                  return (
                    <Link key={sub.href} href={subHref} prefetch={false} className={isActive ? "active subitem" : "subitem"}>
                      <span className="nav-icon">{sub.icon}</span>
                      <span>{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

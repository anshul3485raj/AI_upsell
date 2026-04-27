"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

// Lucide Icons
import {
  LayoutDashboard,
  Sparkles,
  ShoppingCart,
  Settings,
  Search,
  PlusCircle,
  BarChart3,
  ShoppingBag,
  CreditCard,
  Ban,
  MoreHorizontal,
  HelpCircle,
  Globe,
  Tag,
  Trash2,
  User,
  FileText,
  Plug,
  ChevronRight,
  Gift,
  Link as LinkIcon,
  Target,
  Package,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

  {
    href: "/recommendations",
    label: "Recommendations",
    icon: Sparkles,
    submenu: [
      { href: "/recommendations/frequently-bought-together", label: "Frequently Bought Together", icon: Package },
      { href: "/recommendations/handpicked-recommendations", label: "Handpicked Recommendations", icon: Target },
      { href: "/recommendations/related-products", label: "Related Products", icon: LinkIcon },
      { href: "/recommendations/post-purchase-upsell", label: "Post Purchase Upsell", icon: Gift },
    ],
  },

  {
    href: "/section/checkout-extension",
    label: "Checkout Extension",
    icon: ShoppingCart,
    submenu: [
      { href: "/section/checkout-extension/thankyou-page-upsell", label: "Thankyou Page Upsell", icon: Gift },
      { href: "/section/checkout-extension/order-status-page-upsell", label: "Order Status Page Upsell", icon: FileText },
    ],
  },

  { href: "/section/customize-widgets", label: "Customize Widgets", icon: Settings },
  { href: "/section/intelli-search-filter", label: "Intelli Search and Filter", icon: Search },
  { href: "/section/product-addons", label: "Product Addons", icon: PlusCircle },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/section/cart-drawer", label: "Cart Drawer", icon: ShoppingBag },
  { href: "/section/my-plan", label: "My Plan", icon: CreditCard },
  { href: "/section/exclude-products", label: "Exclude Products", icon: Ban },

  {
    href: "/section/more",
    label: "More",
    icon: MoreHorizontal,
    submenu: [
      { href: "/section/help", label: "Help", icon: HelpCircle },
      { href: "/section/translations", label: "Translations", icon: Globe },
      { href: "/section/offer", label: "Offer", icon: Tag },
      { href: "/section/flush-cache", label: "Flush Cache", icon: Trash2 },
      { href: "/section/my-account", label: "My Account", icon: User },
      { href: "/section/faqs", label: "FAQs", icon: FileText },
      { href: "/section/integrations", label: "Integrations", icon: Plug },
    ],
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = searchParams.toString();

  return (
    <nav className="nav">
      {links.map((link) => {
        const href = params ? `${link.href}?${params}` : link.href;
        const hasActiveSubmenu = Boolean(
          link.submenu?.some(
            (sub) => pathname === sub.href || pathname.startsWith(sub.href + "/"),
          ),
        );
        const isParentActive =
          pathname === link.href ||
          pathname.startsWith(link.href + "/") ||
          hasActiveSubmenu;

        const Icon = link.icon;

        return (
          <div key={link.href} className="nav-group">
            <Link
              href={href}
              prefetch={false}
              className={isParentActive ? "active nav-item" : "nav-item"}
            >
              <Icon size={18} className="nav-icon" />
              <span>{link.label}</span>
              {link.submenu && <ChevronRight size={16} className="nav-chevron" />}
            </Link>

            {link.submenu && isParentActive && (
              <div className="nav-submenu">
                {link.submenu.map((sub) => {
                  const subHref = params
                    ? `${sub.href}?${params}`
                    : sub.href;

                  const isActive = pathname === sub.href;
                  const SubIcon = sub.icon;

                  return (
                    <Link
                      key={sub.href}
                      href={subHref}
                      prefetch={false}
                      className={isActive ? "active subitem" : "subitem"}
                    >
                      <SubIcon size={16} className="nav-icon" />
                      <span>{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/create-offer", label: "Create Offer" },
  { href: "/analytics", label: "Analytics" },
];

export default function Navigation() {
  const searchParams = useSearchParams();
  const params = searchParams.toString();

  return (
    <nav className="nav">
      {links.map((link) => (
        <Link
          key={link.href}
          href={params ? `${link.href}?${params}` : link.href}
          prefetch={false}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

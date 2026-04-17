"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

const widgetItems = [
  { slug: "product-page", title: "Product Page", icon: "🏷️", help: "Product page upsells", target: "/create-offer?trigger=PRODUCT&widget=Product+Page" },
  { slug: "cart-page", title: "Cart Page", icon: "🛒", help: "Cart page upsells", target: "/create-offer?trigger=CART&widget=Cart+Page" },
  { slug: "thankyou-page", title: "Thankyou Page", icon: "✅", help: "Thank you page upsells", target: "/section/thankyou-page" },
  { slug: "home-page", title: "Home Page", icon: "🏠", help: "Homepage upsells", target: "/section/home-page" },
  { slug: "collection-pages", title: "Collection Pages", icon: "📚", help: "Collection page upsells", target: "/section/collection-pages" },
  { slug: "search-results-page", title: "Search Results Page", icon: "🔎", help: "Search page upsells", target: "/section/search-results-page" },
  { slug: "404-page", title: "404 Not Found Page", icon: "🚫", help: "404 page upsells", target: "/section/404-page" },
  { slug: "blog-posts", title: "Blog Posts or Other Pages", icon: "✍️", help: "Blog page upsells", target: "/section/blog-posts" },
  { slug: "account-login", title: "Account/Login Page", icon: "👤", help: "Account page upsells", target: "/section/account-login" },
];

export default function DashboardPage() {
  const { apiFetch, isReady } = useAuthenticatedFetch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shop, setShop] = useState(null);
  const [rules, setRules] = useState([]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [shopData, ruleData] = await Promise.all([
          apiFetch("/shop/me"),
          apiFetch("/upsell/rules"),
        ]);
        if (!active) {
          return;
        }
        setShop(shopData);
        setRules(ruleData);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err.message || "Unable to load dashboard.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [apiFetch, isReady]);

  const counts = useMemo(() => {
    return {
      productRules: rules.filter((rule) => rule.triggerType === "PRODUCT" && rule.isActive).length,
      cartRules: rules.filter((rule) => rule.triggerType === "CART" && rule.isActive).length,
      activeRules: rules.filter((rule) => rule.isActive).length,
    };
  }, [rules]);

  return (
    <div className="dashboard-page">
      <section className="surface hero-panel">
        <div className="hero-copy">
          <div className="hero-badge">New</div>
          <h1>30-Day Goal with Thank You Page Upsells</h1>
          <p className="hero-text">
            Boost extra revenue right after checkout on Thankyou Page. Customers are most engaged
            post-purchase—enable Thank You Page Upsells to get repeat sales.
          </p>

          <div className="goal-grid">
            <div>
              <div className="overline">Goal amount so far</div>
              <div className="hero-value">₹0.00</div>
            </div>
            <div>
              <div className="overline">Target</div>
              <div className="hero-value">₹50</div>
            </div>
          </div>

          <button className="btn">Activate Now</button>
        </div>

        <div className="hero-side">
          <div className="surface plan-card">
            <div className="overline">Subscription Plan</div>
            <div className="plan-name">Basic Free</div>
            <p className="small">You are currently on the Basic Free plan.</p>
            <div className="plan-stats">
              <div>
                <div className="overline">Order Count</div>
                <div className="hero-value">0</div>
              </div>
            </div>
            <button className="btn secondary">View Details</button>
          </div>
        </div>
      </section>

      <section className="surface setup-card">
        <div className="section-header">
          <h2>Setup Widgets</h2>
        </div>

        <div className="widget-grid">
          {widgetItems.map((widget) => {
            const isProduct = widget.slug === "product-page";
            const isCart = widget.slug === "cart-page";
            const enabled = isProduct
              ? counts.productRules > 0
              : isCart
              ? counts.cartRules > 0
              : false;
            const statusLabel = isProduct || isCart ? (enabled ? "Enabled" : "Disabled") : "Coming soon";

            return (
              <div key={widget.slug} className="widget-box">
                <div className="widget-header">
                  <div className="widget-icon">{widget.icon}</div>
                  <div>
                    <div className="widget-title">{widget.title}</div>
                    <div className="widget-subtitle">{widget.help}</div>
                  </div>
                </div>

                <div className="widget-body">
                  <div className="widget-price">₹0.00</div>
                  <div className={`widget-status-pill ${enabled ? "active" : "inactive"}`}>
                    {statusLabel}
                  </div>
                </div>

                <div className="widget-actions">
                  <Link href={widget.target} className="button-link">
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="surface info-card">
          <div className="section-header">
            <h2>Store Status</h2>
          </div>
          <p className="small">
            {shop ? `Connected shop: ${shop.domain}` : "Connect your store via Shopify install flow."}
          </p>
          <div className="status-grid">
            <div className="status-item">
              <span>Active Rules</span>
              <strong>{counts.activeRules}</strong>
            </div>
            <div className="status-item">
              <span>Total Rules</span>
              <strong>{rules.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="surface rules-panel">
        <div className="section-header">
          <h2>Active Upsell Rules</h2>
        </div>
        {loading ? <p className="small">Loading rules...</p> : null}
        {error ? <p className="small error-text">{error}</p> : null}
        {!loading && !error ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Trigger</th>
                <th>Source Product</th>
                <th>Source Tag</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.length ? (
                rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.name}</td>
                    <td>{rule.triggerType}</td>
                    <td>{rule.sourceProductId || "-"}</td>
                    <td>{rule.sourceTag || "-"}</td>
                    <td>{rule.isActive ? "Active" : "Paused"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="small">
                    No rules yet. Create one in the Create Offer page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : null}
      </section>
    </div>
  );
}

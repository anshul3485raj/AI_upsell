"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import KpiCard from "../../components/KpiCard";

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
  const [summary, setSummary] = useState({ sales: 0, impressions: 0, conversions: 0, clicks: 0 });

  const loadData = async () => {
    if (!isReady) return;
    setLoading(true);
    setError("");
    try {
      const [shopData, ruleData, summaryData] = await Promise.all([
        apiFetch("/shop/me"),
        apiFetch("/upsell/rules"),
        apiFetch("/analytics/summary?days=30"),
      ]);
      setShop(shopData);
      setRules(ruleData);
      setSummary(summaryData || { sales: 0, impressions: 0, conversions: 0, clicks: 0 });
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiFetch, isReady]);

  const toggleRule = async (id, currentStatus) => {
    try {
      await apiFetch(`/upsell/rules/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      loadData();
    } catch (err) {
      alert("Failed to update rule status.");
    }
  };

  const deleteRule = async (id) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    try {
      await apiFetch(`/upsell/rules/${id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("Failed to delete rule.");
    }
  };

  const counts = useMemo(() => {
    return {
      productRules: rules.filter((rule) => rule.triggerType === "PRODUCT" && rule.isActive).length,
      cartRules: rules.filter((rule) => rule.triggerType === "CART" && rule.isActive).length,
      activeRules: rules.filter((rule) => rule.isActive).length,
    };
  }, [rules]);

  const goalAmount = 10000; // Static target for now
  const progressPercent = Math.min((summary.sales / goalAmount) * 100, 100);

  return (
    <div className="dashboard-page">
      <section className="surface hero-panel">
        <div className="hero-copy">
          <div className="hero-badge">30-Day Goal</div>
          <h1>Sales Performance</h1>
          <p className="hero-text">
            Track your revenue generated through AI-powered upsells and cross-sells.
          </p>

          <div className="goal-grid">
            <div>
              <div className="overline">Sales Generated</div>
              <div className="hero-value">₹{summary.sales.toLocaleString()}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="overline">Goal Progress (Target: ₹{goalAmount.toLocaleString()})</div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="hero-side">
          <div className="surface plan-card">
            <div className="overline">Connected Store</div>
            <div className="plan-name">{shop?.domain || "Loading..."}</div>
            <p className="small">Plan: {shop?.plan || "Basic Free"}</p>
            <Link href="/analytics" className="btn secondary" style={{ marginTop: 12 }}>View Detailed Analytics</Link>
          </div>
        </div>
      </section>

      <div className="analytics-kpi-grid" style={{ marginBottom: 24 }}>
        <KpiCard title="Impressions" value={summary.impressions.toLocaleString()} subtitle="Views on widgets" />
        <KpiCard title="Clicks" value={summary.clicks.toLocaleString()} subtitle="Engagement" />
        <KpiCard title="Conversions" value={summary.conversions.toLocaleString()} subtitle="Orders with upsells" />
        <KpiCard title="Conversion Rate" 
                 value={`${summary.impressions > 0 ? ((summary.conversions / summary.impressions) * 100).toFixed(1) : 0}%`} 
                 subtitle="Impressions to Orders" />
      </div>

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
                    {enabled ? "Manage" : "Setup"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="surface rules-panel">
        <div className="section-header">
          <h2>Active Upsell Rules</h2>
          <Link href="/create-offer" className="button-link">+ Create New Rule</Link>
        </div>
        {loading ? <p className="small">Loading rules...</p> : null}
        {error ? <p className="small error-text">{error}</p> : null}
        {!loading && !error ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Trigger</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.length ? (
                rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.name}</td>
                    <td>{rule.triggerType}</td>
                    <td>
                      <button 
                        className={`status-pill ${rule.isActive ? "active" : "inactive"}`}
                        onClick={() => toggleRule(rule.id, rule.isActive)}
                      >
                        {rule.isActive ? "Active" : "Paused"}
                      </button>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        <Link href={`/edit-offer/${rule.id}`} className="button-link small">Edit</Link>
                        <button 
                          className="button-link small error-text" 
                          onClick={() => deleteRule(rule.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="small">
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

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

  const [activeWidget, setActiveWidget] = useState(null);
  const [widgetSettings, setWidgetSettings] = useState({});

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

  const updateWidget = (key, field, value) => {
    setWidgetSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const saveWidgetSettings = () => {
    console.log("Saving widget settings:", widgetSettings);
    alert("Saved (connect API later)");
  };

  const counts = useMemo(() => {
    return {
      productRules: rules.filter((rule) => rule.triggerType === "PRODUCT" && rule.isActive).length,
      cartRules: rules.filter((rule) => rule.triggerType === "CART" && rule.isActive).length,
      activeRules: rules.filter((rule) => rule.isActive).length,
    };
  }, [rules]);

  const goalAmount = 10000;
  const progressPercent = Math.min((summary.sales / goalAmount) * 100, 100);

  return (
    <div className="dashboard-page">

      {/* SETTINGS PANEL */}
      {activeWidget ? (
        <div className="widget-settings-panel">
          <div className="settings-header">
            <h2>Widgets For {activeWidget.replaceAll("-", " ")}</h2>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setActiveWidget(null)} className="btn secondary">Back</button>
              <button onClick={saveWidgetSettings} className="btn primary">Save</button>
            </div>
          </div>

          <div className="settings-grid">
            {[
              "Frequently Bought",
              "Handpicked Recommendations",
              "Related Products",
              "Inspired by User's Browsing History",
              "Recently Viewed Products",
              "Top Selling Products",
              "New Arrivals",
              "Trending Products",
              "Featured Products",
            ].map((item, index) => {
              const key = `${activeWidget}_${index}`;

              return (
                <div key={key} className="settings-card">
                  <div className="settings-card-header">
                    <h4>{item}</h4>

                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={widgetSettings[key]?.enabled || false}
                        onChange={(e) =>
                          updateWidget(key, "enabled", e.target.checked)
                        }
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="settings-body">
                    <label>Widget Title</label>
                    <input
                      type="text"
                      value={widgetSettings[key]?.title || item}
                      onChange={(e) =>
                        updateWidget(key, "title", e.target.value)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* HERO */}
          <section className="surface hero-panel upgraded-hero">
            <div className="hero-copy">
              <div className="hero-badge">🔥 New</div>
              <h2>30-Day Goal with Thank You Page Upsells</h2>
              <p>Boost extra revenue right after checkout</p>

              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="goal-row">
                <span>₹{summary.sales}</span>
                <span>Target ₹{goalAmount}</span>
              </div>
            </div>

            <div className="hero-side">
              <div className="surface plan-card upgraded-plan">
                <h4>Subscription Plan</h4>
                <p>{shop?.plan || "Custom Plan"}</p>
                <button className="btn secondary">View Details</button>
              </div>
            </div>
          </section>

          {/* KPIs */}
          <div className="analytics-kpi-grid" style={{ marginBottom: 24 }}>
            <KpiCard title="Impressions" value={summary.impressions.toLocaleString()} />
            <KpiCard title="Clicks" value={summary.clicks.toLocaleString()} />
            <KpiCard title="Conversions" value={summary.conversions.toLocaleString()} />
          </div>

          {/* SETUP WIDGETS */}
          <section className="surface setup-card">
            <div className="section-header">
              <h2>Setup Widgets</h2>
            </div>

            <div className="widget-grid">
              {widgetItems.map((widget) => (
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
                  </div>

                  <div className="widget-actions">
                    <button
                      className="button-link"
                      onClick={() => setActiveWidget(widget.slug)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* HELP SECTION */}
          <section className="surface help-support">
            <div className="section-header">
              <h2>Help & Support</h2>
            </div>

            <div className="help-grid">
              <div className="help-card">
                <h4>Live Chat</h4>
                <button className="btn primary">Chat Now</button>
              </div>

              <div className="help-card">
                <h4>Schedule A Call</h4>
                <button className="btn secondary">Book A Call</button>
              </div>

              <div className="help-card">
                <h4>Help Center</h4>
                <button className="btn secondary">Visit Here</button>
              </div>

              <div className="help-card">
                <h4>Video Tutorials</h4>
                <button className="btn secondary">Watch</button>
              </div>
            </div>
          </section>

          {/* RULES */}
          <section className="surface rules-panel">
            <div className="section-header">
              <h2>Active Upsell Rules</h2>
              <Link href="/create-offer" className="button-link">+ Create New Rule</Link>
            </div>

            <table className="table">
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.name}</td>
                    <td>
                      <button onClick={() => toggleRule(rule.id, rule.isActive)}>
                        {rule.isActive ? "Active" : "Paused"}
                      </button>
                    </td>
                    <td>
                      <button onClick={() => deleteRule(rule.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}
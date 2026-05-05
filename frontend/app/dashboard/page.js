"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { Sparkles } from "lucide-react";
import KpiCard from "../../components/KpiCard";
import {
  Tag,
  ShoppingCart,
  CheckCircle,
  Home,
  Layers,
  Search,
  AlertCircle,
  PenLine,
  User,
} from "lucide-react";

const widgetItems = [
  { slug: "product-page", title: "Product Page", icon: Tag, help: "Product page upsells", target: "/create-offer?trigger=PRODUCT&widget=Product+Page" },
  { slug: "cart-page", title: "Cart Page", icon: ShoppingCart, help: "Cart page upsells", target: "/create-offer?trigger=CART&widget=Cart+Page" },
  { slug: "thankyou-page", title: "Thankyou Page", icon: CheckCircle, help: "Thank you page upsells", target: "/section/thankyou-page" },
  { slug: "home-page", title: "Home Page", icon: Home, help: "Homepage upsells", target: "/section/home-page" },
  { slug: "collection-pages", title: "Collection Pages", icon: Layers, help: "Collection page upsells", target: "/section/collection-pages" },
  { slug: "search-results-page", title: "Search Results Page", icon: Search, help: "Search page upsells", target: "/section/search-results-page" },
  { slug: "404-page", title: "404 Not Found Page", icon: AlertCircle, help: "404 page upsells", target: "/section/404-page" },
  { slug: "blog-posts", title: "Blog Posts or Other Pages", icon: PenLine, help: "Blog page upsells", target: "/section/blog-posts" },
  { slug: "account-login", title: "Account/Login Page", icon: User, help: "Account page upsells", target: "/section/account-login" },
];

export default function DashboardPage() {
  const { apiFetch, isReady } = useAuthenticatedFetch();
  const searchParams = useSearchParams();
  const embeddedParams = searchParams.toString();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shop, setShop] = useState(null);
  const [rules, setRules] = useState([]);
  const [summary, setSummary] = useState({
    sales: 0,
    impressions: 0,
    conversions: 0,
    clicks: 0,
    addedToCart: 0,
  });

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
      setSummary(summaryData || {
        sales: 0,
        impressions: 0,
        conversions: 0,
        clicks: 0,
        addedToCart: 0,
      });
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
    console.log("Widget configuration draft:", widgetSettings);
    alert("Widget editor is saved locally in this session. Upsell rules are fully operational below.");
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
              <div className="hero-badge">
                <Sparkles size={14} />
                <span>New</span>
              </div>
              <h2>30-Day Goal with Thank You Page Upsells newwww</h2>
              <p>Boost extra revenue right after checkout</p>

              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="goal-row">
                <span>Rs {summary.sales}</span>
                <span>Target Rs {goalAmount}</span>
              </div>
            </div>

            <div className="hero-side">
              <div className="surface plan-card upgraded-plan">
                <h4>Subscription Plan</h4>
                <strong>Custom Plan with Search</strong>
                {/* <p>{shop?.plan || "Custom Plan"}</p> */}
                <p>You are currently on the Custom Plan with Search plan.</p>
                <button className="btn secondary">View Details</button>
              </div>
            </div>
          </section>

          {/* KPIs */}
          <div className="analytics-kpi-grid" >
            <KpiCard title="Impressions" value={summary.impressions.toLocaleString()} />
            <KpiCard title="Clicks" value={summary.clicks.toLocaleString()} />
            <KpiCard title="Conversions" value={summary.conversions.toLocaleString()} />
            <KpiCard title="Active Rules" value={counts.activeRules.toLocaleString()} />
          </div>

          {loading ? <p className="small">Loading dashboard data...</p> : null}
          {error ? <p className="small error-text">{error}</p> : null}

          {/* SETUP WIDGETS */}
          <section className="surface setup-card">
            <div className="section-header">
              <h2>Setup Widgets</h2>
            </div>

            <div className="widget-grid">
              {widgetItems.map((widget) => {
                const Icon = widget.icon;

                return (
                  <div key={widget.slug} className="widget-box">
                    <div className="widget-header">
                      <div className="widget-icon">
                        <Icon size={20} />
                      </div>

                      <div>
                        <div className="widget-title">{widget.title}</div>
                        <div className="widget-subtitle">{widget.help}</div>
                      </div>
                    </div>

                    <div className="widget-body">
                      <div className="widget-price">Rs 0.00</div>
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
                );
              })}
            </div>
          </section>

          {/* HELP SECTION */}
      <section className="surface help-support">
  <div className="section-header">
    <h2>Help & Support</h2>
  </div>

  <div className="help-grid">

    {/* SVG 1 FIXED */}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <g clipPath="url(#clip0_2628_1103)">
        <path d="M6.66675 8.3335H13.3334" stroke="#411D57" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.66675 11.6665H10.0001" stroke="#411D57" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.0001 18.3332C14.6026 18.3332 18.3334 14.6023 18.3334 9.99984C18.3334 5.39734 14.6026 1.6665 10.0001 1.6665C5.39758 1.6665 1.66675 5.39734 1.66675 9.99984C1.66675 11.5173 2.07258 12.9415 2.78175 14.1665L2.08341 17.9165L5.83341 17.2182C7.0997 17.9507 8.53718 18.3354 10.0001 18.3332Z" stroke="#411D57" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_2628_1103">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>

    {/* SVG 2 FIXED */}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M14.8644 12.3397L11.5366 12.9893C9.28971 11.8529 7.90088 10.5472 7.09295 8.51215L7.71506 5.15025L6.53952 2H3.50897C2.59763 2 1.88019 2.75867 2.01673 3.6663C2.35606 5.93171 3.35789 10.0401 6.28502 12.9893C9.36 16.0866 13.7875 17.4305 16.2242 17.9654C17.1654 18.1713 18 17.4322 18 16.461V13.5436L14.8644 12.3397Z" stroke="#411D57" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>

    {/* SVG 3 FIXED */}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M16.6666 9.16667C16.6666 7.39856 15.9642 5.70286 14.714 4.45262C13.4637 3.20238 11.768 2.5 9.99992 2.5C8.23181 2.5 6.53612 3.20238 5.28587 4.45262C4.03563 5.70286 3.33325 7.39856 3.33325 9.16667" stroke="#411D57" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>

    {/* SVG 4 FIXED */}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5.755 3.78183C5.67909 3.73682 5.59262 3.7127 5.50437 3.71193C5.41612 3.71116 5.32924 3.73376 5.25255 3.77744C5.17586 3.82111 5.1121 3.88431 5.06775 3.9606C5.02339 4.0369 5.00002 4.12357 5 4.21183V15.7902C5.00002 15.8784 5.02339 15.9651 5.06775 16.0414C5.1121 16.1177 5.17586 16.1809 5.25255 16.2245C5.32924 16.2682 5.41612 16.2908 5.50437 16.2901C5.59262 16.2893 5.67909 16.2652 5.755 16.2202L15.5242 10.431C15.5988 10.3867 15.6606 10.3238 15.7035 10.2484C15.7464 10.173 15.769 10.0878 15.769 10.001C15.769 9.91424 15.7464 9.82897 15.7035 9.75358C15.6606 9.67819 15.5988 9.61526 15.5242 9.57099L5.755 3.78183Z" stroke="#411D57" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>

  </div>
</section>


          {/* RULES */}
          <section className="surface rules-panel">
            <div className="section-header">
              <h2>Active Upsell Rules</h2>
              <Link href={embeddedParams ? `/create-offer?${embeddedParams}` : "/create-offer"} className="button-link">+ Create New Rule</Link>
            </div>

            <table className="table">
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.name}</td>
                    <td>{rule.triggerType === "PRODUCT" ? "Product" : "Cart"}</td>
                    <td>
                      <button onClick={() => toggleRule(rule.id, rule.isActive)}>
                        {rule.isActive ? "Active" : "Paused"}
                      </button>
                    </td>
                    <td>
                      <Link href={embeddedParams ? `/edit-offer/${rule.id}?${embeddedParams}` : `/edit-offer/${rule.id}`} className="button-link">Edit</Link>
                    </td>
                    <td>
                      <button onClick={() => deleteRule(rule.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan="5">No rules created yet. Create your first upsell rule to start serving recommendations.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

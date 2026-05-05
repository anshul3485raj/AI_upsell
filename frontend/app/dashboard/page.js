"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
                <span>₹{summary.sales}</span>
                <span>Target ₹{goalAmount}</span>
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
          </div>

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
              <div className="help-card">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"> <g clip-path="url(#clip0_2628_1103)"> <path d="M6.66675 8.3335H13.3334" stroke="#411D57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6.66675 11.6665H10.0001" stroke="#411D57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.0001 18.3332C14.6026 18.3332 18.3334 14.6023 18.3334 9.99984C18.3334 5.39734 14.6026 1.6665 10.0001 1.6665C5.39758 1.6665 1.66675 5.39734 1.66675 9.99984C1.66675 11.5173 2.07258 12.9415 2.78175 14.1665L2.08341 17.9165L5.83341 17.2182C7.0997 17.9507 8.53718 18.3354 10.0001 18.3332Z" stroke="#411D57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g> <defs> <clipPath id="clip0_2628_1103"> <rect width="20" height="20" fill="white"></rect> </clipPath> </defs> </svg>
                <h4>Live Chat</h4>
                <p>Swift support & solution 24/7</p>
                <button className="btn primary">Chat Now</button>
              </div>

              <div className="help-card">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"> <path d="M14.8644 12.3397L11.5366 12.9893C9.28971 11.8529 7.90088 10.5472 7.09295 8.51215L7.71506 5.15025L6.53952 2H3.50897C2.59763 2 1.88019 2.75867 2.01673 3.6663C2.35606 5.93171 3.35789 10.0401 6.28502 12.9893C9.36 16.0866 13.7875 17.4305 16.2242 17.9654C17.1654 18.1713 18 17.4322 18 16.461V13.5436L14.8644 12.3397Z" stroke="#411D57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </svg>
                <h4>Schedule A Call</h4>
                <p>Talk to an Expert</p>
                <button className="btn secondary">Book A Call</button>
              </div>

              <div className="help-card">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"> <path d="M16.6666 9.16667C16.6666 7.39856 15.9642 5.70286 14.714 4.45262C13.4637 3.20238 11.768 2.5 9.99992 2.5C8.23181 2.5 6.53612 3.20238 5.28587 4.45262C4.03563 5.70286 3.33325 7.39856 3.33325 9.16667" stroke="#411D57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M1.66675 12.8682V11.304C1.6668 10.9324 1.79108 10.5714 2.01984 10.2785C2.24859 9.98557 2.56868 9.77751 2.92925 9.68738L4.37925 9.32488C4.45293 9.30653 4.52982 9.3052 4.60409 9.321C4.67836 9.33679 4.74806 9.36929 4.80789 9.41604C4.86773 9.46278 4.91613 9.52254 4.94943 9.59078C4.98273 9.65902 5.00005 9.73395 5.00008 9.80988V14.3624C5.00009 14.4384 4.98276 14.5134 4.94941 14.5817C4.91606 14.6501 4.86757 14.7099 4.80764 14.7566C4.7477 14.8034 4.67789 14.8359 4.60351 14.8516C4.52913 14.8673 4.45215 14.8659 4.37841 14.8474L2.92841 14.4849C2.568 14.3946 2.2481 14.1865 2.01951 13.8936C1.79092 13.6007 1.66676 13.2398 1.66675 12.8682Z" stroke="#411D57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M18.3333 12.8682V11.304C18.3333 10.9324 18.209 10.5714 17.9802 10.2785C17.7515 9.98557 17.4314 9.77751 17.0708 9.68738L15.6208 9.32488C15.5472 9.30653 15.4703 9.3052 15.396 9.321C15.3217 9.33679 15.252 9.36929 15.1922 9.41604C15.1324 9.46278 15.0839 9.52254 15.0506 9.59078C15.0173 9.65902 15 9.73395 15 9.80988V14.3624C15 14.4383 15.0173 14.5132 15.0506 14.5815C15.0839 14.6497 15.1324 14.7095 15.1922 14.7562C15.252 14.803 15.3217 14.8355 15.396 14.8513C15.4703 14.8671 15.5472 14.8657 15.6208 14.8474L17.0708 14.4849C17.4314 14.3948 17.7515 14.1867 17.9802 13.8938C18.209 13.6008 18.3333 13.2399 18.3333 12.8682Z" stroke="#411D57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M16.6666 15V15.4167C16.6666 15.8587 16.491 16.2826 16.1784 16.5952C15.8659 16.9077 15.4419 17.0833 14.9999 17.0833H12.0833" stroke="#411D57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M11.25 18.3335H8.75C8.41848 18.3335 8.10054 18.2018 7.86612 17.9674C7.6317 17.733 7.5 17.415 7.5 17.0835C7.5 16.752 7.6317 16.434 7.86612 16.1996C8.10054 15.9652 8.41848 15.8335 8.75 15.8335H11.25C11.5815 15.8335 11.8995 15.9652 12.1339 16.1996C12.3683 16.434 12.5 16.752 12.5 17.0835C12.5 17.415 12.3683 17.733 12.1339 17.9674C11.8995 18.2018 11.5815 18.3335 11.25 18.3335Z" stroke="#411D57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </svg>
                <h4>Help Center</h4>
                <p>guide to your queries</p>
                <button className="btn secondary">Visit Here</button>
              </div>

              <div className="help-card">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"> <path d="M5.755 3.78183C5.67909 3.73682 5.59262 3.7127 5.50437 3.71193C5.41612 3.71116 5.32924 3.73376 5.25255 3.77744C5.17586 3.82111 5.1121 3.88431 5.06775 3.9606C5.02339 4.0369 5.00002 4.12357 5 4.21183V15.7902C5.00002 15.8784 5.02339 15.9651 5.06775 16.0414C5.1121 16.1177 5.17586 16.1809 5.25255 16.2245C5.32924 16.2682 5.41612 16.2908 5.50437 16.2901C5.59262 16.2893 5.67909 16.2652 5.755 16.2202L15.5242 10.431C15.5988 10.3867 15.6606 10.3238 15.7035 10.2484C15.7464 10.173 15.769 10.0878 15.769 10.001C15.769 9.91424 15.7464 9.82897 15.7035 9.75358C15.6606 9.67819 15.5988 9.61526 15.5242 9.57099L5.755 3.78183Z" stroke="#411D57" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </svg>
                <h4>Video Tutorials</h4>
                <p>learn, practice/apply and conquer</p>
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
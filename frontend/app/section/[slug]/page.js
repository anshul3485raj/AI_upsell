"use client";

import { useMemo, useState } from "react";

const sectionTitles = {
  recommendations: "Recommendations",
  "checkout-extension": "Checkout Extension",
  "customize-widgets": "Customize Widgets",
  "intelli-search-filter": "Intelli Search and Filter",
  "product-addons": "Product Addons",
  "cart-drawer": "Cart Drawer",
  "my-plan": "My Plan",
  "exclude-products": "Exclude Products",
  more: "More",
  help: "Help & Support",
  translations: "App Translations",
  offer: "Exclusive Offers",
  "flush-cache": "Maintenance & Cache",
  "my-account": "My Account",
  faqs: "Frequently Asked Questions",
  integrations: "App Integrations",
  "thankyou-page": "Thankyou Page",
  "home-page": "Home Page",
  "collection-pages": "Collection Pages",
  "search-results-page": "Search Results Page",
  "404-page": "404 Not Found Page",
  "blog-posts": "Blog Posts or Other Pages",
  "account-login": "Account/Login Page",
};

export default function SectionPage({ params }) {
  if (params.slug === "my-plan") {
    return <MyPlanPage />;
  }

  if (params.slug === "exclude-products") {
    return <ExcludeProductsPage />;
  }

  if (params.slug === "help") return <HelpLayout />;
  if (params.slug === "translations") return <TranslationsLayout />;
  if (params.slug === "offer") return <OfferLayout />;
  if (params.slug === "flush-cache") return <FlushCacheLayout />;
  if (params.slug === "my-account") return <AccountLayout />;
  if (params.slug === "faqs") return <FaqsLayout />;
  if (params.slug === "integrations") return <IntegrationsLayout />;

  const title = sectionTitles[params.slug] || params.slug.replace(/-/g, " ");

  return (
    <div className="page-section">
      <div className="surface">
        <h1>{title}</h1>
        <p className="small">
          This section is coming soon. Use the left navigation to explore existing pages in the app.
        </p>
      </div>
    </div>
  );
}

function HelpLayout() {
  const recommendedApps = [
    {
      name: "Wholesale Pricing Discount B2B",
      logo: "WP",
      logoClassName: "purple",
      description: "B2B wholesale pricing, volume-tiered discounts, net payment terms, shipping rates and more.",
      meta: "4.8 (456) | 21-day free trial",
    },
    {
      name: "PageFly Landing Page Builder",
      logo: "PF",
      logoClassName: "indigo",
      description: "Create your sections, landing, product, home, and collection pages with an easy builder.",
      meta: "4.9 (6823 reviews) | Free to install",
    },
    {
      name: "TxtCart Plus+ SMS Marketing",
      logo: "TC",
      logoClassName: "blue",
      description: "Text marketing, SMS cart recovery, and analytics powered by AI for Shopify brands.",
      meta: "5.0 (20) | 14-days free trial",
    },
  ];

  return (
    <div className="page-section help-page">
      <div className="page-header-row help-page-header">
        <h1>Help Wiser</h1>
      </div>

      <div className="surface help-page-shell">
        <div className="help-top-grid">
          <section className="help-support-card">
            <div className="help-support-card-head">
              <div className="help-support-icon">
                <HelpHandshakeIcon />
              </div>
              <h2>Need Help? Talk To Us</h2>
            </div>

            <div className="help-support-card-body">
              <a href="mailto:support@expertvillagemedia.com?subject=Live%20Chat%20Request" className="help-resource-link">
                Live Chat
              </a>
              <a href="mailto:support@expertvillagemedia.com" className="help-resource-link help-email-link">
                support@expertvillagemedia.com
              </a>
            </div>
          </section>

          <section className="help-support-card">
            <div className="help-support-card-head">
              <div className="help-support-icon">
                <HelpKnowledgeIcon />
              </div>
              <h2>Knowledgebase &amp; FAQs</h2>
            </div>

            <div className="help-support-card-body">
              <a href="/dashboard" className="help-resource-link">
                App Setup Instructions
              </a>
              <a href="/section/faqs" className="help-resource-link">
                FAQs
              </a>
            </div>
          </section>
        </div>

        <section className="help-recommended-section">
          <h3>Recommended Shopify Apps</h3>

          <div className="help-app-grid">
            {recommendedApps.map((app) => (
              <article key={app.name} className="help-app-card">
                <div className="help-app-title-row">
                  <div className={`help-app-logo ${app.logoClassName}`}>{app.logo}</div>
                  <div>
                    <h4>{app.name}</h4>
                    <p>{app.description}</p>
                  </div>
                </div>

                <div className="help-app-meta">{app.meta}</div>
                <button type="button" className="help-app-button">Try it for Free</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function HelpHandshakeIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M15 18l9 8 8-7 7 6 10-8 7 8-8 8-5-3-8 7-7-6-6 5-7-7 6-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 39l7 7m-2-11l7 7m-1-12l7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="44" cy="15" r="8" fill="#ff2d7a" />
      <path d="M41 15l2 2 4-5" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HelpKnowledgeIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 46V33c0-5 4-9 9-9h10c5 0 9 4 9 9v13" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2.8" />
      <path d="M14 46h36v8H14z" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="round" />
      <circle cx="48" cy="16" r="8" fill="#ff2d7a" />
      <path d="M45 16l2 2 4-5" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TranslationsLayout() {
  const translationLanguages = [
    "Chinese (Traditional)",
    "Chinese (Simplified)",
    "Dutch",
    "English",
    "Filipino",
    "French",
    "German",
    "Hindi",
    "Italian",
    "Japanese",
    "Korean",
    "Portuguese (Brazil)",
    "Romanian",
    "Russian",
    "Spanish",
    "Turkish",
  ];

  const defaultTranslationFields = [
    { key: "frequentlyBoughtHeading", label: "Frequently Bought Heading", value: "Frequently Bought Together" },
    { key: "manualRecommendationsHeading", label: "Manual Recommendations Heading", value: "Personalized Recommendations" },
    { key: "relatedProductsHeading", label: "Related Products Heading", value: "Related Products" },
    { key: "recentlyViewedProductsHeading", label: "Recently Viewed Products Heading", value: "Recently Viewed Products" },
    { key: "newArrivalsHeading", label: "New Arrivals Heading", value: "New Arrivals" },
    { key: "aiBasedRecommendationsHeading", label: "AI Based Recommendations Heading", value: "Inspired By Your Views" },
    { key: "aiPoweredRecommendations", label: "AI Powered Recommendations", value: "Add Title" },
    { key: "featuredProductsHeading", label: "Featured Products Heading", value: "Featured Products" },
    { key: "topSellingProductsHeading", label: "Top Selling Products Heading", value: "Top Selling Products" },
    { key: "trendingProductsHeading", label: "Trending Products Heading", value: "Trending Products" },
    { key: "recentPurchasedProductsHeading", label: "Recent Purchased Products Heading", value: "Recent Purchased Products" },
    { key: "recentPurchasedRecommendationsHeading", label: "Recent Purchased Based Recommendations Heading", value: "Recent Purchased Based Recommendations" },
    { key: "addToCartButtonText", label: "Add To Cart Button Text", value: "Add to Cart" },
    { key: "addedToCartConfirmation", label: "Add to cart (Confirmation)", value: "Added to cart!" },
    { key: "viewCartText", label: "View cart Text", value: "View cart" },
    { key: "orText", label: "Or Text", value: "or" },
    { key: "continueShoppingText", label: "Continue shopping Text", value: "Continue shopping." },
    { key: "productOutOfStock", label: "Product is out of stock", value: "Product is out of stock." },
    { key: "soldOutText", label: "Sold Out", value: "Sold Out" },
    { key: "frequentlyBoughtTogetherTotal", label: "Frequently Bought Together Total", value: "Total Price" },
    { key: "thisItemText", label: "This item", value: "This item:" },
    { key: "selectVariantText", label: "Select a variant", value: "Select a variant" },
    { key: "chooseOptionText", label: "Choose option", value: "Choose option" },
    { key: "addonHeading", label: "Addon Heading", value: "Add Addon Heading" },
    { key: "popupHeading", label: "Popup Heading", value: "You may also like" },
    { key: "popupAddToCart", label: "Popup Add to Cart", value: "Add to cart" },
    { key: "descriptionText", label: "Description", value: "Description" },
    { key: "quantityText", label: "Quantity", value: "Quantity" },
    { key: "checkoutAddButton", label: "Checkout \"Add\" Button", value: "Add" },
    { key: "fixedProductsText", label: "Fixed Products", value: "Recommended For You" },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState("Chinese (Traditional)");
  const [saved, setSaved] = useState(false);
  const [fields, setFields] = useState(defaultTranslationFields);
  const [extraSections, setExtraSections] = useState([
    { key: "customized-message", label: "Customized message", open: false },
    { key: "cart-drawer-text", label: "Cart Drawer Text", open: false },
    { key: "intelli-search-filter", label: "Customized message for Intelli Search Filter", open: false },
  ]);

  const updateFieldValue = (key, value) => {
    setFields((current) =>
      current.map((field) => (field.key === key ? { ...field, value } : field)),
    );
  };

  const handleResetTranslations = () => {
    setFields(defaultTranslationFields);
    setSaved(false);
  };

  const handleAddMoreField = () => {
    const nextIndex = fields.length + 1;
    setFields((current) => [
      ...current,
      {
        key: `customField${nextIndex}`,
        label: `Custom Translation ${nextIndex}`,
        value: "",
      },
    ]);
  };

  const handleToggleExtraSection = (key) => {
    setExtraSections((current) =>
      current.map((section) =>
        section.key === key ? { ...section, open: !section.open } : section,
      ),
    );
  };

  const handleSaveTranslations = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="page-section translations-page">
      <div className="translations-header-row">
        <div>
          <h1>Translations</h1>
        </div>
        <div className="translations-header-actions">
          <button
            className="button-link"
            type="button"
            onClick={handleResetTranslations}
          >
            Reset Translation
          </button>
          <button className="btn" type="button" onClick={handleAddMoreField}>
            Add More
          </button>
        </div>
      </div>

      <div className="surface translations-shell">
        <div className="translations-toolbar">
          <select
            className="select translations-language-select"
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
          >
            {translationLanguages.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        <div className="translations-grid">
          {fields.map((field) => (
            <div key={field.key} className="translations-field">
              <label htmlFor={field.key}>{field.label}</label>
              <input
                id={field.key}
                type="text"
                className="text-input"
                value={field.value}
                onChange={(event) => updateFieldValue(field.key, event.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="translations-accordion-list">
          {extraSections.map((section) => (
            <div key={section.key} className="translations-accordion-item">
              <button
                type="button"
                className="translations-accordion-trigger"
                onClick={() => handleToggleExtraSection(section.key)}
              >
                <span>{section.label}</span>
                <span className={`translations-chevron ${section.open ? "open" : ""}`}>
                  &#8250;
                </span>
              </button>
              {section.open ? (
                <div className="translations-accordion-body">
                  <textarea
                    className="textarea"
                    rows={4}
                    placeholder={`Add ${section.label.toLowerCase()}`}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="translations-footer">
          <button className="btn" type="button" onClick={handleSaveTranslations}>
            Save
          </button>
          {saved ? (
            <p className="small success-text">Translations saved successfully.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OfferLayout() {
  return (
    <div className="page-section">
      <div className="surface" style={{
        background: "linear-gradient(135deg, #2d1b4e 0%, #452779 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "10rem", opacity: 0.1 }}>🤖</div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ color: "white", fontSize: "2.2rem" }}>Upgrade to AI Pro</h1>
          <p style={{ opacity: 0.9, margin: "16px 0 32px", maxWidth: "500px", lineHeight: "1.6" }}>
            Get access to deep-learning algorithms, custom AI training, and priority processing for high-volume traffic.
          </p>
          <div style={{ display: "flex", gap: "16px" }}>
            <button className="btn" style={{ background: "white", color: "#4b2867", padding: "12px 32px" }}>Get 30 Days Free</button>
            <button className="btn" style={{ background: "transparent", border: "1px solid white", color: "white" }}>Learn More</button>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>
        <div className="surface" style={{ borderLeft: "4px solid #452779" }}>
          <span style={{ fontSize: "10px", fontWeight: "bold", color: "#452779" }}>NEW ALPHA</span>
          <h3 style={{ margin: "8px 0" }}>Predictive Bundling</h3>
          <p className="small">AI predicts which products will be bought together before they are even added to the cart.</p>
          <button className="btn secondary" style={{ marginTop: "16px", width: "100%" }}>Join Beta</button>
        </div>
        <div className="surface" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3>Enterprise API Access</h3>
            <p className="small">Connect your custom AI models to our headless recommendation engine.</p>
          </div>
          <button className="btn secondary">Inquire</button>
        </div>
      </div>
    </div>
  );
}

function FlushCacheLayout() {
  return (
    <div className="page-section">
      <div className="surface" style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{
          width: "120px",
          height: "120px",
          background: "#f0f4ff",
          borderRadius: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 32px",
          fontSize: "3rem"
        }}>⚡</div>
        <h1>Refresh AI Model</h1>
        <p className="small" style={{ maxWidth: "500px", margin: "16px auto 40px", lineHeight: "1.6", fontSize: "1rem" }}>
          Manually trigger a re-index of your product data. This will clear the AI's short-term cache and force a fresh sync with your Shopify store.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button className="btn primary" style={{ padding: "16px 40px" }}>Force Sync Now</button>
          <button className="btn secondary" style={{ padding: "16px 40px" }}>System Status</button>
        </div>
      </div>
    </div>
  );
}

function AccountLayout() {
  return (
    <div className="page-section account-page">
      <div className="surface account-panel">

        {/* HEADER */}
        <div className="section-header">
          <h1>My Account</h1>
        </div>

        <div className="account-grid">

          {/* LEFT SIDE - PROFILE */}
          <div className="account-left">
            <h2>Profile Details</h2>

            <div className="form-group">
              <label>Store Name</label>
              <input type="text" value="self-theme.myshopify.com" disabled />
            </div>

            <div className="form-group">
              <label>Notification Email</label>
              <input type="email" placeholder="Add your Notification Email here" />
              <p className="helper-text">
                This email will be used for all updates.
              </p>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" placeholder="Enter phone number" />
            </div>

            <div className="form-group">
              <label>Store Owner</label>
              <input type="text" value="Avi Choudhary" disabled />
            </div>
          </div>

          {/* RIGHT SIDE - PLAN CARD */}
          <div className="account-right">
            <div className="plan-card">
              <div className="plan-badge-corner">
                <span>★</span>
              </div>

              <h3>PREMIUM</h3>

              <p>App Install Date</p>
              <strong>2026-04-17</strong>

              <div className="divider"></div>

              <p>Authenticated Capped Amount</p>
              <strong>$</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function FaqsLayout() {
  const [activeTab, setActiveTab] = useState("General");

  const faqs = {
    General: [
      { q: "How does the AI choose which products to recommend?", a: "Our AI engine analyzes customer browsing patterns, historical purchase data, and product attributes (like tags, types, and descriptions) to find the highest-probability cross-sell matches." },
      { q: "Is the AI recommendation real-time?", a: "Yes. Every time a page loads, the AI performs a millisecond-fast calculation to show the most relevant products based on the current session context." },
      { q: "Will the AI work for stores with only a few products?", a: "Absolutely. While the AI gets smarter with more data, it uses 'Cold Start' algorithms to suggest products based on category and description similarity for smaller stores." }
    ],
    Performance: [
      { q: "Does the AI考虑 inventory levels?", a: "Yes, our engine automatically hides products that are out of stock from the recommendation widgets." },
      { q: "How much can I expect my AOV to increase?", a: "On average, stores using AI-driven bundling see an 18-25% increase in Average Order Value within the first 30 days." },
      { q: "Does the app slow down my site?", a: "Not at all. The recommendation script is loaded asynchronously, meaning it won't block your theme's main content from loading." }
    ],
    Customization: [
      { q: "Can I manually override the AI suggestions?", a: "Yes. You can use our 'Handpicked' feature to force specific products to show up for certain items, bypassing the AI engine for those cases." },
      { q: "Does the AI learn from my manual overrides?", a: "Yes. Our deep learning model uses your manual selections as a 'feedback signal' to better understand your brand's specific merchandising strategy." }
    ]
  };

  return (
    <div className="page-section">
      <div className="surface">
        <div className="section-header" style={{ marginBottom: "32px" }}>
          <h1>Everything you need to know</h1>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "40px", borderBottom: "1px solid #f0f0f0", paddingBottom: "16px" }}>
          {Object.keys(faqs).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "#452779" : "transparent",
                color: activeTab === tab ? "white" : "#5f6d84",
                border: "none",
                padding: "8px 20px",
                borderRadius: "99px",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gap: "32px" }}>
          {faqs[activeTab].map(faq => (
            <div key={faq.q} style={{ background: "#f8faff", padding: "24px", borderRadius: "20px", border: "1px solid #eef2f8" }}>
              <h3 style={{ marginBottom: "12px", color: "#13233b", display: "flex", gap: "12px" }}>
                <span style={{ color: "#452779" }}>Q:</span> {faq.q}
              </h3>
              <p style={{ color: "#5f6d84", lineHeight: "1.7", paddingLeft: "32px" }}>
                <strong style={{ color: "#452779", marginLeft: "-32px", marginRight: "12px" }}>A:</strong> {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="surface" style={{ marginTop: "48px", textAlign: "center", background: "#f0f4ff", border: "none" }}>
          <h3>Still have questions?</h3>
          <p className="small" style={{ marginBottom: "20px" }}>Our AI support bot is available 24/7, or you can talk to a human expert.</p>
          <button className="btn">Contact Support</button>
        </div>
      </div>
    </div>
  );
}

function IntegrationsLayout() {
  const apps = [
    { name: "Klaviyo AI", desc: "Predictive email flows based on AI upsell data.", active: true, category: "Marketing" },
    { name: "ChatGPT Assistant", desc: "Auto-generate high-converting product descriptions.", active: false, category: "Content" },
    { name: "Judge.me Reviews", desc: "Weight recommendations based on star ratings.", active: true, category: "Social Proof" },
    { name: "Recharge Subscriptions", desc: "AI identifies which products should be subscriptions.", active: false, category: "Retention" }
  ];

  return (
    <div className="page-section">
      <div className="surface">
        <div className="section-header">
          <h1>AI Ecosystem</h1>
          <button className="btn secondary">Developer Settings</button>
        </div>
        <p className="small" style={{ marginBottom: "32px" }}>Connect your favorite tools to supercharge your AI engine.</p>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" }}>
          {apps.map(app => (
            <div key={app.name} className="surface" style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              border: app.active ? "1px solid #d0e0ff" : "1px solid #f0f0f0",
              background: app.active ? "linear-gradient(135deg, #ffffff 0%, #f9faff 100%)" : "white"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "10px", fontWeight: "bold", color: "#5f6d84", textTransform: "uppercase" }}>{app.category}</span>
                {app.active && <span style={{ fontSize: "10px", color: "#2e7d32", fontWeight: "bold" }}>● CONNECTED</span>}
              </div>
              <div>
                <h3 style={{ margin: "0 0 8px" }}>{app.name}</h3>
                <p className="small" style={{ margin: 0, lineHeight: "1.5" }}>{app.desc}</p>
              </div>
              <button className={`btn ${app.active ? 'secondary' : 'primary'}`} style={{ width: "100%" }}>
                {app.active ? 'Configure' : 'Enable Integration'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExcludeProductsPage() {
  const [searchBy, setSearchBy] = useState("product-name");
  const [query, setQuery] = useState("");
  const [excludedProducts, setExcludedProducts] = useState([]);

  const selectionLabel = useMemo(() => {
    switch (searchBy) {
      case "collection":
        return "Collection";
      case "sku":
        return "SKU";
      default:
        return "Product Name";
    }
  }, [searchBy]);

  const addExcludedProduct = () => {
    if (!query.trim()) return;

    setExcludedProducts((existing) => [
      ...existing,
      { id: crypto.randomUUID(), type: searchBy, value: query.trim() },
    ]);
    setQuery("");
  };

  const removeExcludedProduct = (id) => {
    setExcludedProducts((existing) => existing.filter((product) => product.id !== id));
  };

  return (
    <div className="page-section exclude-page">
      <div className="surface exclude-panel">
        <div className="section-header">
          <div>
            <span className="overline">Exclude Products</span>
            <h1>Exclude products that should not be part of the widgets.</h1>
          </div>
        </div>

        <div className="exclude-form">
          <div className="input-group">
            <label className="select-label">Search By</label>
            <select
              value={searchBy}
              onChange={(event) => setSearchBy(event.target.value)}
              className="select-input"
            >
              <option value="collection">By Collection</option>
              <option value="product-name">By Product Name</option>
              <option value="sku">By SKU</option>
            </select>
          </div>

          <div className="input-group grow">
            <label htmlFor="exclude-query" className="sr-only">Search Query</label>
            <input
              id="exclude-query"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Enter ${selectionLabel}`}
              className="text-input"
            />
          </div>

          <button type="button" className="btn add-button" onClick={addExcludedProduct}>
            Add
          </button>
        </div>

        {excludedProducts.length > 0 ? (
          <div className="excluded-list">
            {excludedProducts.map((item) => (
              <div key={item.id} className="exclude-item">
                <div>
                  <div className="item-label">{item.type === "collection" ? "Collection" : item.type === "sku" ? "SKU" : "Product Name"}</div>
                  <div className="item-value">{item.value}</div>
                </div>
                <button type="button" className="remove-button" onClick={() => removeExcludedProduct(item.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface exclude-empty">
            <p className="small">No excluded products added yet. Use the form above to add products to the exclusion list.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MyPlanPage() {
  const [orderVolume, setOrderVolume] = useState(25);
  const freeLimit = 50;
  const selectedOrders = Math.max(0, Math.min(orderVolume, freeLimit));
  const monthlyPrice = 0;
  const enterprisePrice = "Custom";

  const freeFeatureList = [
    "AI based Recommendations",
    "Frequently Bought Together",
    "Related Products",
    "Manual Recommendations",
    "Detailed Analytics & Reports",
    "Best Sellers & New Arrivals",
    "Conversion Rate Monitoring & Optimization",
    "Customizations",
  ];

  const enterpriseFeatureList = [
    "Frequently Bought Together With Bundle Discount",
    "Cart Drawer Upsell",
    "Wiser Cart - Advanced Cart Drawer",
    "Dynamic Email Recommendations",
    "API Access",
    "Checkout Page Recommendations",
    "Thankyou Page Recommendations",
    "Dedicated Success Manager",
    "Conversion Rate Monitoring & Optimization",
    "Customizations",
  ];

  const planEstimate = useMemo(() => {
    const tier = selectedOrders <= 25 ? "Starter" : "Growing";
    return `${tier} plan for ${selectedOrders} orders / mo`;
  }, [selectedOrders]);

  return (
    <div className="page-section my-plan-page">
      <div className="surface plan-overview">
        <div className="section-header">
          <div>
            <span className="overline">Pricing</span>
            <h1>Plans will switch based on your monthly store orders.</h1>
          </div>
        </div>

        <div className="plan-grid">
          <div className="plan-panel free-card">
            <div className="plan-header">
              <span className="plan-badge">Free</span>
              <div className="price-header">
                <span className="plan-price">${monthlyPrice}/mo</span>
              </div>
            </div>

            <p className="plan-copy">Drag to see the price as per your monthly order volume.</p>

            <div className="order-range">
              <div className="order-range-labels">
                <span>0</span>
                <span>{freeLimit} Orders/mo</span>
              </div>
              <input
                type="range"
                min="0"
                max={freeLimit}
                value={selectedOrders}
                className="plan-slider"
                onChange={(event) => setOrderVolume(Number(event.target.value))}
              />
              <div className="selected-order-value">{selectedOrders} Orders/mo</div>
            </div>

            <div className="feature-block">
              <h2 className="feature-title">Included in Free</h2>
              <ul className="feature-list">
                {freeFeatureList.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="plan-panel enterprise-card">
            <div className="plan-header">
              <span className="plan-badge enterprise-badge">Enterprise</span>
              <div className="price-header">
                <span className="plan-price">{enterprisePrice}</span>
              </div>
            </div>

            <p className="plan-copy">For high-volume Shopify brands looking to scale personalization.</p>

            <div className="feature-block">
              <h2 className="feature-title">Enterprise features</h2>
              <ul className="feature-list">
                {enterpriseFeatureList.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="plan-actions">
              <button className="btn">Talk To Sales</button>
            </div>
          </div>
        </div>

        <div className="surface plan-summary">
          <div className="plan-summary-copy">
            <strong>Monthly Billing Cap Approved -</strong>
            <p>
              This is the maximum amount you have approved with Shopify for Wiser. The approved amount mentioned above is not reflective of what your next bill will be.
            </p>
            <p className="small">
              Please Note: You will be charged a maximum of if your store’s monthly orders exceed the number of orders recorded at the time of app installation.
            </p>
          </div>
          <div className="plan-summary-chip">Selected: {planEstimate}</div>
        </div>
      </div>
    </div>
  );
}

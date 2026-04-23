"use client";

import { useMemo, useState } from "react";

const pageConfig = {
  "frequently-bought-together": {
    title: "Frequently Bought Together",
    description:
      "Show customers product bundles with a preview to increase average order value.",
  },
  "handpicked-recommendations": {
    title: "Handpicked Recommendations",
    description:
      "Choose products manually for focused recommendations on each product page.",
  },
  "related-products": {
    title: "Related Products",
    description:
      "Surface similar products that customers are likely to buy next.",
  },
  "post-purchase-upsell": {
    title: "Post Purchase Upsell",
    description: "Offer an additional product after checkout to boost revenue.",
  },
};

const defaultProducts = [
  {
    id: "gift-card",
    title: "Gift Card",
    variantOptions: ["$10", "$25", "$50"],
    price: 10,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "pearl-dusk",
    title: "Pearl Dusk",
    variantOptions: ["Default Tilt", "Rose Gold", "Ice"],
    price: 949.95,
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "velvet-bloom",
    title: "Velvet Bloom",
    variantOptions: ["Ice", "Satin", "Noir"],
    price: 699.95,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80",
  },
];

const handpickedProducts = [
  {
    id: "rose-magic",
    title: "Rose Magic",
    vendor: "Wiser Labs",
    price: 1299.95,
    image:
      "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "pearl-luxe",
    title: "Pearl Luxe",
    vendor: "Wiser Studios",
    price: 899.95,
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "satin-glow",
    title: "Satin Glow",
    vendor: "Wiser Beauty",
    price: 749.95,
    image:
      "https://images.unsplash.com/photo-1495121605193-b116b5b9c2d8?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "amber-muse",
    title: "Amber Muse",
    vendor: "Studio Nine",
    price: 1050.0,
    image:
      "https://images.unsplash.com/photo-1495121605193-b116b5b9c2d8?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "velvet-kiss",
    title: "Velvet Kiss",
    vendor: "Elegance Co.",
    price: 799.0,
    image:
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=500&q=80",
  },
];

const relatedConditions = [
  { id: "same-collection", label: "Same Collection", enabled: true },
  { id: "related-by-meta", label: "Related By Meta", enabled: false },
  { id: "same-product-type", label: "Same Product Type", enabled: false },
  { id: "same-vendor", label: "Same Vendor", enabled: false },
  { id: "same-tags", label: "Same Tags", enabled: false },
  { id: "ai-powered", label: "AI Powered", enabled: false },
];

const layoutOptions = ["Carousel", "Grid", "List"];
const locationOptions = ["Product Page", "Cart Drawer", "Homepage"];
const discountOptions = ["None", "5% OFF", "10% OFF", "Bundle Price"];
const recommendationTypeOptions = [
  { id: "ai-powered", label: "AI Powered" },
  { id: "same-vendor", label: "Same Vendor" },
  { id: "same-product-type", label: "Same Product Type" },
  { id: "same-collection", label: "Same Collection" },
];

export default function RecommendationPage({ params }) {
  const slug = params.slug;
  const config = pageConfig[slug] || {
    title: slug.replace(/-/g, " "),
    description: "Use this section to manage your recommendation settings.",
  };

  const [language, setLanguage] = useState("English");
  const [layout, setLayout] = useState("Carousel");
  const [location, setLocation] = useState("Product Page");
  const [discount, setDiscount] = useState("None");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [activeSection, setActiveSection] = useState("recommendationType");
  const [saved, setSaved] = useState(false);
  const [products, setProducts] = useState(
    defaultProducts.map((product) => ({
      ...product,
      selected: true,
      selectedVariant: product.variantOptions[0],
    })),
  );

  const [selectedProduct, setSelectedProduct] = useState(handpickedProducts[0]);
  const [searchBy, setSearchBy] = useState("title");
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendations, setRecommendations] = useState(
    handpickedProducts.slice(1, 4),
  );
  const [genericRecommendationType, setGenericRecommendationType] = useState(
    slug === "related-products" ? "Smart Rules" : "Manual Selection",
  );
  const [recommendationMode, setRecommendationMode] = useState("automated");
  const [recommendationFilters, setRecommendationFilters] = useState([
    "same-collection",
  ]);
  const [excludePagesText, setExcludePagesText] = useState("homepage");
  const [manualRecommendationsEnabled, setManualRecommendationsEnabled] =
    useState(false);

  const filteredProducts = useMemo(
    () =>
      handpickedProducts
        .filter((product) => product.id !== selectedProduct.id)
        .filter(
          (product) => !recommendations.some((item) => item.id === product.id),
        )
        .filter((product) =>
          product[searchBy].toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    [recommendations, searchBy, searchTerm, selectedProduct],
  );

  const totalPrice = useMemo(
    () =>
      products
        .filter((product) => product.selected)
        .reduce((sum, product) => sum + product.price, 0),
    [products],
  );

  const handleToggleProduct = (id) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? { ...product, selected: !product.selected }
          : product,
      ),
    );
  };

  const handleVariantChange = (id, value) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, selectedVariant: value } : product,
      ),
    );
  };

  const handleAddRecommendation = (product) => {
    setRecommendations((current) => [...current, product]);
  };

  const handleRemoveRecommendation = (id) => {
    setRecommendations((current) => current.filter((item) => item.id !== id));
  };

  const [conditions, setConditions] = useState(relatedConditions);
  const [excludeValues, setExcludeValues] = useState({
    collection: "",
    vendor: "",
    tags: "",
  });
  const [removeOutOfStock, setRemoveOutOfStock] = useState(false);
  const [funnels, setFunnels] = useState([]);
  const [archivedFunnels, setArchivedFunnels] = useState([]);
  const [actionEnabled, setActionEnabled] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const handleToggleCondition = (id) => {
    setConditions((current) =>
      current.map((condition) =>
        condition.id === id
          ? { ...condition, enabled: !condition.enabled }
          : condition,
      ),
    );
  };

  const handleExcludeChange = (field, value) => {
    setExcludeValues((current) => ({ ...current, [field]: value }));
  };

  const handleRemoveOutOfStock = () => {
    setRemoveOutOfStock((current) => !current);
  };

  const handleToggleAction = () => {
    setActionEnabled((current) => !current);
  };

  const handleCreateFunnel = () => {
    setFunnels((current) => [
      ...current,
      {
        id: `funnel-${current.length + 1}`,
        name: `Funnel ${current.length + 1}`,
        status: "Draft",
        createdAt: new Date().toLocaleDateString(),
      },
    ]);
  };

  const handleArchiveFunnel = (id) => {
    setFunnels((current) => {
      const archived = current.find((funnel) => funnel.id === id);
      if (!archived) return current;
      setArchivedFunnels((prev) => [...prev, archived]);
      return current.filter((funnel) => funnel.id !== id);
    });
  };

  const handleToggleArchivedView = () => {
    setShowArchived((current) => !current);
  };

  const toggleSection = (section) => {
    setActiveSection((current) => (current === section ? "" : section));
  };

  const handleRecommendationFilterToggle = (id) => {
    setRecommendationFilters((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  };

  if (slug === "post-purchase-upsell") {
    return (
      <div className="page-section">
        {!actionEnabled ? (
          <div className="warning-banner">
            <div>
              <strong>Action Required</strong>
              <p>
                Please make sure to select "Wiser" in the Shopify Checkout
                Settings under the "Post Purchase page" section. This is a
                mandatory step.
              </p>
            </div>
            <button
              className="button-link"
              type="button"
              onClick={handleToggleAction}
            >
              Enable Setting
            </button>
          </div>
        ) : (
          <div className="info-banner">
            <div>
              <strong>Setup complete</strong>
              <p>Your post purchase funnel is now ready to receive orders.</p>
            </div>
          </div>
        )}

        <div className="funnel-header-card">
          <div>
            <div className="funnel-heading">
              <h2>Funnels</h2>
              <span className="pill">{funnels.length} Entries</span>
            </div>
          </div>
          <div className="funnel-header-actions">
            <button className="button-link" type="button">
              See How to Setup
            </button>
            <button className="button-link" type="button">
              Setup Instructions
            </button>
          </div>
        </div>

        {funnels.length === 0 ? (
          <div className="funnel-empty-card">
            <div className="funnel-empty-illustration" />
            <h3>Create Your First Funnel</h3>
            <p className="small">
              Start by creating a post-purchase funnel to show customers the
              right upsell offer after checkout.
            </p>
            <div className="funnel-empty-actions">
              <button
                className="btn"
                type="button"
                onClick={handleCreateFunnel}
              >
                + Create Funnel
              </button>
              <button
                className="button-link"
                type="button"
                onClick={handleToggleArchivedView}
              >
                View Archive Funnels
              </button>
            </div>
          </div>
        ) : (
          <div className="funnel-list-card">
            <div className="funnel-list-header">
              <span className="small muted">Manage your funnels below.</span>
              <button
                className="button-link"
                type="button"
                onClick={handleCreateFunnel}
              >
                + New Funnel
              </button>
            </div>
            <div className="funnel-list">
              {funnels.map((funnel) => (
                <div key={funnel.id} className="funnel-row">
                  <div>
                    <strong>{funnel.name}</strong>
                    <p className="small muted">Created on {funnel.createdAt}</p>
                  </div>
                  <div className="funnel-row-actions">
                    <span className="pill">{funnel.status}</span>
                    <button
                      className="button-link small-button"
                      type="button"
                      onClick={() => handleArchiveFunnel(funnel.id)}
                    >
                      Archive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showArchived && archivedFunnels.length > 0 ? (
          <div className="funnel-archive-card">
            <div className="funnel-archive-header">
              <h3>Archived Funnels</h3>
              <span className="small muted">
                {archivedFunnels.length} archived
              </span>
            </div>
            <div className="funnel-list">
              {archivedFunnels.map((funnel) => (
                <div key={funnel.id} className="funnel-row">
                  <div>
                    <strong>{funnel.name}</strong>
                    <p className="small muted">Created on {funnel.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (slug === "handpicked-recommendations") {
    return (
      <div className="page-section">
        <div className="handpicked-notice">
          <div>
            <strong>Mandatory Step</strong>
            <p>
              Click{" "}
              <a href="#" className="notice-link">
                here
              </a>{" "}
              to add the app block for Online Store 2.0 theme.
            </p>
          </div>
          <button className="button-link">2.0 Setup Instructions</button>
        </div>

        <div className="recommendations-grid handpicked-grid">
          <div className="settings-panel">
            <div className="section-header">
              <h2>Choose The Product</h2>
            </div>
            <p className="small">
              Choose the product from the search box here to add handpicked
              recommended products in it. After selecting the product, you can
              search for products to be added in its recommended products
              section.
            </p>

            <div className="handpicked-search-row">
              <select
                className="select"
                value={searchBy}
                onChange={(event) => setSearchBy(event.target.value)}
              >
                <option value="title">Search By Product Title</option>
                <option value="vendor">Search By Vendor</option>
              </select>
              <input
                className="input"
                type="text"
                placeholder="Search Product Title"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="handpicked-results">
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <div key={product.id} className="handpicked-result-card">
                    <div>
                      <strong>{product.title}</strong>
                      <p className="small">{product.vendor}</p>
                    </div>
                    <button
                      type="button"
                      className="button-link small-button"
                      onClick={() => handleAddRecommendation(product)}
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <p className="small">
                  No products found. Try a different search term.
                </p>
              )}
            </div>

            <div className="settings-action" style={{ marginTop: 16 }}>
              <button className="button-link" type="button">
                Import CSV
              </button>
              <button className="button-link" type="button">
                How to Setup
              </button>
            </div>
          </div>

          <div className="preview-panel handpicked-preview">
            <div className="handpicked-selection-card">
              <div className="section-header">
                <div>
                  <h2>Selected Product</h2>
                </div>
                <span className="tag">Product Page</span>
              </div>
              <div className="product-item preview-large">
                <img src={selectedProduct.image} alt={selectedProduct.title} />
              </div>
              <div>
                <h3>{selectedProduct.title}</h3>
                <p className="small">{selectedProduct.vendor}</p>
                <p className="product-price">
                  ₹{selectedProduct.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="handpicked-card">
              <div className="section-header">
                <h2>Recommended Products</h2>
                <span>{recommendations.length} selected</span>
              </div>
              <div className="handpicked-recommendation-list">
                {recommendations.map((product) => (
                  <div
                    key={product.id}
                    className="handpicked-recommendation-item"
                  >
                    <div className="handpicked-recommendation-info">
                      <img src={product.image} alt={product.title} />
                      <div>
                        <strong>{product.title}</strong>
                        <p className="small">{product.vendor}</p>
                      </div>
                    </div>
                    <div className="handpicked-recommendation-actions">
                      <span className="product-price">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        className="button-link small-button"
                        onClick={() => handleRemoveRecommendation(product.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="page-header-row">
        <div>
          <h1>{config.title}</h1>
          <p className="small">{config.description}</p>
        </div>
        <div className="language-select">
          <label htmlFor="language">Select Language</label>
          <select
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
      </div>

      <div className="recommendations-grid">
        <div className="settings-panel">
          <div className="section-header">
            <h2>Settings</h2>
            <button className="button-link" type="button">
              How to Setup
            </button>
          </div>

          <div className="settings-list recommendations-accordion">
            <div className="accordion-card recommendation-accordion-card">
              <button
                type="button"
                className={`accordion-header recommendation-accordion-header ${activeSection === "recommendationType" ? "open" : ""}`}
                onClick={() => toggleSection("recommendationType")}
                aria-expanded={activeSection === "recommendationType"}
              >
                <span>Recommendations Type</span>
                <span
                  className={`accordion-icon ${activeSection === "recommendationType" ? "open" : ""}`}
                >
                  &#8250;
                </span>
              </button>
              {activeSection === "recommendationType" ? (
                <div className="accordion-body recommendation-accordion-body">
                  {slug === "frequently-bought-together" ? (
                    <div className="fbt-recommendation-panel">
                      <div className="fbt-mode-list">
                        <label
                          className={`fbt-radio-card disabled ${recommendationMode === "past-orders" ? "active" : ""}`}
                        >
                          <input
                            type="radio"
                            name="recommendationMode"
                            value="past-orders"
                            checked={recommendationMode === "past-orders"}
                            onChange={() =>
                              setRecommendationMode("past-orders")
                            }
                            disabled
                          />
                          <div>
                            <span>Recommendations by Past Orders</span>
                            <small>[Not Sufficient Orders to Process]</small>
                          </div>
                        </label>

                        <label
                          className={`fbt-radio-card ${recommendationMode === "automated" ? "active" : ""}`}
                        >
                          <input
                            type="radio"
                            name="recommendationMode"
                            value="automated"
                            checked={recommendationMode === "automated"}
                            onChange={() => setRecommendationMode("automated")}
                          />
                          <div>
                            <span>Automated Recommendations</span>
                            <small>
                              Let the widget choose products using your selected
                              rules.
                            </small>
                          </div>
                        </label>
                      </div>

                      <div className="fbt-field-group">
                        <label className="fbt-section-label">
                          Select Options
                        </label>
                        <div className="fbt-option-list">
                          {recommendationTypeOptions.map((option) => (
                            <label
                              key={option.id}
                              className={`fbt-option-row ${recommendationFilters.includes(option.id) ? "active" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={recommendationFilters.includes(
                                  option.id,
                                )}
                                onChange={() =>
                                  handleRecommendationFilterToggle(option.id)
                                }
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="fbt-field-group">
                        <label
                          className="fbt-section-label"
                          htmlFor="exclude-pages"
                        >
                          Exclude options
                        </label>
                        <textarea
                          id="exclude-pages"
                          className="textarea fbt-textarea"
                          placeholder="E.g. homepage"
                          value={excludePagesText}
                          onChange={(event) =>
                            setExcludePagesText(event.target.value)
                          }
                        />
                      </div>

                      <label
                        className={`fbt-radio-card ${manualRecommendationsEnabled ? "active" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={manualRecommendationsEnabled}
                          onChange={() =>
                            setManualRecommendationsEnabled(
                              (current) => !current,
                            )
                          }
                        />
                        <div>
                          <span>Handpicked Manual Recommendations</span>
                          <small>
                            Setup manual recommendations from Handpicked
                            Recommendations option.
                          </small>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="accordion-body-stack">
                      <p className="small">
                        Choose how products should be recommended in this
                        widget.
                      </p>
                      <div className="radio-list">
                        {[
                          "Manual Selection",
                          "Smart Rules",
                          "Recently Popular",
                        ].map((option) => (
                          <label key={option} className="radio-item">
                            <input
                              type="radio"
                              name="genericRecommendationType"
                              checked={genericRecommendationType === option}
                              onChange={() =>
                                setGenericRecommendationType(option)
                              }
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="accordion-card recommendation-accordion-card">
              <button
                type="button"
                className={`accordion-header recommendation-accordion-header ${activeSection === "layout" ? "open" : ""}`}
                onClick={() => toggleSection("layout")}
                aria-expanded={activeSection === "layout"}
              >
                <span>Choose Layout</span>
                <span
                  className={`accordion-icon ${activeSection === "layout" ? "open" : ""}`}
                >
                  &#8250;
                </span>
              </button>
              {activeSection === "layout" ? (
                <div className="accordion-body recommendation-accordion-body">
                  <div className="radio-list layout-radio-list">
                    {layoutOptions.map((option) => (
                      <label
                        key={option}
                        className={`radio-item ${layout === option ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="layout"
                          value={option}
                          checked={layout === option}
                          onChange={() => setLayout(option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="accordion-card recommendation-accordion-card">
              <button
                type="button"
                className={`accordion-header recommendation-accordion-header ${activeSection === "location" ? "open" : ""}`}
                onClick={() => toggleSection("location")}
                aria-expanded={activeSection === "location"}
              >
                <span>Widget&apos;s Location</span>
                <span
                  className={`accordion-icon ${activeSection === "location" ? "open" : ""}`}
                >
                  &#8250;
                </span>
              </button>
              {activeSection === "location" ? (
                <div className="accordion-body recommendation-accordion-body">
                  <div className="radio-list">
                    {locationOptions.map((option) => (
                      <label
                        key={option}
                        className={`radio-item ${location === option ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="location"
                          value={option}
                          checked={location === option}
                          onChange={() => setLocation(option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="accordion-card recommendation-accordion-card">
              <button
                type="button"
                className={`accordion-header recommendation-accordion-header ${activeSection === "discount" ? "open" : ""}`}
                onClick={() => toggleSection("discount")}
                aria-expanded={activeSection === "discount"}
              >
                <span>Discounts</span>
                <span
                  className={`accordion-icon ${activeSection === "discount" ? "open" : ""}`}
                >
                  &#8250;
                </span>
              </button>
              {activeSection === "discount" ? (
                <div className="accordion-body recommendation-accordion-body">
                  <div className="radio-list layout-radio-list">
                    {discountOptions.map((option) => (
                      <label
                        key={option}
                        className={`radio-item ${discount === option ? "active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="discount"
                          value={option}
                          checked={discount === option}
                          onChange={() => setDiscount(option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="settings-action">
            <button className="btn" type="button" onClick={handleSave}>
              SAVE
            </button>
          </div>
          {saved ? (
            <p className="small success-text">Settings saved successfully.</p>
          ) : null}
        </div>

        <div className="preview-panel">
          <div className="preview-header">
            <h2>Preview</h2>
            <div className="preview-tabs">
              <button
                type="button"
                className={`preview-tab ${previewMode === "desktop" ? "active" : ""}`}
                onClick={() => setPreviewMode("desktop")}
              >
                Desktop
              </button>
              <button
                type="button"
                className={`preview-tab ${previewMode === "mobile" ? "active" : ""}`}
                onClick={() => setPreviewMode("mobile")}
              >
                Mobile
              </button>
            </div>
          </div>

          <div className="preview-card">
            <h3 className="preview-heading">FREQUENTLY BOUGHT TOGETHER</h3>
            <div className="fbt-preview-layout">
              <div className="fbt-preview-main">
                <div
                  className={`product-stack ${previewMode === "mobile" ? "mobile" : ""}`}
                >
                  {products.map((product, index) => (
                    <div key={product.id} className="product-stack-entry">
                      <div className="product-item">
                        <img src={product.image} alt={product.title} />
                      </div>
                      {index < products.length - 1 ? (
                        <span className="product-plus">+</span>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="fbt-lines">
                  {products.map((product) => (
                    <div key={product.id} className="product-line">
                      <label>
                        <input
                          type="checkbox"
                          checked={product.selected}
                          onChange={() => handleToggleProduct(product.id)}
                        />
                        <div className="product-details">
                          <strong>{product.title}</strong>
                        </div>
                      </label>
                      <select
                        value={product.selectedVariant}
                        onChange={(event) =>
                          handleVariantChange(product.id, event.target.value)
                        }
                      >
                        {product.variantOptions.map((variant) => (
                          <option key={variant} value={variant}>
                            {variant}
                          </option>
                        ))}
                      </select>
                      <div className="product-price">
                        ₹{product.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="total-row total-row-sidebar">
                <strong>Total price: ₹{totalPrice.toFixed(2)}</strong>
                <button type="button" className="add-to-cart">
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

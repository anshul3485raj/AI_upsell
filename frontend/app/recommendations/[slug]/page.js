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
  const [isCreatingFunnel, setIsCreatingFunnel] = useState(false);
  const [funnelStep, setFunnelStep] = useState("conditions");
  const [funnelDraft, setFunnelDraft] = useState({
    name: "",
    allCustomers: false,
    chooseProducts: false,
    chooseCollections: false,
  });

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
    setIsCreatingFunnel(true);
    setFunnelStep("conditions");
    setFunnelDraft({
      name: `Funnel ${funnels.length + 1}`,
      allCustomers: false,
      chooseProducts: false,
      chooseCollections: false,
    });
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

  const handleFunnelDraftChange = (field, value) => {
    setFunnelDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSaveFunnelConditions = () => {
    setFunnels((current) => {
      const draftName = funnelDraft.name.trim() || `Funnel ${current.length + 1}`;
      const existingIndex = current.findIndex(
        (funnel) => funnel.name === draftName && funnel.status === "Draft",
      );

      const nextFunnel = {
        id:
          existingIndex >= 0
            ? current[existingIndex].id
            : `funnel-${current.length + 1}`,
        name: draftName,
        status: "Draft",
        createdAt: new Date().toLocaleDateString(),
      };

      if (existingIndex >= 0) {
        return current.map((funnel, index) =>
          index === existingIndex ? nextFunnel : funnel,
        );
      }

      return [...current, nextFunnel];
    });
    setFunnelStep("products");
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

        {isCreatingFunnel ? (
          <div className="funnel-builder-card">
            <div className="funnel-builder-header">
              <div className="funnel-builder-title-group">
                <h2>New Funnel</h2>
                <span className="funnel-status-pill">Unpublished</span>
              </div>
              <div className="funnel-builder-actions">
                <button
                  className="btn"
                  type="button"
                  onClick={() => setIsCreatingFunnel(false)}
                >
                  Check All Funnels
                </button>
              </div>
            </div>

            <div className="funnel-builder-tabs">
              <button
                type="button"
                className={`funnel-builder-tab ${funnelStep === "conditions" ? "active" : ""}`}
                onClick={() => setFunnelStep("conditions")}
              >
                Select Conditions
              </button>
              <button
                type="button"
                className={`funnel-builder-tab ${funnelStep === "products" ? "active" : ""}`}
                onClick={() => setFunnelStep("products")}
              >
                Select Products to Upsell
              </button>
            </div>

            {funnelStep === "conditions" ? (
              <div className="funnel-builder-body">
                <div className="funnel-field-block">
                  <label htmlFor="funnel-name">Add Funnel Name</label>
                  <input
                    id="funnel-name"
                    className="input"
                    type="text"
                    placeholder="Funnel Name"
                    value={funnelDraft.name}
                    onChange={(event) =>
                      handleFunnelDraftChange("name", event.target.value)
                    }
                  />
                </div>

                <div className="funnel-field-block">
                  <h3>Select Conditions</h3>
                  <p className="small">
                    Select the conditions below for the offer you want to show
                    to your customers.
                  </p>
                  <label
                    className={`funnel-condition-card ${funnelDraft.allCustomers ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={funnelDraft.allCustomers}
                      onChange={(event) =>
                        handleFunnelDraftChange(
                          "allCustomers",
                          event.target.checked,
                        )
                      }
                    />
                    <span>Show This Funnel For All Customers</span>
                  </label>
                </div>

                <div className="funnel-or-divider">
                  <span>OR</span>
                </div>

                <div className="funnel-condition-grid">
                  <label
                    className={`funnel-condition-card ${funnelDraft.chooseProducts ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={funnelDraft.chooseProducts}
                      onChange={(event) =>
                        handleFunnelDraftChange(
                          "chooseProducts",
                          event.target.checked,
                        )
                      }
                    />
                    <span>Choose Products</span>
                  </label>

                  <label
                    className={`funnel-condition-card ${funnelDraft.chooseCollections ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={funnelDraft.chooseCollections}
                      onChange={(event) =>
                        handleFunnelDraftChange(
                          "chooseCollections",
                          event.target.checked,
                        )
                      }
                    />
                    <span>Choose Collections</span>
                  </label>
                </div>

                <div className="funnel-builder-actions">
                  <button
                    className="btn"
                    type="button"
                    onClick={handleSaveFunnelConditions}
                  >
                    Save &amp; Next
                  </button>
                </div>
              </div>
            ) : (
              <div className="funnel-builder-body">
                <div className="funnel-products-toolbar">
                  <div>
                    <h3>Select Products to Upsell</h3>
                    <p className="small">
                      Choose products that should appear in this post-purchase
                      funnel.
                    </p>
                  </div>
                  <input
                    className="input funnel-search-input"
                    type="text"
                    placeholder="Search products"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                <div className="funnel-products-layout">
                  <div className="funnel-product-catalog">
                    {handpickedProducts
                      .filter((product) =>
                        product.title
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                      )
                      .map((product) => {
                        const isSelected = recommendations.some(
                          (item) => item.id === product.id,
                        );

                        return (
                          <div
                            key={product.id}
                            className={`funnel-product-card ${isSelected ? "selected" : ""}`}
                          >
                            <img src={product.image} alt={product.title} />
                            <div className="funnel-product-info">
                              <strong>{product.title}</strong>
                              <span>{product.vendor}</span>
                              <small>&#8377;{product.price.toFixed(2)}</small>
                            </div>
                            <button
                              type="button"
                              className="button-link"
                              onClick={() =>
                                isSelected
                                  ? handleRemoveRecommendation(product.id)
                                  : handleAddRecommendation(product)
                              }
                            >
                              {isSelected ? "Remove" : "Add"}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  <div className="funnel-selection-summary">
                    <div className="funnel-summary-card">
                      <h4>{funnelDraft.name || "New Funnel"}</h4>
                      <div className="funnel-summary-line">
                        <span>Status</span>
                        <strong>Unpublished</strong>
                      </div>
                      <div className="funnel-summary-line">
                        <span>Conditions</span>
                        <strong>
                          {[
                            funnelDraft.allCustomers && "All Customers",
                            funnelDraft.chooseProducts && "Products",
                            funnelDraft.chooseCollections && "Collections",
                          ]
                            .filter(Boolean)
                            .join(", ") || "None"}
                        </strong>
                      </div>
                    </div>

                    <div className="funnel-summary-card">
                      <h4>Selected Products</h4>
                      <div className="funnel-summary-products">
                        {recommendations.map((product) => (
                          <div
                            key={product.id}
                            className="funnel-summary-product"
                          >
                            <img src={product.image} alt={product.title} />
                            <div>
                              <strong>{product.title}</strong>
                              <span>&#8377;{product.price.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="small funnel-builder-message">
                  Your funnel conditions are saved. Now select the products you
                  want to upsell after checkout.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {!isCreatingFunnel && funnels.length === 0 ? (
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
        ) : null}

        {!isCreatingFunnel && funnels.length > 0 ? (
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
        ) : null}

        {!isCreatingFunnel && showArchived && archivedFunnels.length > 0 ? (
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

  if (slug === "related-products") {
    return (
      <div className="page-section related-products-page">
        <div className="related-top-banner">
          <div>
            <div className="related-top-banner-title">Mandatory Step</div>
            <p className="related-top-banner-copy">Install widget to your theme.</p>
          </div>
          <div className="related-top-banner-actions">
            <button className="btn" type="button">
              Install Widget
            </button>
            <button className="button-link" type="button">
              Setup Instructions
            </button>
          </div>
        </div>

        <div className="related-layout">
          <div className="related-layout-copy">
            <h2>Select Conditions</h2>
            <p>
              Select the conditions to show related products. You can choose any
              of these conditions or all at once, priority will be decided as
              per the order of conditions below.
            </p>
          </div>

          <div className="related-settings-card">
            <div className="related-toggle-list">
              {conditions.map((condition) => (
                <div
                  key={condition.id}
                  className={`related-toggle-row ${condition.enabled ? "enabled" : ""}`}
                >
                  <div className="related-toggle-label">
                    <span className="related-grip" aria-hidden="true" />
                    <strong>{condition.label}</strong>
                  </div>
                  <button
                    type="button"
                    className={`related-switch ${condition.enabled ? "active" : ""}`}
                    onClick={() => handleToggleCondition(condition.id)}
                    aria-pressed={condition.enabled}
                    aria-label={`Toggle ${condition.label}`}
                  >
                    <span className="related-switch-thumb" />
                  </button>
                </div>
              ))}
            </div>

            <div className="related-exclusion-panel">
              <label htmlFor="related-exclude-values">
                Exclude options (Only comma separated values)
              </label>
              <p className="small related-example-text">
                You can exclude the particular collection(add only handle name),
                vendor, tags &amp; product type, from which you do not want to
                show products if you have assigned multiple collections or tags
                in the products.
              </p>
              <p className="small related-example-text">
                E.g. homepage, frontpage, best-sellers, all
              </p>
              <textarea
                id="related-exclude-values"
                className="textarea related-exclusion-input"
                placeholder="E.g. homepage"
                value={excludePagesText}
                onChange={(event) => setExcludePagesText(event.target.value)}
              />
            </div>

            <div className="related-exclusion-footer">
              <div className="small">
                Active conditions:{" "}
                {conditions.filter((condition) => condition.enabled).length}
              </div>
              <button
                className="btn related-save-button"
                type="button"
                onClick={handleSave}
              >
                Save
              </button>
            </div>

            {saved ? (
              <p className="small success-text">Settings saved successfully.</p>
            ) : null}
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

          <div
            className={`preview-card ${previewMode === "mobile" ? "mobile-preview-mode" : ""}`}
          >
            {previewMode === "mobile" ? (
              <div className="mobile-preview-shell">
                <div className="mobile-preview-frame">
                  <div className="mobile-preview-content">
                    <h3 className="preview-heading mobile-preview-heading">
                      FREQUENTLY BOUGHT TOGETHER
                    </h3>

                    <div className="mobile-preview-summary-card">
                      <div className="product-stack mobile">
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

                      <div className="mobile-total-block">
                        <strong>Total price: &#8377;{totalPrice.toFixed(2)}</strong>
                        <button
                          type="button"
                          className="add-to-cart mobile-add-to-cart"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>

                    <div className="mobile-product-list">
                      {products.map((product) => (
                        <div key={product.id} className="mobile-product-row">
                          <div className="mobile-product-top">
                            <label className="mobile-product-label">
                              <input
                                type="checkbox"
                                checked={product.selected}
                                onChange={() => handleToggleProduct(product.id)}
                              />
                              <strong>{product.title}</strong>
                            </label>
                            <select
                              value={product.selectedVariant}
                              onChange={(event) =>
                                handleVariantChange(
                                  product.id,
                                  event.target.value,
                                )
                              }
                            >
                              {product.variantOptions.map((variant) => (
                                <option key={variant} value={variant}>
                                  {variant}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="product-price">
                            &#8377;{product.price.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (

            <div className="fbt-preview-layout">
              <div className="fbt-preview-main">
                <h3 className="preview-heading">Frequently Bought Together</h3>

                <div className="product-stack">
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
                        &#8377;{product.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="total-row total-row-sidebar">
                <strong>Total price: &#8377;{totalPrice.toFixed(2)}</strong>
                <button type="button" className="add-to-cart">
                  Add to cart
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

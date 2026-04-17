"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthenticatedFetch } from "../../../hooks/useAuthenticatedFetch";

const widgetOptions = [
  "Select Widgets",
  "New Arrival",
  "AI Based Recommendations",
  "Related Products",
  "Handpicked Manual Recommendations",
  "Recently Viewed",
  "Fixed Selection",
];

const layoutOptions = ["List", "Grid"];
const totalProductsOptions = ["2", "4", "6", "8"];
const headingAlignOptions = ["left", "center", "right"];
const priceLabels = ["$10", "$25", "$50", "$100"];

const fallbackProducts = [
  {
    id: "fallback-1",
    title: "Gift Card",
    featuredImageUrl: "https://via.placeholder.com/320?text=Gift+Card",
    price: 10.0,
    discountPrice: 10.0,
  },
  {
    id: "fallback-2",
    title: "Pearl Dusk",
    featuredImageUrl: "https://via.placeholder.com/320?text=Pearl+Dusk",
    price: 949.95,
    discountPrice: 1200.0,
  },
  {
    id: "fallback-3",
    title: "Velvet Bloom",
    featuredImageUrl: "https://via.placeholder.com/320?text=Velvet+Bloom",
    price: 699.95,
    discountPrice: 699.95,
  },
  {
    id: "fallback-4",
    title: "Blush Aura",
    featuredImageUrl: "https://via.placeholder.com/320?text=Blush+Aura",
    price: 1200.0,
    discountPrice: 1500.0,
  },
];

export default function ProductAddonsPage() {
  const { apiFetch, isReady } = useAuthenticatedFetch();
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedWidget, setSelectedWidget] = useState(widgetOptions[0]);
  const [selectedLayout, setSelectedLayout] = useState(layoutOptions[0]);
  const [selectedTotalProducts, setSelectedTotalProducts] = useState(totalProductsOptions[1]);
  const [selectedPrice, setSelectedPrice] = useState(priceLabels[0]);
  const [selectedAddon, setSelectedAddon] = useState("New Arrival");
  const [headingText, setHeadingText] = useState("New Arrivals");
  const [headingFontSize, setHeadingFontSize] = useState("18");
  const [headingAlign, setHeadingAlign] = useState("center");
  const [headingColor, setHeadingColor] = useState("#000000");
  const [titleColor, setTitleColor] = useState("#000000");
  const [showPrice, setShowPrice] = useState(true);
  const [priceColor, setPriceColor] = useState("#000000");
  const [showComparePrice, setShowComparePrice] = useState(true);
  const [comparePriceColor, setComparePriceColor] = useState("#FF5C5C");
  const [showVariant, setShowVariant] = useState(true);
  const [showTotalPrice, setShowTotalPrice] = useState(false);
  const [totalPriceText, setTotalPriceText] = useState("Total Price");
  const [totalPriceColor, setTotalPriceColor] = useState("#000000");
  const [totalComparePriceColor, setTotalComparePriceColor] = useState("#FF5C5C");
  const [customCss, setCustomCss] = useState(".addon-card { border-color: #f5e7ff; }");
  const [activeSection, setActiveSection] = useState("");

  const toggleSection = (section) => {
    setActiveSection((current) => (current === section ? "" : section));
  };

  useEffect(() => {
    if (!isReady) return;

    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch(`/shop/products?limit=8`);
        if (Array.isArray(data) && data.length > 0) {
          setProducts(
            data.map((product) => ({
              id: product.id,
              title: product.title,
              featuredImageUrl: product.featuredImageUrl || "https://via.placeholder.com/320?text=Product",
              price: product.price ?? 0,
              discountPrice: product.price ?? 0,
            })),
          );
        } else {
          setProducts(fallbackProducts);
          setError("Shopify products are not available. Showing fallback preview products.");
        }
      } catch (err) {
        console.error(err);
        setProducts(fallbackProducts);
        setError("Unable to load Shopify products. Showing fallback preview products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [apiFetch, isReady]);

  const previewProducts = useMemo(
    () => products.slice(0, Number(selectedTotalProducts)),
    [products, selectedTotalProducts],
  );

  return (
    <div className="page-section product-addons-layout">
      <div className="surface section-header">
        <div>
          <p className="overline">Product Addons</p>
          <h1>Product Addons</h1>
        </div>
      </div>

      <div className="product-addons-grid">
        <aside className="addons-sidebar">
          <div className="addons-panel">
            <div className="addons-panel-header">
              <h2>Addon Settings</h2>
              <button type="button" className="btn secondary">Enable</button>
            </div>

            <div className="product-addons-accordion">
              <div className="accordion-card">
                <button
                  type="button"
                  className={`accordion-header ${activeSection === "selectWidgets" ? "open" : ""}`}
                  onClick={() => toggleSection("selectWidgets")}
                >
                  <span>Select Widgets</span>
                  <span className={`accordion-icon ${activeSection === "selectWidgets" ? "open" : ""}`}>&#8250;</span>
                </button>
                {activeSection === "selectWidgets" && (
                  <div className="accordion-body">
                    <label className="field-group">
                      <span>Choose a widget</span>
                      <select className="select" value={selectedWidget} onChange={(event) => setSelectedWidget(event.target.value)}>
                        {widgetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="radio-list">
                      {widgetOptions.slice(1).map((option) => (
                        <label key={option} className="radio-item">
                          <input
                            type="radio"
                            name="addonType"
                            value={option}
                            checked={selectedAddon === option}
                            onChange={() => setSelectedAddon(option)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="accordion-card">
                <button
                  type="button"
                  className={`accordion-header ${activeSection === "chooseLayout" ? "open" : ""}`}
                  onClick={() => toggleSection("chooseLayout")}
                >
                  <span>Choose Layout</span>
                  <span className={`accordion-icon ${activeSection === "chooseLayout" ? "open" : ""}`}>&#8250;</span>
                </button>
                {activeSection === "chooseLayout" && (
                  <div className="accordion-body">
                    <div className="radio-list layout-radio-list">
                      {layoutOptions.map((option) => (
                        <label key={option} className={`radio-item ${selectedLayout === option ? "active" : ""}`}>
                          <input
                            type="radio"
                            name="layoutDisplay"
                            value={option}
                            checked={selectedLayout === option}
                            onChange={() => setSelectedLayout(option)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                    <label className="field-group">
                      <span>Total No. of Products</span>
                      <select className="select" value={selectedTotalProducts} onChange={(event) => setSelectedTotalProducts(event.target.value)}>
                        {totalProductsOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>

              <div className="accordion-card">
                <button
                  type="button"
                  className={`accordion-header ${activeSection === "styling" ? "open" : ""}`}
                  onClick={() => toggleSection("styling")}
                >
                  <span>Styling</span>
                  <span className={`accordion-icon ${activeSection === "styling" ? "open" : ""}`}>&#8250;</span>
                </button>
                {activeSection === "styling" && (
                  <div className="accordion-body">
                    <label className="field-group">
                      <span>Heading</span>
                      <input
                        type="text"
                        className="text-input"
                        value={headingText}
                        onChange={(event) => setHeadingText(event.target.value)}
                      />
                    </label>
                    <div className="field-grid">
                      <label className="field-group">
                        <span>Heading Font Size (in px)</span>
                        <input
                          type="number"
                          className="text-input"
                          min="12"
                          max="48"
                          value={headingFontSize}
                          onChange={(event) => setHeadingFontSize(event.target.value)}
                        />
                      </label>
                      <label className="field-group">
                        <span>Heading Text Align</span>
                        <select
                          className="select"
                          value={headingAlign}
                          onChange={(event) => setHeadingAlign(event.target.value)}
                        >
                          {headingAlignOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="field-group">
                      <span>Heading Color</span>
                      <input
                        type="color"
                        className="color-input"
                        value={headingColor}
                        onChange={(event) => setHeadingColor(event.target.value)}
                      />
                    </label>
                    <label className="field-group">
                      <span>Title Color</span>
                      <input
                        type="color"
                        className="color-input"
                        value={titleColor}
                        onChange={(event) => setTitleColor(event.target.value)}
                      />
                    </label>
                    <div className="toggle-row">
                      <span>Show Price</span>
                      <button
                        type="button"
                        className={`toggle-button ${showPrice ? "active" : ""}`}
                        onClick={() => setShowPrice((current) => !current)}
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>
                    <label className="field-group">
                      <span>Price Color</span>
                      <input
                        type="color"
                        className="color-input"
                        value={priceColor}
                        onChange={(event) => setPriceColor(event.target.value)}
                      />
                    </label>
                    <div className="toggle-row">
                      <span>Show Compare Price</span>
                      <button
                        type="button"
                        className={`toggle-button ${showComparePrice ? "active" : ""}`}
                        onClick={() => setShowComparePrice((current) => !current)}
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>
                    <label className="field-group">
                      <span>Compare Price Color</span>
                      <input
                        type="color"
                        className="color-input"
                        value={comparePriceColor}
                        onChange={(event) => setComparePriceColor(event.target.value)}
                      />
                    </label>
                    <div className="toggle-row">
                      <span>Show Variant</span>
                      <button
                        type="button"
                        className={`toggle-button ${showVariant ? "active" : ""}`}
                        onClick={() => setShowVariant((current) => !current)}
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>
                    <div className="toggle-row">
                      <span>Show Total Price</span>
                      <button
                        type="button"
                        className={`toggle-button ${showTotalPrice ? "active" : ""}`}
                        onClick={() => setShowTotalPrice((current) => !current)}
                      >
                        <span className="toggle-knob" />
                      </button>
                    </div>
                    <label className="field-group">
                      <span>Total Price Text</span>
                      <input
                        type="text"
                        className="text-input"
                        value={totalPriceText}
                        onChange={(event) => setTotalPriceText(event.target.value)}
                      />
                    </label>
                    <label className="field-group">
                      <span>Total Price Color</span>
                      <input
                        type="color"
                        className="color-input"
                        value={totalPriceColor}
                        onChange={(event) => setTotalPriceColor(event.target.value)}
                      />
                    </label>
                    <label className="field-group">
                      <span>Total Compare Price Color</span>
                      <input
                        type="color"
                        className="color-input"
                        value={totalComparePriceColor}
                        onChange={(event) => setTotalComparePriceColor(event.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="accordion-card">
                <button
                  type="button"
                  className={`accordion-header ${activeSection === "customCss" ? "open" : ""}`}
                  onClick={() => toggleSection("customCss")}
                >
                  <span>Add Custom CSS</span>
                  <span className={`accordion-icon ${activeSection === "customCss" ? "open" : ""}`}>&#8250;</span>
                </button>
                {activeSection === "customCss" && (
                  <div className="accordion-body">
                    <label className="field-group">
                      <span>Custom CSS</span>
                      <textarea
                        className="text-input custom-css-input"
                        value={customCss}
                        onChange={(event) => setCustomCss(event.target.value)}
                        rows={6}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <button type="button" className="btn save-btn">SAVE</button>
          </div>
        </aside>

        <main className="addons-preview-panel">
          <div className="addons-preview-header">
            <h2>Preview</h2>
            <div className="preview-actions">
              <button className="icon-button">🖥️</button>
              <button className="icon-button">📱</button>
              <button className="icon-button">⛶</button>
            </div>
          </div>

          <div className="preview-heading" style={{ textAlign: headingAlign }}>
            <h3 style={{ fontSize: `${headingFontSize}px`, color: headingColor }}>{headingText}</h3>
          </div>

          {error && <div className="warning-banner">{error}</div>}
          {loading && <div className="small">Loading products...</div>}

          <div className="preview-product-list">
            {previewProducts.map((product) => (
              <div key={product.id} className="addon-card">
                <div className="addon-card-left">
                  <input type="checkbox" />
                  <div
                    className="addon-image"
                    style={{ backgroundImage: `url(${product.featuredImageUrl})` }}
                  />
                </div>
                <div className="addon-card-body">
                <div className="addon-card-row">
                  <strong style={{ color: titleColor }}>{product.title}</strong>
                  {showPrice && (
                    <span className="addon-price" style={{ color: priceColor }}>${product.price?.toFixed(2) ?? "0.00"}</span>
                  )}
                </div>
                {showComparePrice && (
                  <div className="compare-price" style={{ color: comparePriceColor }}>
                    Compare ${product.discountPrice?.toFixed(2) ?? "0.00"}
                  </div>
                )}
                {showVariant && (
                  <div className="addon-card-row addon-select-row">
                    <select className="select small-select" value={selectedPrice} onChange={(event) => setSelectedPrice(event.target.value)}>
                      {priceLabels.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {showTotalPrice && (
                  <div className="total-price-row" style={{ color: totalPriceColor }}>
                    {totalPriceText}: ${(product.price ?? 0).toFixed(2)}
                  </div>
                )}
              </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

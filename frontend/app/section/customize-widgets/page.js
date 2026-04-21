"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthenticatedFetch } from "../../../hooks/useAuthenticatedFetch";

const panels = [
  { key: "layout", label: "Widget's Layout" },
  { key: "heading", label: "Heading" },
  { key: "title", label: "Product Title" },
  { key: "button", label: "Add To Cart Button" },
  { key: "price", label: "Price" },
  { key: "image", label: "Product Image" },
  { key: "reviews", label: "Product Reviews" },
  { key: "currency", label: "Currency Convertor" },
  { key: "stock", label: "Out of Stock Settings" },
  { key: "wishlist", label: "Wishlist Settings" },
  { key: "css", label: "Add Custom CSS" },
];

export default function CustomizeWidgetsPage() {
  const { apiFetch, isReady } = useAuthenticatedFetch();
  const [activePanel, setActivePanel] = useState("");
  const [heading, setHeading] = useState("You May Also Like");
  const [buttonText, setButtonText] = useState("ADD TO CART +");
  const [showPrice, setShowPrice] = useState(true);
  const [showImage, setShowImage] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [currency, setCurrency] = useState("₹");
  const [stockMessage, setStockMessage] = useState("In stock");
  const [headingAlignment, setHeadingAlignment] = useState("left");
  const [headingFontSize, setHeadingFontSize] = useState(22);
  const [headingColor, setHeadingColor] = useState("#000000");
  const [customCss, setCustomCss] = useState(".product-card { border-color: #d4c5ff; }");
  const [layoutType, setLayoutType] = useState("slider");
  const [templateType, setTemplateType] = useState("template2");
  const [totalProducts, setTotalProducts] = useState(15);
  const [productsPerRow, setProductsPerRow] = useState(4);

  const fallbackProducts = [
    {
      id: "fallback-1",
      title: "Velvet Bloom",
      featuredImageUrl: "https://via.placeholder.com/400?text=Velvet+Bloom",
      price: 699.95,
    },
    {
      id: "fallback-2",
      title: "Blush Aura",
      featuredImageUrl: "https://via.placeholder.com/400?text=Blush+Aura",
      price: 1299.0,
    },
    {
      id: "fallback-3",
      title: "Gift Card",
      featuredImageUrl: "https://via.placeholder.com/400?text=Gift+Card",
      price: 499.0,
    },
  ];

  const [products, setProducts] = useState(fallbackProducts);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");

  const isUsingFallbackData = products.length > 0 && String(products[0].id).startsWith("fallback-");

  useEffect(() => {
    if (!isReady) return;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      setProductError("");

      try {
        const data = await apiFetch(`/shop/products?limit=12`);
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (error) {
        console.error(error);
        setProductError("Unable to load Shopify products.");
        setProducts(fallbackProducts);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [apiFetch, isReady]);

  const previewProducts = useMemo(() => {
    return products.slice(0, Math.min(totalProducts || 4, 15));
  }, [products, totalProducts]);

  return (
    <div className="page-section customize-widgets-layout">
      <div className="surface section-header">
        <div>
          <p className="overline">Customize Widgets</p>
          <h1>Customize Widgets</h1>
        </div>
      </div>

      <div className="customize-grid">
        <aside className="customize-sidebar">
          <div className="settings-card">
            <div className="settings-card-header">
              <h2>Settings</h2>
            </div>
          </div>
          <div className="settings-menu">

            {/* ✅ NEW: Widget Layout Accordion */}
            <div>
              <button
                type="button"
                className={activePanel === "layout" ? "settings-menu-item active" : "settings-menu-item"}
                onClick={() =>
                  setActivePanel(activePanel === "layout" ? "" : "layout")
                }
              >
                <span>Widget's Layout</span>
                <span className="settings-chevron">
                  {activePanel === "layout" ? "−" : "›"}
                </span>
              </button>

              {activePanel === "layout" && (
                <div className="panel-detail-card">

                  <div className="settings-group">
                    <div className="settings-label">Desktop View</div>
                    <div className="radio-row">
                      <label className={layoutType === "grid" ? "radio-option selected" : "radio-option"}>
                        <input
                          type="radio"
                          checked={layoutType === "grid"}
                          onChange={() => setLayoutType("grid")}
                        />
                        Grid
                      </label>

                      <label className={layoutType === "slider" ? "radio-option selected" : "radio-option"}>
                        <input
                          type="radio"
                          checked={layoutType === "slider"}
                          onChange={() => setLayoutType("slider")}
                        />
                        Slider
                      </label>
                    </div>
                  </div>

                  <div className="settings-group">
                    <div className="settings-label">Choose Template</div>
                    <div className="radio-row">
                      <label className={templateType === "template1" ? "radio-option selected" : "radio-option"}>
                        <input
                          type="radio"
                          checked={templateType === "template1"}
                          onChange={() => setTemplateType("template1")}
                        />
                        Template1
                      </label>

                      <label className={templateType === "template2" ? "radio-option selected" : "radio-option"}>
                        <input
                          type="radio"
                          checked={templateType === "template2"}
                          onChange={() => setTemplateType("template2")}
                        />
                        Template2
                      </label>
                    </div>
                  </div>

                  <div className="settings-group">
                    <label>
                      <span className="settings-label">Total Number Of Products (Max 15 Products)</span>
                      <input
                        type="number"
                        className="input"
                        min={1}
                        max={15}
                        value={totalProducts}
                        onChange={(event) => setTotalProducts(Number(event.target.value))}
                      />
                    </label>
                  </div>

                  <div className="settings-group">
                    <label>
                      <span className="settings-label">Number Of Products Per Row</span>
                      <input
                        type="number"
                        className="input"
                        min={1}
                        max={5}
                        value={productsPerRow}
                        onChange={(event) => setProductsPerRow(Number(event.target.value))}
                      />
                    </label>
                  </div>

                </div>
              )}
            </div>

            {/* ✅ YOUR EXISTING PANELS (UNCHANGED) */}
            {panels.slice(1).map((panel) => (
              <div key={panel.key}>

                <button
                  type="button"
                  className={activePanel === panel.key ? "settings-menu-item active" : "settings-menu-item"}
                  onClick={() =>
                    setActivePanel(activePanel === panel.key ? "" : panel.key)
                  }
                >
                  <span>{panel.label}</span>
                  <span className="settings-chevron">
                    {activePanel === panel.key ? "−" : "›"}
                  </span>
                </button>

                {activePanel === panel.key && (
                  <div className="panel-detail-card">
                    <div className="panel-detail-header">
                      <h3>{panel.label}</h3>
                    </div>

                    {/* 👇 ALL YOUR ORIGINAL CONTENT SAME */}

                    {panel.key === "heading" && (
                      <div className="settings-group">
                        <label>
                          <span>Section title</span>
                          <input
                            className="input"
                            value={heading}
                            onChange={(event) => setHeading(event.target.value)}
                          />
                        </label>

                        <label>
                          <span>Alignment</span>
                          <select
                            className="select"
                            value={headingAlignment}
                            onChange={(event) => setHeadingAlignment(event.target.value)}
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </label>

                        <label>
                          <span>Font Size (px)</span>
                          <input
                            type="number"
                            className="input"
                            min={16}
                            max={48}
                            value={headingFontSize}
                            onChange={(event) =>
                              setHeadingFontSize(Number(event.target.value))
                            }
                          />
                        </label>

                        <label>
                          <span>Color</span>
                          <input
                            type="color"
                            className="input"
                            value={headingColor}
                            onChange={(event) => setHeadingColor(event.target.value)}
                          />
                        </label>
                      </div>
                    )}

                    {panel.key === "title" && (
                      <label className="checkbox-row">
                        <span>Show product title</span>
                        <input type="checkbox" defaultChecked />
                      </label>
                    )}

                    {panel.key === "button" && (
                      <label>
                        <span>Button text</span>
                        <input
                          className="input"
                          value={buttonText}
                          onChange={(event) => setButtonText(event.target.value)}
                        />
                      </label>
                    )}

                    {panel.key === "price" && (
                      <label className="checkbox-row">
                        <span>Show price</span>
                        <input
                          type="checkbox"
                          checked={showPrice}
                          onChange={() => setShowPrice((c) => !c)}
                        />
                      </label>
                    )}

                    {panel.key === "image" && (
                      <label className="checkbox-row">
                        <span>Show product image</span>
                        <input
                          type="checkbox"
                          checked={showImage}
                          onChange={() => setShowImage((c) => !c)}
                        />
                      </label>
                    )}

                    {panel.key === "reviews" && (
                      <label className="checkbox-row">
                        <span>Show product reviews</span>
                        <input
                          type="checkbox"
                          checked={showReviews}
                          onChange={() => setShowReviews((c) => !c)}
                        />
                      </label>
                    )}

                    {panel.key === "currency" && (
                      <label>
                        <span>Currency symbol</span>
                        <input
                          className="input"
                          value={currency}
                          onChange={(event) => setCurrency(event.target.value)}
                        />
                      </label>
                    )}

                    {panel.key === "stock" && (
                      <label>
                        <span>Stock message</span>
                        <input
                          className="input"
                          value={stockMessage}
                          onChange={(event) => setStockMessage(event.target.value)}
                        />
                      </label>
                    )}

                    {panel.key === "wishlist" && (
                      <label className="checkbox-row">
                        <span>Show wishlist button</span>
                        <input type="checkbox" defaultChecked={false} />
                      </label>
                    )}

                    {panel.key === "css" && (
                      <label>
                        <span>Custom CSS</span>
                        <textarea
                          className="textarea"
                          value={customCss}
                          onChange={(event) => setCustomCss(event.target.value)}
                          rows={5}
                        />
                      </label>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        <main className="widget-preview-panel">
          <div className="widget-preview-bar">
            <h2
              style={{
                textAlign: headingAlignment,
                fontSize: `${headingFontSize}px`,
                color: headingColor,
                width: "100%",
              }}
            >
              {heading}
            </h2>
          </div>

          <div className={layoutType === "slider" ? "product-slider" : `product-grid product-cols-${productsPerRow}`}>
            {loadingProducts && <div className="small">Loading products...</div>}
            {productError && <div className="warning-banner">{productError}</div>}
            {!loadingProducts && isUsingFallbackData && !productError && (
              <div className="warning-banner">Shopify products are not available yet. Showing fallback preview products.</div>
            )}

            {previewProducts.map((product) => (
              <article key={product.id} className={`product-card ${templateType}`}>
                {showImage && (
                  <div
                    className="product-image"
                    style={{
                      backgroundImage: `url(${product.featuredImageUrl || "https://via.placeholder.com/400?text=No+Image"})`,
                    }}
                  />
                )}
                <strong>{product.title}</strong>
                {showPrice && (
                  <div className="product-price">
                    {currency}
                    {product.price?.toFixed(2) ?? "0.00"}
                  </div>
                )}
                {showReviews && <div className="product-review">★ 4.8 (120)</div>}
                {stockMessage && <div className="stock-message">{stockMessage}</div>}
                <button className="btn product-button">{buttonText}</button>
              </article>
            ))}
          </div>

          <div className="widget-preview-note">
            You have selected more than {totalProducts} products; your actual changes will reflect on your shop front end.
          </div>
        </main>
      </div>
    </div>
  );
}

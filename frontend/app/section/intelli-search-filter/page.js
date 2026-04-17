"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthenticatedFetch } from "../../../hooks/useAuthenticatedFetch";

const tabs = [
  { key: "dashboard", label: "Dashboard" },
  { key: "quick-search-view", label: "Quick Search View" },
  { key: "search-listing-page", label: "Search Listing Page" },
  { key: "search-settings", label: "Search Settings" },
  { key: "setup-instructions", label: "Setup Instructions" },
];

const fallbackProducts = [
  {
    id: "fallback-1",
    title: "Velvet Bloom Perfume",
    handle: "velvet-bloom",
    featuredImageUrl: "https://via.placeholder.com/400?text=Velvet+Bloom",
    price: 699.95,
  },
  {
    id: "fallback-2",
    title: "Blush Aura Fragrance",
    handle: "blush-aura",
    featuredImageUrl: "https://via.placeholder.com/400?text=Blush+Aura",
    price: 1299.0,
  },
  {
    id: "fallback-3",
    title: "Rose Gift Card",
    handle: "rose-gift-card",
    featuredImageUrl: "https://via.placeholder.com/400?text=Gift+Card",
    price: 499.0,
  },
  {
    id: "fallback-4",
    title: "Silk Body Lotion",
    handle: "silk-body-lotion",
    featuredImageUrl: "https://via.placeholder.com/400?text=Body+Lotion",
    price: 899.0,
  },
  {
    id: "fallback-5",
    title: "Golden Candle Set",
    handle: "golden-candle-set",
    featuredImageUrl: "https://via.placeholder.com/400?text=Candle+Set",
    price: 1199.0,
  },
];

const initialSearchSuggestions = [
  { term: "perfume", count: 12 },
  { term: "gift", count: 9 },
  { term: "lotion", count: 7 },
];

const filterItems = [
  { label: "Trending", count: 14 },
  { label: "Best Seller", count: 8 },
  { label: "New Arrival", count: 5 },
  { label: "Discount", count: 11 },
];

export default function IntelliSearchFilterPage() {
  const { apiFetch, isReady } = useAuthenticatedFetch();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("perfume");
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState(initialSearchSuggestions);

  useEffect(() => {
    if (!isReady) return;

    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch(`/shop/products?limit=12`);
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          setSearchSuggestions([
            { term: "perfume", count: 12 },
            { term: "gift", count: 9 },
            { term: "candle", count: 6 },
          ]);
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

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }
    return products.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.handle?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  const overview = useMemo(() => {
    const totalRevenue = filteredProducts.reduce((sum, product) => sum + (product.price || 0), 0);
    const orderCount = Math.max(1, filteredProducts.length * 3);
    return {
      revenue: totalRevenue,
      orders: orderCount,
      avgOrderValue: totalRevenue / orderCount,
      clicks: filteredProducts.length * 16,
    };
  }, [filteredProducts]);

  const topProducts = filteredProducts.slice(0, 5).map((product, index) => ({
    ...product,
    orderId: `ORD-${8400 + index}`,
    quantity: Math.floor(Math.random() * 4) + 1,
    orderDate: `Apr ${17 - index}, 2026`,
  }));

  const recommendedCollections = ["Collection1", "Collection2", "Collection3"];
  const previousSearchHistory = ["Search History1", "Search History2", "Search History3"];
  const trendingSearchTerms = ["Trending Search Term1", "Trending Search Term2", "Trending Search Term3"];
  const listingFilterGroups = [
    {
      title: "Filters",
      items: ["Price", "Brand", "Material", "Size", "Vendor"],
    },
    {
      title: "Sort by",
      items: ["Relevance", "Price low to high", "Price high to low", "Newest"],
    },
  ];
  const listingCategories = [
    "Price",
    "Binding Mount",
    "Color",
    "Size",
    "Availability",
    "Product Type",
    "Product Tag",
    "Vendor",
  ];

  const [quickSearchEnabled, setQuickSearchEnabled] = useState(true);
  const [accordionOpen, setAccordionOpen] = useState("recommended-products");
  const [searchListingEnabled, setSearchListingEnabled] = useState(true);
  const [listingAccordionOpen, setListingAccordionOpen] = useState("template-setting");
  const [sortOption, setSortOption] = useState("Relevance");
  const [templateOption, setTemplateOption] = useState("Template 1");
  const [selectedFilterGroup, setSelectedFilterGroup] = useState("Filters");

  const quickSearchProducts = filteredProducts.slice(0, 4);

  return (
    <div className="page-section intelli-search-layout">
      <div className="surface section-header">
        <div>
          <p className="overline">Intelli Search</p>
          <h1>Intelli Search and Filter</h1>
        </div>
      </div>

      <div className="intelli-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? "intelli-tab active" : "intelli-tab"}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "quick-search-view" ? (
        <div className="quick-search-view-grid">
          <aside className="quick-search-sidebar">
            <div className="quick-search-panel">
              <div className="quick-search-panel-header">
                <h2>Quick Settings</h2>
                <div className="toggle-pill">
                  <span>Quick Search View</span>
                  <button
                    type="button"
                    className={quickSearchEnabled ? "toggle-button active" : "toggle-button"}
                    onClick={() => setQuickSearchEnabled((current) => !current)}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>
              </div>
              <div className="quick-search-accordion">
                {[
                  { key: "recommended-products", label: "Recommended Products" },
                  { key: "recommended-collections", label: "Recommended Collections" },
                  { key: "recommended-search-terms", label: "Recommended Search Terms" },
                  { key: "no-result-widget", label: "No Result Widget" },
                  { key: "selectors", label: "Selectors" },
                  { key: "template-setting", label: "Template Setting" },
                ].map((item) => (
                  <div key={item.key} className="accordion-card">
                    <button
                      type="button"
                      className="accordion-header"
                      onClick={() => setAccordionOpen(item.key)}
                    >
                      <span>{item.label}</span>
                      <span>{accordionOpen === item.key ? "−" : "+"}</span>
                    </button>
                    {accordionOpen === item.key && (
                      <div className="accordion-body">
                        <p className="small">Customize {item.label.toLowerCase()} settings.</p>
                        <button type="button" className="button-link small">Edit</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" className="btn save-btn">Save</button>
            </div>
          </aside>

          <main className="quick-search-preview">
            <div className="preview-top-card">
              <div className="search-box-mock">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            <div className="preview-grid">
              <div className="preview-columns-panel">
                <div className="preview-panel-card">
                  <h3>Recommended Collections</h3>
                  <ul className="collection-list">
                    {recommendedCollections.map((collection) => (
                      <li key={collection}>{collection}</li>
                    ))}
                  </ul>
                </div>

                <div className="preview-panel-card">
                  <h3>Previous Search History</h3>
                  <ul className="history-list">
                    {previousSearchHistory.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="preview-panel-card">
                  <h3>Trending Search Terms</h3>
                  <ul className="history-list">
                    {trendingSearchTerms.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="recommended-products-panel">
                <div className="preview-panel-card">
                  <div className="preview-panel-title-row">
                    <h3>Recommended Products</h3>
                    <span className="tag">Live</span>
                  </div>

                  <div className="recommended-product-grid">
                    {quickSearchProducts.map((product) => (
                      <div key={product.id} className="product-card preview-card">
                        <div
                          className="product-image"
                          style={{ backgroundImage: `url(${product.featuredImageUrl || "https://via.placeholder.com/400?text=Product"})` }}
                        />
                        <div className="product-info">
                          <strong>{product.title}</strong>
                          <div className="price-row">
                            <span>₹{product.price?.toFixed(2) ?? "0.00"}</span>
                            <span className="button-link">Add to Cart</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="upgrade-modal">
              <div className="upgrade-card">
                <h3>Upgrade to IntelliSearch & Filter</h3>
                <p>Advanced search and product filters feature powered by AI. Add this to get better search with analytics & upsell options.</p>
                <div className="upgrade-price">$29.99/mo</div>
                <button type="button" className="btn">Unlock Now</button>
              </div>
            </div>
          </main>
        </div>
      ) : activeTab === "search-listing-page" ? (
        <div className="search-listing-grid">
          <aside className="search-listing-sidebar">
            <div className="search-listing-panel">
              <div className="quick-search-panel-header">
                <h2>Result Settings</h2>
                <div className="toggle-pill">
                  <span>Search Listing View</span>
                  <button
                    type="button"
                    className={searchListingEnabled ? "toggle-button active" : "toggle-button"}
                    onClick={() => setSearchListingEnabled((current) => !current)}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>
              </div>

              <div className="search-listing-accordion">
                {[
                  { key: "template-setting", label: "Template Setting" },
                  { key: "filters", label: "Filters" },
                  { key: "sort-by", label: "Sort by" },
                ].map((item) => (
                  <div key={item.key} className="accordion-card">
                    <button
                      type="button"
                      className="accordion-header"
                      onClick={() => setListingAccordionOpen(item.key)}
                    >
                      <span>{item.label}</span>
                      <span>{listingAccordionOpen === item.key ? "−" : "+"}</span>
                    </button>
                    {listingAccordionOpen === item.key && (
                      <div className="accordion-body">
                        {item.key === "template-setting" && (
                          <div className="settings-options">
                            {['Template 1', 'Template 2', 'Template 3'].map((template) => (
                              <button
                                type="button"
                                key={template}
                                className={templateOption === template ? 'button-link selected' : 'button-link'}
                                onClick={() => setTemplateOption(template)}
                              >
                                {template}
                              </button>
                            ))}
                          </div>
                        )}
                        {item.key === "filters" && (
                          <div className="settings-options">
                            {listingFilterGroups[0].items.map((filter) => (
                              <button
                                key={filter}
                                type="button"
                                className={selectedFilterGroup === filter ? 'button-link selected' : 'button-link'}
                                onClick={() => setSelectedFilterGroup(filter)}
                              >
                                {filter}
                              </button>
                            ))}
                          </div>
                        )}
                        {item.key === "sort-by" && (
                          <div className="settings-options">
                            {listingFilterGroups[1].items.map((sort) => (
                              <button
                                key={sort}
                                type="button"
                                className={sortOption === sort ? 'button-link selected' : 'button-link'}
                                onClick={() => setSortOption(sort)}
                              >
                                {sort}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button type="button" className="btn save-btn">Save</button>
            </div>
          </aside>

          <main className="search-listing-preview">
            <div className="preview-top-card">
              <div className="search-box-mock">
                <input type="text" placeholder="Wiser Search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
              </div>
            </div>

            <div className="listing-body">
              <div className="filter-panel">
                <div className="filter-card">
                  {listingCategories.map((category) => (
                    <div key={category} className="filter-row">
                      <span>{category}</span>
                      <div className="filter-pill">•••</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="products-panel">
                <div className="product-grid preview-product-grid">
                  {filteredProducts.slice(0, 6).map((product) => (
                    <div key={product.id} className="product-card preview-card listing-card">
                      <div
                        className="product-image"
                        style={{ backgroundImage: `url(${product.featuredImageUrl || 'https://via.placeholder.com/400?text=Product'})` }}
                      />
                      <strong>{product.title}</strong>
                      <div className="price-row listing-price-row">
                        <span className="strike">₹{((product.price || 0) * 1.2).toFixed(2)}</span>
                        <span>₹{product.price?.toFixed(2) ?? '0.00'}</span>
                      </div>
                      <button type="button" className="button-link listing-add-button">Add to Cart</button>
                    </div>
                  ))}
                </div>
                <div className="pagination-dots">
                  {[...Array(6)].map((_, index) => (
                    <span key={index} className={index === 0 ? 'pagination-dot active' : 'pagination-dot'} />
                  ))}
                </div>
              </div>
            </div>

            <div className="upgrade-modal">
              <div className="upgrade-card">
                <h3>Upgrade to IntelliSearch & Filter</h3>
                <p>Advanced search and product filters feature powered by AI. Add this to get better search with analytics & upsell options.</p>
                <div className="upgrade-price">$29.99/mo</div>
                <button type="button" className="btn">Unlock Now</button>
              </div>
            </div>
          </main>
        </div>
      ) : activeTab === "search-settings" ? (
        <div className="search-settings-grid">
          <aside className="search-settings-sidebar">
            <div className="search-settings-panel">
              <div className="search-settings-header">
                <h2>Search Setting</h2>
                <div className="toggle-pill">
                  <span>Search Settings</span>
                  <button type="button" className={searchListingEnabled ? "toggle-button active" : "toggle-button"} onClick={() => setSearchListingEnabled((current) => !current)}>
                    <span className="toggle-knob" />
                  </button>
                </div>
              </div>

              <div className="settings-section">
                <label className="settings-label">Search Results Page</label>
                <input className="input" value="search-result" readOnly />
              </div>

              <div className="settings-row">
                <span>Search starts after typing:</span>
                <input className="input small-input" type="number" value={3} readOnly />
                <span>characters</span>
              </div>

              <div className="settings-section">
                <label className="settings-label">Default search result listing sorted by:</label>
                <button type="button" className="button-link selected">RELEVANCE</button>
              </div>

              <button type="button" className="btn save-btn">Save</button>
            </div>

            <div className="search-settings-panel">
              <div className="search-settings-header">
                <h2>Out of Stock Products</h2>
              </div>
              <p className="small">Manage Out of Stock Products</p>
              <div className="radio-group">
                <label className="radio-option">
                  <input type="radio" name="stock" checked />
                  <span>Include</span>
                </label>
                <label className="radio-option">
                  <input type="radio" name="stock" />
                  <span>Exclude</span>
                </label>
              </div>
            </div>
          </aside>

          <main className="search-settings-preview">
            <div className="search-settings-preview-top">
              <div className="preview-box">
                <h3>Excluded Settings</h3>
                <p>Exclude Products and Terms</p>
              </div>
              <div className="preview-box">
                <h3>Search Product</h3>
                <input className="input" placeholder="Search product" />
              </div>
            </div>

            <div className="search-settings-content">
              <div className="preview-card panel-card">
                <h4>Excluded Products</h4>
                <div className="placeholder-list">
                  <span>product-a</span>
                  <span>product-b</span>
                </div>
              </div>
              <div className="preview-card panel-card">
                <h4>Excluded Terms</h4>
                <div className="placeholder-list">
                  <span>shoes</span>
                  <span>sale</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <>
          <div className="intelli-overview">
            <div className="intelli-card">
              <div className="intelli-card-title">Intelli Search Revenue</div>
              <div className="intelli-card-value">₹{overview.revenue.toFixed(2)}</div>
            </div>
            <div className="intelli-card">
              <div className="intelli-card-title">Orders with Intelli Search</div>
              <div className="intelli-card-value">{overview.orders}</div>
            </div>
            <div className="intelli-card">
              <div className="intelli-card-title">Average Order Value</div>
              <div className="intelli-card-value">₹{overview.avgOrderValue.toFixed(2)}</div>
            </div>
            <div className="intelli-card">
              <div className="intelli-card-title">Product Clicks</div>
              <div className="intelli-card-value">{overview.clicks}</div>
            </div>
          </div>

          <div className="intelli-section-grid">
            <div className="intelli-panel">
              <div className="intelli-section-title">
                <h3>Filter</h3>
              </div>
              <div className="intelli-list">
                {filterItems.map((item) => (
                  <div key={item.label} className="intelli-list-item">
                    <span>{item.label}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="intelli-panel">
              <div className="intelli-section-title">
                <h3>Search Insights</h3>
              </div>
              <div className="input-group">
                <input
                  className="input"
                  placeholder="Search term"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="intelli-list">
                {searchSuggestions.map((suggestion) => (
                  <div key={suggestion.term} className="intelli-list-item">
                    <span>{suggestion.term}</span>
                    <strong>{suggestion.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="intelli-panel">
              <div className="intelli-section-title">
                <h3>No Results</h3>
              </div>
              <div className="intelli-list">
                {searchTerm ? (
                  <div className="intelli-list-item">
                    <span>{searchTerm}</span>
                    <strong>{filteredProducts.length}</strong>
                  </div>
                ) : (
                  <div className="intelli-list-item">No search term entered</div>
                )}
              </div>
            </div>
          </div>

          <div className="intelli-panel">
            <div className="intelli-section-title">
              <h3>Top Products</h3>
            </div>
            {error && <div className="warning-banner">{error}</div>}
            <div className="table-overflow">
              <table className="intelli-table">
                <thead>
                  <tr>
                    <th>Order Id</th>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Orders Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(loading ? fallbackProducts : topProducts).map((product) => (
                    <tr key={product.id}>
                      <td>{product.orderId || "—"}</td>
                      <td>{product.title}</td>
                      <td>₹{product.price?.toFixed(2) ?? "0.00"}</td>
                      <td>{product.quantity ?? 1}</td>
                      <td>{product.orderDate ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="intelli-footer-grid">
            <div className="intelli-panel">
              <div className="intelli-section-title">
                <h3>Getting Started</h3>
              </div>
              <div className="progress-row">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "33%" }} />
                </div>
                <span>1/3 Completed</span>
              </div>
              <div className="startup-list">
                <label className="startup-item">
                  <span>Enable Wiser's Search and Filter</span>
                  <button type="button" className="btn secondary">Enable</button>
                </label>
                <label className="startup-item">
                  <span>Quick Search View Setup</span>
                  <span className="status-label">Not Complete</span>
                </label>
              </div>
            </div>
            <div className="intelli-panel">
              <div className="intelli-section-title">
                <h3>Support Channels</h3>
              </div>
              <div className="support-links">
                <div className="support-link">
                  <span>Live Chat</span>
                  <button type="button" className="btn secondary">Chat Now</button>
                </div>
                <div className="support-link">
                  <span>Help & Support</span>
                  <button type="button" className="btn secondary">Help Center</button>
                </div>
                <div className="support-link">
                  <span>Schedule Call</span>
                  <button type="button" className="btn secondary">Book a Call</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
